/**
 * Single source of truth for ZAFIRIX PRO referral rewards and copy.
 * Referrer **tier** totals (activated filleuls) live in `app/lib/atlas-referral-tiers.ts`.
 */
export const ATLAS_REFERRAL_CONFIG = {
  /** Bonus calendar days added to the referred user's free trial (after signup + attach). */
  referredWelcomeBonusTrialDays: 7,
  /** Reward for the referrer when the referred user reaches "activated". */
  referrerReward: {
    /** `trial_days` = tiered extension on referrer free-trial (see tiers). `company_slots` = flat add-on per activation. */
    mode: 'trial_days' as 'trial_days' | 'company_slots',
    /** Used only when mode is company_slots (each activation). */
    extraCompanySlots: 3,
  },
  /** SessionStorage key for pending ?ref= code until signup/login completes. */
  pendingCodeStorageKey: 'atlas_ref_code',
  /** After onboarding completion, open referral celebrate modal once (`pending` / `done`). */
  postOnboardingReferralKey: 'zafirix_referral_celebrate',
} as const;
