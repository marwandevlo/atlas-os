import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';

function requireBearer(request: NextRequest): string | null {
  const auth = request.headers.get('authorization') ?? '';
  if (!auth.toLowerCase().startsWith('bearer ')) return null;
  const token = auth.slice(7).trim();
  return token || null;
}

function isAdminFromUser(user: { app_metadata?: Record<string, unknown> } | null): boolean {
  return (user?.app_metadata?.role as string | undefined) === 'admin';
}

export type FunnelStatsResponse = {
  windowDays: number;
  counts: Record<string, number>;
  signups: number;
  onboardingStarted: number;
  onboardingCompleted: number;
  landingViews: number;
  pricingViews: number;
  upgradeClicks: number;
  trialBannerClicks: number;
  /** signup_completed / view_landing */
  landingToSignupRate: number | null;
  /** onboarding_completed / signup_completed */
  signupToOnboardingRate: number | null;
  /** Same basis as landingToSignupRate — headline KPI for internal reporting */
  conversionRateEstimate: number | null;
  warnings?: string[];
};

export async function GET(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ error: 'not_enabled' }, { status: 400 });
  }

  const token = requireBearer(request);
  if (!token) return NextResponse.json({ error: 'auth_required' }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

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
        error: 'server_misconfigured',
        message: 'SUPABASE_SERVICE_ROLE_KEY required for analytics aggregates',
      } satisfies Record<string, string>,
      { status: 503 },
    );
  }

  const windowDays = Math.min(90, Math.max(1, Number.parseInt(request.nextUrl.searchParams.get('days') ?? '30', 10) || 30));
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - windowDays);
  const sinceIso = since.toISOString();

  const admin = createClient(supabaseUrl, serviceRoleKey);
  const { data: rows, error } = await admin
    .from('events')
    .select('event_name')
    .gte('created_at', sinceIso);

  if (error) {
    return NextResponse.json({ error: 'db_error' }, { status: 500 });
  }

  const counts: Record<string, number> = {};
  for (const r of rows ?? []) {
    const name = String((r as { event_name?: string }).event_name ?? '');
    if (!name) continue;
    counts[name] = (counts[name] ?? 0) + 1;
  }

  const landingViews = counts.view_landing ?? 0;
  const signups = counts.signup_completed ?? 0;
  const onboardingStarted = counts.onboarding_started ?? 0;
  const onboardingCompleted = counts.onboarding_completed ?? 0;
  const pricingViews = counts.view_pricing ?? 0;
  const upgradeClicks = counts.upgrade_clicked ?? 0;
  const trialBannerClicks = counts.trial_banner_clicked ?? 0;

  const landingToSignupRate = landingViews > 0 ? signups / landingViews : null;
  const signupToOnboardingRate = signups > 0 ? onboardingCompleted / signups : null;

  const body: FunnelStatsResponse = {
    windowDays,
    counts,
    signups,
    onboardingStarted,
    onboardingCompleted,
    landingViews,
    pricingViews,
    upgradeClicks,
    trialBannerClicks,
    landingToSignupRate,
    signupToOnboardingRate,
    conversionRateEstimate: landingToSignupRate,
  };

  return NextResponse.json(body);
}
