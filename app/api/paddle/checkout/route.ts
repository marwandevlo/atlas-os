import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import { getAtlasPlanById } from '@/app/lib/atlas-pricing-plans';

function bearer(request: NextRequest): string | null {
  const h = request.headers.get('authorization') ?? '';
  if (!h.toLowerCase().startsWith('bearer ')) return null;
  const t = h.slice(7).trim();
  return t || null;
}

/**
 * Prepares Paddle checkout parameters for the client (Paddle.js overlay / inline checkout).
 * Server-side transaction creation can extend this route when `PADDLE_API_KEY` is wired.
 */
export async function POST(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ error: 'not_enabled' }, { status: 400 });
  }

  const token = bearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: auth } = await userClient.auth.getUser();
  if (!auth.user?.id) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const body = (await request.json().catch(() => null)) as null | { planId?: string };
  const planId = String(body?.planId ?? '').trim();
  const plan = getAtlasPlanById(planId);
  if (!plan || plan.billingPeriod === 'trial') {
    return NextResponse.json({ error: 'invalid_plan' }, { status: 400 });
  }

  const paddleKey = process.env.PADDLE_API_KEY?.trim();
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN?.trim();
  const priceMap: Record<string, string | undefined> = {
    starter: process.env.PADDLE_PRICE_STARTER_ID?.trim(),
    pro: process.env.PADDLE_PRICE_PRO_ID?.trim(),
    business: process.env.PADDLE_PRICE_BUSINESS_ID?.trim(),
  };
  const priceId = priceMap[planId];

  if (!paddleKey || !clientToken || !priceId) {
    return NextResponse.json(
      {
        error: 'paddle_not_configured',
        message:
          'Set PADDLE_API_KEY, NEXT_PUBLIC_PADDLE_CLIENT_TOKEN, and PADDLE_PRICE_*_ID env vars. Use Paddle.js on the client with custom_data: { user_id, plan_id, email }.',
        planId,
        docs: 'https://developer.paddle.com/build/checkout/set-up-checkout-default-url',
      },
      { status: 501 },
    );
  }

  return NextResponse.json({
    clientToken,
    priceId,
    customData: {
      user_id: auth.user.id,
      plan_id: planId,
      email: auth.user.email ?? '',
    },
    environment: process.env.PADDLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox',
  });
}
