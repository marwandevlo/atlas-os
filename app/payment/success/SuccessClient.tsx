'use client';

import { useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ArrowLeft, Copy } from 'lucide-react';
import { addProCompanyAddonExtraSlots, getCompanyAddonById } from '@/app/lib/atlas-company-addons';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';

export default function SuccessClient() {
  const router = useRouter();
  const search = useSearchParams();
  const ref = search.get('ref') ?? '';
  const addonId = search.get('addon') ?? '';

  const shortRef = useMemo(() => (ref.length > 16 ? `${ref.slice(0, 8)}…${ref.slice(-6)}` : ref), [ref]);

  useEffect(() => {
    if (!addonId || !ref) return;
    const def = getCompanyAddonById(addonId);
    if (!def) return;
    const dedupe = `atlas_addon_applied_${ref}`;
    if (typeof window !== 'undefined' && sessionStorage.getItem(dedupe)) return;
    if (!isAtlasSupabaseDataEnabled()) {
      addProCompanyAddonExtraSlots(def.extraSlots);
      if (typeof window !== 'undefined') sessionStorage.setItem(dedupe, '1');
    }
  }, [addonId, ref]);

  const copyRef = async () => {
    try {
      await navigator.clipboard.writeText(ref);
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push('/pricing')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Retour aux tarifs
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
              <CheckCircle2 size={22} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">Demande enregistrée</p>
              <p className="text-sm text-gray-500 mt-1">
                {addonId ? (
                  <>
                    Demande d’<span className="font-semibold">extension Pro</span> enregistrée (statut{' '}
                    <span className="font-semibold">pending</span>).{' '}
                    {isAtlasSupabaseDataEnabled()
                      ? 'Les emplacements sociétés seront ajoutés après validation du paiement par l’équipe.'
                      : 'En environnement local, les emplacements supplémentaires sont appliqués tout de suite.'}
                  </>
                ) : (
                  <>
                    Votre demande de paiement manuel a été créée avec le statut <span className="font-semibold">pending</span>.
                    Un admin activera l’abonnement après confirmation.
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs text-gray-500">Référence / Ref</p>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-lg font-extrabold text-gray-900">{shortRef || '—'}</p>
              <button
                onClick={() => void copyRef()}
                className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-white flex items-center gap-2"
                title="Copier"
              >
                <Copy size={16} /> Copier
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              شارك هذه المرجعية مع الدعم أو الإدارة لتأكيد الدفع.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => router.push(addonId ? '/companies' : '/')}
              className="px-4 py-2 rounded-xl bg-[#0F1F3D] text-white text-sm font-semibold hover:bg-[#1a3060]"
            >
              {addonId ? 'Retour aux sociétés' : 'Aller au dashboard'}
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Voir les tarifs
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

