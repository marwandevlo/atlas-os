import type { SupabaseClient } from '@supabase/supabase-js';
import { addDaysYmd, todayYmd, shiftYmd } from '@/app/lib/atlas-dates';
import { sendEmailViaResend, type SendEmailResult } from '@/app/lib/atlas-email-resend';
import {
  buildInactiveReminderHtml,
  buildTrialDay5EmailHtml,
  buildUpgradeEmailHtml,
  buildWelcomeEmailHtml,
} from '@/app/lib/atlas-email-templates';

export const LIFECYCLE_EMAIL_KEYS = ['welcome', 'inactive_reminder', 'trial_day5', 'upgrade_offer'] as const;
export type LifecycleEmailKey = (typeof LIFECYCLE_EMAIL_KEYS)[number];

export async function hasLifecycleEmailSent(
  admin: SupabaseClient,
  userId: string,
  emailKey: string,
): Promise<boolean> {
  const { data } = await admin
    .from('atlas_lifecycle_email_sends')
    .select('id')
    .eq('user_id', userId)
    .eq('email_key', emailKey)
    .maybeSingle();
  return !!data;
}

async function insertLifecycleSend(admin: SupabaseClient, userId: string, emailKey: string): Promise<void> {
  await admin.from('atlas_lifecycle_email_sends').insert({ user_id: userId, email_key: emailKey });
}

/**
 * Sends welcome if not already sent. Does not record send when Resend is not configured (allows retry later).
 */
export async function sendWelcomeLifecycleEmail(
  admin: SupabaseClient,
  userId: string,
  email: string,
  displayName?: string | null,
): Promise<SendEmailResult | { skipped: true; reason: string }> {
  if (await hasLifecycleEmailSent(admin, userId, 'welcome')) {
    return { skipped: true, reason: 'already_sent' };
  }
  const { subject, html } = buildWelcomeEmailHtml(displayName);
  const result = await sendEmailViaResend({ to: email, subject, html });
  if (!result.ok) {
    if ('skipped' in result && result.skipped) return result;
    return result;
  }
  await insertLifecycleSend(admin, userId, 'welcome');
  return result;
}

export async function sendInactiveReminderIfNeeded(
  admin: SupabaseClient,
  userId: string,
  email: string,
): Promise<SendEmailResult | { skipped: true; reason: string }> {
  if (await hasLifecycleEmailSent(admin, userId, 'inactive_reminder')) {
    return { skipped: true, reason: 'already_sent' };
  }
  const { data: hit } = await admin
    .from('events')
    .select('id')
    .eq('user_id', userId)
    .eq('event_name', 'onboarding_completed')
    .limit(1)
    .maybeSingle();
  if (hit) return { skipped: true, reason: 'user_onboarded' };

  const { subject, html } = buildInactiveReminderHtml();
  const result = await sendEmailViaResend({ to: email, subject, html });
  if (!result.ok) {
    if ('skipped' in result && result.skipped) return result;
    return result;
  }
  await insertLifecycleSend(admin, userId, 'inactive_reminder');
  return result;
}

export async function sendTrialDay5IfNeeded(
  admin: SupabaseClient,
  userId: string,
  email: string,
  trialStartYmd: string,
  trialEndYmd: string,
): Promise<SendEmailResult | { skipped: true; reason: string }> {
  if (await hasLifecycleEmailSent(admin, userId, 'trial_day5')) {
    return { skipped: true, reason: 'already_sent' };
  }
  const today = todayYmd();
  const day5 = addDaysYmd(trialStartYmd, 4);
  if (today !== day5) return { skipped: true, reason: 'not_day5' };

  const { subject, html } = buildTrialDay5EmailHtml(trialEndYmd);
  const result = await sendEmailViaResend({ to: email, subject, html });
  if (!result.ok) {
    if ('skipped' in result && result.skipped) return result;
    return result;
  }
  await insertLifecycleSend(admin, userId, 'trial_day5');
  return result;
}

export async function sendUpgradeOfferIfNeeded(
  admin: SupabaseClient,
  userId: string,
  email: string,
  trialEndYmd: string,
): Promise<SendEmailResult | { skipped: true; reason: string }> {
  if (await hasLifecycleEmailSent(admin, userId, 'upgrade_offer')) {
    return { skipped: true, reason: 'already_sent' };
  }
  const today = todayYmd();
  const upgradeDay = shiftYmd(trialEndYmd, -1);
  if (today !== upgradeDay) return { skipped: true, reason: 'not_upgrade_day' };

  const { subject, html } = buildUpgradeEmailHtml();
  const result = await sendEmailViaResend({ to: email, subject, html });
  if (!result.ok) {
    if ('skipped' in result && result.skipped) return result;
    return result;
  }
  await insertLifecycleSend(admin, userId, 'upgrade_offer');
  return result;
}
