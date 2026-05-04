import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';

function requireBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  return auth.slice(7).trim() || null;
}

function isAdminFromUser(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  const r = String((user?.app_metadata?.role as string | undefined) ?? '');
  return r === 'admin' || r === 'owner';
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ error: 'not_enabled' }, { status: 400 });
  }

  const token = requireBearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  if (!isAdminFromUser(auth.user)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = (await request.json().catch(() => null)) as null | { id?: string };
  const id = String(body?.id ?? '').trim();
  if (!id || !isUuid(id)) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) return NextResponse.json({ error: 'server_misconfigured' }, { status: 503 });

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { error } = await admin
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('id', id)
    .in('status', ['pending_manual']);

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({ ok: true });
}
