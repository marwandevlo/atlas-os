/** Synced from Supabase subscription metadata (referral rewards). Client-only module. */

let referralExtraCompanySlots = 0;

export function setReferralExtraCompanySlotsFromServer(n: number): void {
  const v = Number.isFinite(n) ? Math.max(0, Math.min(500, Math.floor(n))) : 0;
  referralExtraCompanySlots = v;
}

export function getReferralExtraCompanySlots(): number {
  return referralExtraCompanySlots;
}
