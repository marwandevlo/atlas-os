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
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  if (!isAdminFromUser(auth.user)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const url = new URL(request.url);
  const status = (url.searchParams.get('status') ?? '').trim();
  const allowed = new Set(['pending', 'paid', 'rejected']);
  const filterStatus = allowed.has(status) ? status : '';

  let q = supabase
    .from('atlas_payment_requests')
    .select('id, user_id, plan_id, amount_mad, currency, billing_period, payment_method, manual_provider, status, created_at')
    .order('created_at', { ascending: false })
    .limit(500);

  if (filterStatus) q = q.eq('status', filterStatus);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });

  return NextResponse.json({
    paymentRequests: (data ?? []).map((r: any) => ({
      id: String(r.id),
      userId: String(r.user_id),
      planId: String(r.plan_id),
      amountMad: Number(r.amount_mad ?? 0),
      currency: String(r.currency ?? 'MAD'),
      billingPeriod: String(r.billing_period ?? 'year'),
      paymentMethod: String(r.payment_method ?? ''),
      manualProvider: r.manual_provider ?? null,
      status: String(r.status ?? ''),
      createdAt: String(r.created_at ?? ''),
    })),
  });
}

