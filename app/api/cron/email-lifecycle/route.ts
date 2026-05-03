import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { atlasDataBackend } from '@/app/lib/atlas-data-source';
import {
  sendInactiveReminderIfNeeded,
  sendTrialDay5IfNeeded,
  sendUpgradeOfferIfNeeded,
  sendWelcomeLifecycleEmail,
} from '@/app/lib/atlas-lifecycle-email';

const FREE_TRIAL = 'free-trial';
/** Inactivity reminder: only users whose account is at least 2 days old (and still no onboarding_completed). */
const TWO_DAYS_MS = 48 * 60 * 60 * 1000;
const MAX_USERS_PER_RUN = 250;

function verifyCron(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = request.headers.get('authorization') ?? '';
  return auth === `Bearer ${secret}`;
}

export async function GET(request: NextRequest) {
  if (atlasDataBackend() !== 'supabase') {
    return NextResponse.json({ ok: false, error: 'not_enabled' }, { status: 400 });
  }
  if (!verifyCron(request)) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE ?? '';
  if (!serviceRoleKey) {
    return NextResponse.json({ ok: false, error: 'server_misconfigured' }, { status: 503 });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: subs, error: subsErr } = await admin
    .from('atlas_subscriptions')
    .select('user_id, plan_id, status, start_date, end_date')
    .eq('plan_id', FREE_TRIAL)
    .in('status', ['trial', 'active'])
    .limit(MAX_USERS_PER_RUN);

  if (subsErr) {
    return NextResponse.json({ ok: false, error: 'subs_read_failed' }, { status: 500 });
  }

  const summary = {
    welcome: 0,
    inactive_reminder: 0,
    trial_day5: 0,
    upgrade_offer: 0,
    errors: 0,
  };

  const seen = new Set<string>();
  for (const row of subs ?? []) {
    const userId = String((row as { user_id?: string }).user_id ?? '');
    if (!userId || seen.has(userId)) continue;
    seen.add(userId);

    const startDate = String((row as { start_date?: string }).start_date ?? '');
    const endDate = String((row as { end_date?: string }).end_date ?? '');
    if (!startDate || !endDate) continue;

    const { data: full, error: uErr } = await admin.auth.admin.getUserById(userId);
    if (uErr || !full.user?.email) {
      summary.errors += 1;
      continue;
    }
    const email = full.user.email;
    const createdMs = new Date(full.user.created_at ?? 0).getTime();
    const meta = full.user.user_metadata as Record<string, unknown> | undefined;
    const displayName = typeof meta?.full_name === 'string' ? meta.full_name : typeof meta?.name === 'string' ? meta.name : null;

    try {
      const w = await sendWelcomeLifecycleEmail(admin, userId, email, displayName);
      if ('ok' in w && w.ok) summary.welcome += 1;
    } catch {
      summary.errors += 1;
    }

    if (Number.isFinite(createdMs) && Date.now() - createdMs >= TWO_DAYS_MS) {
      try {
        const r = await sendInactiveReminderIfNeeded(admin, userId, email);
        if ('ok' in r && r.ok) summary.inactive_reminder += 1;
      } catch {
        summary.errors += 1;
      }
    }

    try {
      const t = await sendTrialDay5IfNeeded(admin, userId, email, startDate, endDate);
      if ('ok' in t && t.ok) summary.trial_day5 += 1;
    } catch {
      summary.errors += 1;
    }

    try {
      const u = await sendUpgradeOfferIfNeeded(admin, userId, email, endDate);
      if ('ok' in u && u.ok) summary.upgrade_offer += 1;
    } catch {
      summary.errors += 1;
    }
  }

  return NextResponse.json({ ok: true, processedUsers: seen.size, summary });
}
