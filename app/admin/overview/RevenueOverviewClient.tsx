'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BarChart3, CreditCard, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { supabase } from '@/app/lib/supabase';
import type { RevenueOverviewResponse } from '@/app/api/admin/revenue-overview/route';

export default function RevenueOverviewClient() {
  const [data, setData] = useState<RevenueOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data: session } = await supabase.auth.getSession();
      const token = session.session?.access_token ?? '';
      if (!token) {
        setError('Session requise.');
        return;
      }
      const res = await fetch('/api/admin/revenue-overview', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = (await res.json().catch(() => ({}))) as RevenueOverviewResponse & { error?: string };
      if (!res.ok) {
        setError(json.error ?? 'Erreur');
        return;
      }
      setData(json as RevenueOverviewResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <TrendingUp size={22} className="text-indigo-600" />
            Revenue &amp; croissance
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Synthèse paiements manuels (MA), Paddle, abonnements Atlas actifs — MRR estimatif à partir des tarifs annuels catalogue.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {error ? <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">{error}</div> : null}

      {data ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">MRR estimé (MAD)</p>
              <p className="text-3xl font-extrabold text-indigo-700 mt-2 tabular-nums">{data.mrrMadEstimate.toLocaleString('fr-MA')}</p>
              <p className="text-xs text-gray-400 mt-1">Basé sur forfaits payants actifs (hors essai)</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ARR estimé (MAD)</p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums">{data.arrMadEstimate.toLocaleString('fr-MA')}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <Users size={14} /> Utilisateurs (auth)
              </p>
              <p className="text-3xl font-extrabold text-gray-900 mt-2 tabular-nums">{data.usersTotal}</p>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
                <BarChart3 size={14} /> Comptes payants Atlas
              </p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2 tabular-nums">{data.atlasActiveNonTrial}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-amber-600" />
                Paiement manuel (Maroc)
              </p>
              <ul className="mt-4 space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>En attente</span>
                  <span className="font-bold text-amber-800">{data.subscriptionsManual.pending}</span>
                </li>
                <li className="flex justify-between">
                  <span>Actifs (ligne revenue)</span>
                  <span className="font-bold text-emerald-700">{data.subscriptionsManual.active}</span>
                </li>
                <li className="flex justify-between">
                  <span>Annulés / refusés</span>
                  <span className="font-bold text-gray-600">{data.subscriptionsManual.canceled}</span>
                </li>
              </ul>
              <Link
                href="/admin/manual-payments"
                className="mt-4 inline-block text-sm font-semibold text-indigo-600 hover:underline"
              >
                Gérer les demandes →
              </Link>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <p className="text-sm font-bold text-gray-900">Paddle (catalogue)</p>
              <p className="text-3xl font-extrabold text-slate-900 mt-2">{data.subscriptionsPaddle.active}</p>
              <p className="text-xs text-gray-500 mt-2">
                Abonnements <code className="text-[11px] bg-gray-100 px-1 rounded">payment_method=paddle</code> actifs.
                Configurez webhooks + checkout (env vars).
              </p>
              <p className="text-xs text-gray-400 mt-3">
                Webhook: <code className="break-all">/api/webhooks/paddle</code>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/admin/payments" className="font-semibold text-indigo-600 hover:underline">
              Paiements &amp; demandes
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/admin/users" className="font-semibold text-indigo-600 hover:underline">
              Utilisateurs
            </Link>
            <span className="text-gray-300">·</span>
            <Link href="/admin/analytics" className="font-semibold text-indigo-600 hover:underline">
              Analytics
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
