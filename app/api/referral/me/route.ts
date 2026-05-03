import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import {
  countActivatedReferralsForReferrer,
  ensureReferralCodeForUser,
} from '@/app/lib/atlas-referral-server';
import { getNextReferralMilestone, getReferralProgressLabel, getTierProgramTotalDays } from '@/app/lib/atlas-referral-tiers';
import { recordServerAnalyticsEvent } from '@/app/lib/server-analytics-event';

export async function GET(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: false, error: 'not_enabled' }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'misconfigured' }, { status: 503 });
  }

  const cookieStore = await cookies();
  const supabaseUser = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });

  const { data: authData, error: authErr } = await supabaseUser.auth.getUser();
  const user = authData?.user;
  if (authErr || !user?.id) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { code, created } = await ensureReferralCodeForUser(admin, user.id);
    if (created) {
      void recordServerAnalyticsEvent(admin, {
        userId: user.id,
        eventName: 'referral_link_created',
        path: '/api/referral/me',
        metadata: { referral_code: code },
      });
    }
    const origin = request.nextUrl.origin;
    const signupPath = `/signup?ref=${encodeURIComponent(code)}`;
    const signupUrl = `${origin}${signupPath}`;
    const activatedReferrals = await countActivatedReferralsForReferrer(admin, user.id);
    const nextMilestone = getNextReferralMilestone(activatedReferrals);
    const { text: progressLabel, barPercent: progressBarPercent } = getReferralProgressLabel(activatedReferrals);
    const currentTierRewardDays = getTierProgramTotalDays(activatedReferrals);
    const maxTierReached = nextMilestone === null;

    return NextResponse.json({
      ok: true,
      code,
      signupPath,
      signupUrl,
      activatedReferrals,
      nextMilestone,
      progressLabel,
      progressBarPercent,
      currentTierRewardDays,
      maxTierReached,
      bonusFeaturesUnlocked: activatedReferrals >= 5,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
