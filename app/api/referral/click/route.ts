import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { checkPaymentRateLimit } from '@/app/lib/payment-rate-limit';
import { insertReferralClick, resolveReferrerUserId } from '@/app/lib/atlas-referral-server';
import { normalizeReferralCode } from '@/app/lib/atlas-referral-utils';

function clientIp(request: NextRequest): string {
  const xf = request.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]?.trim() || 'unknown';
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const ip = clientIp(request);
  const rate = checkPaymentRateLimit(`referral_click:${ip}`);
  if (!rate.ok) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ ok: false, error: 'misconfigured' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as null | { code?: string };
  const code = normalizeReferralCode(body?.code ?? '');
  if (!code) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const referrerId = await resolveReferrerUserId(admin, code);
    if (!referrerId) {
      return NextResponse.json({ ok: true, ignored: true });
    }
    await insertReferralClick(admin, referrerId, code);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true, skipped: true });
  }
}
