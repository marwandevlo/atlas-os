import { trackEvent } from '@/app/lib/analytics-track';
import type { AnalyticsEventName } from '@/app/lib/analytics-track';

type MilestoneEvent = Extract<
  AnalyticsEventName,
  'onboarding_first_company_created' | 'onboarding_first_client_created' | 'onboarding_first_invoice_created'
>;

export function trackOnboardingMilestoneOnce(sessionKey: string, eventName: MilestoneEvent): void {
  if (typeof window === 'undefined') return;
  try {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    trackEvent(eventName, {});
  } catch {
    // ignore
  }
}
