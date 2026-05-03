import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { getCompanyAddonById } from '@/app/lib/atlas-company-addons';
import { getAtlasPlanById } from '@/app/lib/atlas-pricing-plans';
import { checkPaymentRateLimit } from '@/app/lib/payment-rate-limit';

type ManualProvider = 'cashplus' | 'wafacash' | 'western_union';

function requireBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ error: 'not_enabled' }, { status: 400 });
  }

  const token = requireBearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const rate = checkPaymentRateLimit(`payreq:${auth.user.id}`);
  if (!rate.ok) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } });
  }

  const body = (await request.json().catch(() => null)) as null | {
    planId?: string;
    addonId?: string;
    provider?: ManualProvider;
  };
  const planId = (body?.planId ?? '').trim();
  const addonId = (body?.addonId ?? '').trim();
  const provider = body?.provider;

  const addon = addonId ? getCompanyAddonById(addonId) : undefined;
  const plan = planId ? getAtlasPlanById(planId) : undefined;

  if (addonId && !addon) return NextResponse.json({ error: 'invalid_addon' }, { status: 400 });
  if (!addonId && (!plan || !planId)) return NextResponse.json({ error: 'invalid_plan' }, { status: 400 });
  if (addonId && planId) return NextResponse.json({ error: 'invalid_request' }, { status: 400 });
  if (!provider || !['cashplus', 'wafacash', 'western_union'].includes(provider)) {
    return NextResponse.json({ error: 'invalid_provider' }, { status: 400 });
  }

  const insertRow = addon
    ? {
        user_id: auth.user.id,
        plan_id: 'pro',
        amount_mad: addon.priceMadYear,
        currency: 'MAD' as const,
        billing_period: 'year',
        payment_method: 'manual' as const,
        manual_provider: provider,
        status: 'pending' as const,
        metadata: {
          kind: 'company_slot_addon',
          addonId: addon.id,
          extraSlots: addon.extraSlots,
        },
      }
    : {
        user_id: auth.user.id,
        plan_id: plan!.id,
        amount_mad: plan!.price,
        currency: plan!.currency,
        billing_period: plan!.billingPeriod,
        payment_method: 'manual' as const,
        manual_provider: provider,
        status: 'pending' as const,
        metadata: {},
      };

  const { data, error } = await supabase
    .from('atlas_payment_requests')
    .insert(insertRow)
    .select('id')
    .single();

  if (error) return NextResponse.json({ error: 'db_error' }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

