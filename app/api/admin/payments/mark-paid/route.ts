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

function isUuidLike(value: string): boolean {
  // Accept standard UUIDs (case-insensitive).
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') return NextResponse.json({ error: 'not_enabled' }, { status: 400 });

  const token = requireBearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });
  if (!isAdminFromUser(auth.user)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = (await request.json().catch(() => null)) as null | { paymentRequestId?: string };
  const paymentRequestId = (body?.paymentRequestId ?? '').trim();
  if (!paymentRequestId) return NextResponse.json({ error: 'invalid_reference' }, { status: 400 });
  if (!isUuidLike(paymentRequestId)) return NextResponse.json({ error: 'invalid_reference' }, { status: 400 });

  const { data, error } = await supabase
    .from('atlas_payment_requests')
    .update({ status: 'paid' })
    .eq('id', paymentRequestId)
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  if (!data?.id) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json({ ok: true });
}

