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

function pickCompanyName(companyJson: any): string {
  if (!companyJson || typeof companyJson !== 'object') return '';
  const name =
    (companyJson as any).name ??
    (companyJson as any).companyName ??
    (companyJson as any).legalName ??
    (companyJson as any).raisonSociale ??
    '';
  return typeof name === 'string' ? name : '';
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
        companies: [],
        warning: 'SUPABASE_SERVICE_ROLE_KEY not set; companies list requires privileged access.',
      },
      { status: 200 },
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

  const { data: companies, error } = await supabaseAdmin
    .from('atlas_companies')
    .select('id, user_id, company_json, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  // Optional: try to infer a plan from the user's latest subscription.
  const userIds = Array.from(new Set((companies ?? []).map((c: any) => String(c.user_id ?? '')).filter(Boolean)));
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

  return NextResponse.json({
    companies: (companies ?? []).map((c: any) => {
      const uid = String(c.user_id ?? '');
      const snap = latestByUser.get(uid);
      return {
        id: String(c.id),
        userId: uid,
        name: pickCompanyName(c.company_json),
        createdAt: String(c.created_at ?? ''),
        planId: snap?.plan_id,
      };
    }),
  });
}

