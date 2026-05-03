/**
 * Referrer reward tiers (activated referrals = filleul completed checklist).
 * Totals are cumulative program caps — delta vs last applied is credited on each activation.
 */
export const REFERRAL_TIER_MILESTONES = [1, 3, 5] as const;

/** Total trial extension days granted by the tier program at this activated count. */
export function getTierProgramTotalDays(activatedCount: number): number {
  const n = Math.max(0, Math.floor(activatedCount));
  if (n >= 5) return 50;
  if (n >= 3) return 20;
  if (n >= 1) return 7;
  return 0;
}

/** Next milestone count toward a higher tier (null = all tiers reached). */
export function getNextReferralMilestone(activatedCount: number): number | null {
  const n = Math.max(0, Math.floor(activatedCount));
  if (n < 1) return 1;
  if (n < 3) return 3;
  if (n < 5) return 5;
  return null;
}

/** e.g. "1/3" toward next tier, or "5/5" when maxed. */
export function getReferralProgressLabel(activatedCount: number): { text: string; barPercent: number } {
  const n = Math.max(0, Math.floor(activatedCount));
  const next = getNextReferralMilestone(n);
  if (next === null) {
    return { text: '5/5', barPercent: 100 };
  }
  const pct = next > 0 ? Math.min(100, Math.round((n / next) * 1000) / 10) : 0;
  return { text: `${n}/${next}`, barPercent: pct };
}

export function isReferralBonusFeaturesUnlocked(activatedCount: number): boolean {
  return Math.max(0, Math.floor(activatedCount)) >= 5;
}
