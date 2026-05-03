import { getAtlasPlanById } from '@/app/lib/atlas-pricing-plans';

export const MANUAL_SUBSCRIPTION_PLANS = ['starter', 'pro', 'business', 'cabinet'] as const;
export type ManualSubscriptionPlan = (typeof MANUAL_SUBSCRIPTION_PLANS)[number];

export type ManualSubscriptionStatus = 'pending_manual' | 'active' | 'canceled';

/** Maps UI label "cabinet" to catalog plan id `business`. */
export function normalizeManualPlan(plan: string): 'starter' | 'pro' | 'business' | null {
  const p = plan.trim().toLowerCase();
  if (p === 'cabinet') return 'business';
  if (p === 'starter' || p === 'pro' || p === 'business') return p;
  return null;
}

export function planDisplayName(plan: string): string {
  const id = normalizeManualPlan(plan) ?? plan;
  const def = getAtlasPlanById(id);
  if (def) return def.name;
  if (plan.toLowerCase() === 'cabinet') return 'Cabinet';
  return plan;
}

export function buildManualSubscriptionWhatsAppUrl(params: {
  /** E.164 without + e.g. 212612345678 */
  phoneDigits: string;
  planLabel: string;
  userEmail: string;
}): string {
  const line1 = `Bonjour, je veux souscrire au plan ${params.planLabel} sur ZAFIRIX PRO.`;
  const line2 = `Mon email: ${params.userEmail}`;
  const text = encodeURIComponent(`${line1}\n${line2}`);
  const digits = params.phoneDigits.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${text}`;
}

/** Deep link only; replace with WhatsApp Cloud / Business API outbound sends when you add server-side messaging. */
export function getManualWhatsAppPhoneDigits(): string {
  const raw =
    process.env.NEXT_PUBLIC_MANUAL_PAYMENT_WHATSAPP_E164?.trim() ||
    process.env.NEXT_PUBLIC_ZAFIRIX_WHATSAPP_E164?.trim() ||
    '212600000000';
  return raw.replace(/^\+/, '').replace(/\D/g, '') || '212600000000';
}
