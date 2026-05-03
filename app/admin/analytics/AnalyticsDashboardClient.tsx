'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BarChart3, RefreshCw } from 'lucide-react';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';
import { supabase } from '@/app/lib/supabase';
import { readLocalFunnelEvents } from '@/app/lib/atlas-funnel-local-buffer';
import type { FunnelStatsResponse } from '@/app/api/admin/funnel-stats/route';

function aggregateLocal(windowDays: number): FunnelStatsResponse {
  const since = Date.now() - windowDays * 24 * 60 * 60 * 1000;
  const rows = readLocalFunnelEvents().filter((r) => new Date(r.created_at).getTime() >= since);
  const counts: Record<string, number> = {};
  for (const r of rows) {
    counts[r.event_name] = (counts[r.event_name] ?? 0) + 1;
  }
  const landingViews = counts.view_landing ?? 0;
  const signups = counts.signup_completed ?? 0;
  const onboardingStarted = counts.onboarding_started ?? 0;
  const onboardingCompleted = counts.onboarding_completed ?? 0;
  const pricingViews = counts.view_pricing ?? 0;
  const upgradeClicks = counts.upgrade_clicked ?? 0;
  const trialBannerClicks = counts.trial_banner_clicked ?? 0;
  const landingToSignupRate = landingViews > 0 ? signups / landingViews : null;
  return {
    windowDays,
    counts,
    signups,
    onboardingStarted,
    onboardingCompleted,
    landingViews,
    pricingViews,
    upgradeClicks,
    trialBannerClicks,
    landingToSignupRate,
    signupToOnboardingRate: signups > 0 ? onboardingCompleted / signups : null,
    conversionRateEstimate: landingToSignupRate,
    referralClicksDb: 0,
    referralLinkedSignupsDb: 0,
    referralActivatedDb: 0,
    referralRewardsGrantedDb: 0,
  };
}

function pct(n: number | null): string {
  if (n === null || Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)} %`;
}

export default function AnalyticsDashboardClient() {
  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<FunnelStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!isAtlasSupabaseDataEnabled()) {
        setStats(aggregateLocal(days));
        return;
      }
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? '';
      if (!token) {
        setError('Session requise.');
        return;
      }
      const res = await fetch(`/api/admin/funnel-stats?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => ({}))) as FunnelStatsResponse & { error?: string; message?: string };
      if (!res.ok) {
        setError(typeof json?.message === 'string' ? json.message : json?.error ?? 'Erreur');
        return;
      }
      setStats(json as FunnelStatsResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <BarChart3 size={16} /> Analytics interne
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Table <span className="font-mono">events</span> · path &amp; metadata côté serveur
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-xs text-gray-500">
            Jours{' '}
            <select
              value={days}
              onChange={(e) => setDays(Number.parseInt(e.target.value, 10) || 30)}
              className="ml-1 border border-gray-200 rounded-lg px-2 py-1 text-sm"
            >
              {[7, 14, 30, 60, 90].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Actualiser
          </button>
        </div>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">{error}</div> : null}

      {stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Inscriptions</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums">{stats.signups}</p>
              <p className="text-[11px] text-gray-400 mt-1">signup_completed</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Onboarding terminé</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums">{stats.onboardingCompleted}</p>
              <p className="text-[11px] text-gray-400 mt-1">Démarrages : {stats.onboardingStarted}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vues pricing</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums">{stats.pricingViews}</p>
              <p className="text-[11px] text-gray-400 mt-1">view_pricing</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Clics upgrade</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2 tabular-nums">{stats.upgradeClicks}</p>
              <p className="text-[11px] text-gray-400 mt-1">upgrade_clicked · bannière : {stats.trialBannerClicks}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm sm:col-span-2 lg:col-span-2">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Taux de conversion (estimation)</p>
              <p className="text-3xl font-extrabold text-indigo-700 mt-2 tabular-nums">{pct(stats.conversionRateEstimate)}</p>
              <p className="text-xs text-gray-500 mt-1">
                signup_completed ÷ view_landing · vues landing : {stats.landingViews} · signup → onboarding :{' '}
                {pct(stats.signupToOnboardingRate)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
            <p className="text-sm font-semibold text-gray-900">Parrainage (atlas_referrals)</p>
            {stats.warnings?.length ? (
              <p className="text-xs text-amber-700">{stats.warnings.join(' · ')}</p>
            ) : null}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Clics parrain</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.referralClicksDb ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Inscrits avec ref</p>
                <p className="text-2xl font-bold text-gray-900 mt-1 tabular-nums">{stats.referralLinkedSignupsDb ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Activations</p>
                <p className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">{stats.referralActivatedDb ?? 0}</p>
              </div>
              <div className="rounded-xl border border-gray-100 p-4">
                <p className="text-xs text-gray-500">Récompenses attribuées</p>
                <p className="text-2xl font-bold text-indigo-800 mt-1 tabular-nums">{stats.referralRewardsGrantedDb ?? 0}</p>
              </div>
            </div>
            <p className="text-[11px] text-gray-400">
              Événements funnel : referral_link_created {stats.counts.referral_link_created ?? 0} · share{' '}
              {stats.counts.referral_share_clicked ?? 0} · signup started {stats.counts.referral_signup_started ?? 0} ·
              completed {stats.counts.referral_signup_completed ?? 0} · reward {stats.counts.referral_reward_granted ?? 0}
              · progress {stats.counts.referral_progress ?? 0} · reward_unlocked {stats.counts.reward_unlocked ?? 0}
            </p>
          </div>

          <p className="text-sm text-gray-600">
            <Link href="/admin/funnel" className="font-semibold text-gray-900 underline underline-offset-2 hover:text-indigo-700">
              Détail par nom d’événement
            </Link>
            {' · '}
            {isAtlasSupabaseDataEnabled() ? 'Supabase' : 'localStorage (dev)'}
          </p>
        </>
      ) : null}
    </div>
  );
}
