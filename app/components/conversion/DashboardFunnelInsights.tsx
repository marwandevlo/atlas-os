'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, Lock, Sparkles } from 'lucide-react';
import { getTrialCountdown } from '@/app/lib/atlas-usage-limits';
import { trackEvent } from '@/app/lib/analytics-track';

type Props = {
  lang: 'fr' | 'ar';
  /** Count of upcoming fiscal deadlines shown on dashboard (static list length or urgent subset). */
  pendingDeclarationsCount: number;
};

export function DashboardFunnelInsights({ lang, pendingDeclarationsCount }: Props) {
  const router = useRouter();
  const t = (fr: string, ar: string) => (lang === 'ar' ? ar : fr);
  const tc = useMemo(() => getTrialCountdown(), []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <div className="rounded-xl border border-indigo-100 bg-linear-to-br from-indigo-50/90 to-white px-4 py-3 flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
          <Calendar size={16} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-indigo-950">{t('Rappels & échéances', 'تذكير ومواعيد')}</p>
          <p className="text-xs text-indigo-900/75 mt-0.5">
            {t(
              `Vous avez ${pendingDeclarationsCount} échéance(s) à planifier ce mois — gardez vos déclarations sous contrôle.`,
              `لديك ${pendingDeclarationsCount} موعداً يجب تخطيطه هذا الشهر — حافظ على التصاريح تحت السيطرة.`,
            )}
          </p>
          <button
            type="button"
            onClick={() => router.push('/tva')}
            className="mt-2 text-xs font-bold text-indigo-700 hover:underline"
          >
            {t('Voir TVA & calendrier', 'عرض TVA والتقويم')}
          </button>
        </div>
      </div>

      {tc.isTrial && (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-3 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Lock size={16} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              {t('Fonctions Pro', 'مزايا Pro')}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {t(
                'Passez à la version Pro pour débloquer volumes, utilisateurs et opérations sans plafond bloquant.',
                'انتقل إلى Pro لفتح الحدود للمستخدمين والعمليات.',
              )}
            </p>
            <button
              type="button"
              onClick={() => {
                trackEvent('upgrade_clicked', { surface: 'dashboard_insights', target: 'pricing' });
                router.push('/pricing');
              }}
              className="mt-2 text-xs font-bold text-slate-800 hover:underline"
            >
              {t('Comparer les offres', 'قارن العروض')}
            </button>
          </div>
        </div>
      )}

      <div className="lg:col-span-2 flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 py-2 px-3 text-center">
        <Bell size={14} className="text-slate-400 shrink-0" />
        <p className="text-[11px] text-slate-500">
          {t('Conçu pour le Maroc · PME & cabinets · interface FR/AR', 'مصمم للمغرب · الشركات والمكاتب · FR/AR')}
        </p>
      </div>
    </div>
  );
}
