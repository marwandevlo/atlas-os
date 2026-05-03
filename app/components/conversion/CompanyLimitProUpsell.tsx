'use client';

import { useRouter } from 'next/navigation';
import { BriefcaseBusiness, Layers, Sparkles } from 'lucide-react';
import { ATLAS_COMPANY_SLOT_ADDONS } from '@/app/lib/atlas-company-addons';
import { trackEvent } from '@/app/lib/analytics-track';

type Props = {
  /** Total allowed companies (Pro base + add-ons). */
  effectiveLimit: number;
  /** Pro base before extensions (e.g. 25). */
  baseIncluded: number;
};

/**
 * Shown when Pro société cap is reached — add-ons are visually separate from main plans (Cabinet = Business).
 */
export function CompanyLimitProUpsell({ effectiveLimit, baseIncluded }: Props) {
  const router = useRouter();

  return (
    <div className="rounded-2xl border border-indigo-200 bg-linear-to-br from-indigo-50/95 to-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Layers size={20} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Options payantes · hors forfait</p>
          <p className="text-base font-bold text-slate-900 mt-1">
            Vous avez atteint la limite de {effectiveLimit} entreprises
          </p>
          <p className="text-sm text-slate-600 mt-1">
            Forfait Pro : {baseIncluded} sociétés incluses
            {effectiveLimit > baseIncluded ? (
              <span className="text-indigo-700 font-medium"> + {effectiveLimit - baseIncluded} via extensions</span>
            ) : null}
            . Ajoutez des emplacements ou passez à l’offre Cabinet pour de plus gros volumes.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ATLAS_COMPANY_SLOT_ADDONS.map((addon) => (
          <button
            key={addon.id}
            type="button"
            onClick={() => {
              trackEvent('upgrade_clicked', { surface: 'company_limit', target: 'addon', addonId: addon.id });
              router.push(`/payment?addon=${encodeURIComponent(addon.id)}`);
            }}
            className="text-left rounded-xl border border-slate-200 bg-white p-4 hover:border-indigo-300 hover:shadow-md transition-all"
          >
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Extension Pro</p>
            <p className="text-sm font-bold text-slate-900 mt-1">{addon.labelFr}</p>
            <p className="text-xs text-slate-500 mt-1">{addon.descriptionFr}</p>
            <p className="text-sm font-extrabold text-indigo-700 mt-3">
              {addon.priceMadYear.toLocaleString('fr-MA')} MAD<span className="text-slate-400 font-normal">/an</span>
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600">
              {addon.ctaLabel} <Sparkles size={12} />
            </span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => {
            trackEvent('upgrade_clicked', { surface: 'company_limit', target: 'cabinet_pricing' });
            router.push('/pricing');
          }}
          className="text-left rounded-xl border-2 border-violet-200 bg-violet-50/80 p-4 hover:bg-violet-50 transition-all"
        >
          <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide">Changer de forfait</p>
          <p className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
            <BriefcaseBusiness size={16} className="text-violet-600" />
            Passer à Cabinet
          </p>
          <p className="text-xs text-slate-600 mt-1">Offre Business — jusqu’à 70 sociétés, pensée cabinets & groupes.</p>
          <span className="mt-3 inline-block text-xs font-bold text-violet-800">Voir les tarifs →</span>
        </button>
      </div>
    </div>
  );
}
