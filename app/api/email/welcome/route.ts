import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { sendWelcomeLifecycleEmail } from '@/app/lib/atlas-lifecycle-email';

function bearer(request: NextRequest): string | null {
  const h = request.headers.get('authorization') ?? '';
  if (!h.toLowerCase().startsWith('bearer ')) return null;
  const t = h.slice(7).trim();
  return t || null;
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: false, error: 'not_enabled' }, { status: 400 });
  }

  const token = bearer(request);
  if (!token) return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';

  if (!serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 });
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth, error: authErr } = await userClient.auth.getUser();
  if (authErr || !auth.user?.id) {
    return NextResponse.json({ ok: false, error: 'auth_required' }, { status: 401 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: full, error: uErr } = await admin.auth.admin.getUserById(auth.user.id);
  if (uErr || !full.user?.email) {
    return NextResponse.json({ ok: false, error: 'user_lookup_failed' }, { status: 400 });
  }

  const meta = full.user.user_metadata as Record<string, unknown> | undefined;
  const displayName = typeof meta?.full_name === 'string' ? meta.full_name : typeof meta?.name === 'string' ? meta.name : null;

  const result = await sendWelcomeLifecycleEmail(admin, full.user.id, full.user.email, displayName);

  if ('skipped' in result && result.skipped) {
    return NextResponse.json({ ok: true, skipped: true, reason: result.reason });
  }
  if ('ok' in result && !result.ok && 'error' in result) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sent: true });
}
