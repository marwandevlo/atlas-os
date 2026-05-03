/**
 * @deprecated Import `trackEvent` from `@/app/lib/analytics-track` instead.
 * Re-exports kept for backwards compatibility.
 */
export {
  trackEvent,
  ANALYTICS_EVENT_NAMES as FUNNEL_EVENT_NAMES,
  type AnalyticsEventName as FunnelEventName,
} from '@/app/lib/analytics-track';

import type { AnalyticsEventName } from '@/app/lib/analytics-track';
import { trackEvent } from '@/app/lib/analytics-track';

export function trackFunnelEvent(
  event: AnalyticsEventName,
  metadata: Record<string, unknown> = {},
): void {
  trackEvent(event, metadata);
}
