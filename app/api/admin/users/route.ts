import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';

function requireBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

function isAdminFromUser(user: any): boolean {
  return user?.app_metadata?.role === 'admin';
}

export async function GET(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') return NextResponse.json({ error: 'not_enabled' }, { status: 400 });

  const token = requireBearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Verify requester (must be admin) using their JWT.
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth } = await supabaseUser.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  if (!isAdminFromUser(auth.user)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) {
    return NextResponse.json(
      {
        users: [],
        warning: 'SUPABASE_SERVICE_ROLE_KEY not set; users list requires Supabase Admin API.',
      },
      { status: 200 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);
  const users: any[] = [];

  // Fetch up to 1000 users (enough for local/dev).
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return NextResponse.json({ error: 'admin_api_error' }, { status: 500 });

  const all = data?.users ?? [];
  const userIds = all.map((u) => u.id);

  // Subscription snapshot per user (plan_id/status). Admin select is allowed by RLS, but
  // using service-role avoids any policy misconfiguration.
  const { data: subs } = await supabaseAdmin
    .from('atlas_subscriptions')
    .select('user_id, plan_id, status, created_at')
    .in('user_id', userIds)
    .order('created_at', { ascending: false });

  const latestByUser = new Map<string, { plan_id: string; status: string }>();
  for (const s of subs ?? []) {
    const uid = String((s as any).user_id ?? '');
    if (!uid || latestByUser.has(uid)) continue;
    latestByUser.set(uid, { plan_id: String((s as any).plan_id ?? ''), status: String((s as any).status ?? '') });
  }

  for (const u of all) {
    const role = String((u as any).app_metadata?.role ?? 'user');
    const snap = latestByUser.get(u.id);
    users.push({
      id: u.id,
      email: u.email ?? '',
      role,
      planId: snap?.plan_id,
      subscriptionStatus: snap?.status,
    });
  }

  return NextResponse.json({ users });
}

