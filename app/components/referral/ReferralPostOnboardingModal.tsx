'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { ATLAS_REFERRAL_CONFIG } from '@/app/lib/atlas-referral-config';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { ReferralDashboardCard } from '@/app/components/referral/ReferralDashboardCard';

type Props = {
  lang: 'fr' | 'ar';
};

const KEY = ATLAS_REFERRAL_CONFIG.postOnboardingReferralKey;

function readReferralModalShouldOpen(): boolean {
  if (typeof window === 'undefined') return false;
  if (!isAtlasSupabaseDataEnabled()) return false;
  try {
    return sessionStorage.getItem(KEY) === 'pending';
  } catch {
    return false;
  }
}

/**
 * Shown after onboarding when `sessionStorage` was set to `pending` (see onboarding `finish`).
 * Loaded with `dynamic(..., { ssr: false })` from the home page so the lazy initializer runs only in the browser
 * and can read `sessionStorage` without `setState` in `useEffect`.
 */
export function ReferralPostOnboardingModal({ lang }: Props) {
  const [open, setOpen] = useState(() => readReferralModalShouldOpen());

  if (!isAtlasSupabaseDataEnabled() || !open) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(KEY, 'done');
    } catch {
      // ignore
    }
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={dismiss}
          className="absolute top-3 right-3 p-2 rounded-lg text-slate-500 hover:bg-slate-100 z-10"
          aria-label="Fermer"
        >
          <X size={20} />
        </button>
        <div className="p-5 pt-12">
          <p className="text-sm font-bold text-slate-900 mb-1">
            {lang === 'ar' ? 'مزيان! دابا زيد تربح أيام مجانية' : 'Bravo ! Gagnez des jours gratuits en parrainant'}
          </p>
          <p className="text-xs text-slate-600 mb-4">
            {lang === 'ar'
              ? 'شارك مع صاحبك باش يجرب ZAFIRIX PRO — وانت تزادلك مدة التجربة فالآنية.'
              : 'Invitez un proche : bonus d’essai appliqué tout de suite à chaque palier.'}
          </p>
          <ReferralDashboardCard lang={lang} compact />
        </div>
      </div>
    </div>
  );
}
