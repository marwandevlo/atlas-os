'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, ChevronRight, FileText, Sparkles, UserCircle2 } from 'lucide-react';
import { ZafirixLogo } from '@/app/components/branding/ZafirixLogo';
import { trackEvent } from '@/app/lib/analytics-track';
import { awaitCompleteReferralSignupWithSession } from '@/app/lib/atlas-referral-client';
import { ATLAS_REFERRAL_CONFIG } from '@/app/lib/atlas-referral-config';
import { isAtlasSupabaseDataEnabled } from '@/app/lib/atlas-data-source';

const SESSION_ONBOARDING = 'zafirix_show_onboarding';

const COMPANY_TYPES = ['SARL / SUARL', 'Auto-entrepreneur', 'Cabinet comptable', 'PME multi-sites', 'Autre'] as const;

const NEEDS = [
  'TVA & échéances',
  'IS / résultat fiscal',
  'IR & paie / CNSS',
  'Facturation clients',
  'Documents & OCR',
  'Conseil IA',
] as const;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('atlas_onboarding_started_track')) return;
      sessionStorage.setItem('atlas_onboarding_started_track', '1');
    } catch {
      // ignore
    }
    trackEvent('onboarding_started');
  }, []);

  useEffect(() => {
    if (!isAtlasSupabaseDataEnabled()) return;
    void awaitCompleteReferralSignupWithSession();
  }, []);

  const [companyType, setCompanyType] = useState<string>(COMPANY_TYPES[0]);
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>([]);

  const toggleNeed = (n: string) => {
    setSelectedNeeds((prev) => (prev.includes(n) ? prev.filter((x) => x !== n) : [...prev, n]));
  };

  const finish = () => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('atlas_onboarding_prefs');
        const prefs = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
        localStorage.setItem(
          'atlas_onboarding_prefs',
          JSON.stringify({
            ...prefs,
            companyType,
            needs: selectedNeeds,
            completedAt: new Date().toISOString(),
          }),
        );
      } catch {
        localStorage.setItem(
          'atlas_onboarding_prefs',
          JSON.stringify({ companyType, needs: selectedNeeds, completedAt: new Date().toISOString() }),
        );
      }
      sessionStorage.setItem(SESSION_ONBOARDING, '1');
      if (isAtlasSupabaseDataEnabled()) {
        try {
          sessionStorage.setItem(ATLAS_REFERRAL_CONFIG.postOnboardingReferralKey, 'pending');
        } catch {
          // ignore
        }
      }
    }
    trackEvent('onboarding_completed', {
      companyType,
      needsCount: selectedNeeds.length,
    });
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-white flex flex-col">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-center">
          <ZafirixLogo size="sm" subtitle subtitleText="ZAFIRIX PRO" subtitleClassName="text-slate-400" />
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full px-4 py-8 sm:py-12">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step >= i ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'
                }`}
              >
                {i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${step > i ? 'bg-indigo-600' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="text-center">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg mb-6">
              <Sparkles size={28} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Bienvenue sur ZAFIRIX PRO</h1>
            <p className="mt-3 text-slate-600 leading-relaxed">
              Vous êtes à quelques minutes de votre premier gain de temps : factures, TVA et suivi, dans une interface pensée pour le Maroc.
            </p>
            <p className="mt-4 text-sm text-emerald-700 font-medium bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-3 inline-block">
              Essai gratuit 7 jours · sans carte bancaire
            </p>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="mt-10 w-full py-3.5 rounded-2xl bg-[#0f1a32] text-white font-bold text-sm hover:bg-[#1a2a4a] transition-colors flex items-center justify-center gap-2"
            >
              Continuer <ChevronRight size={18} />
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h1 className="text-xl font-bold text-slate-900">Parlez-nous de votre contexte</h1>
            <p className="text-sm text-slate-500 mt-1">2 questions — nous adaptons les raccourcis (sans engagement).</p>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Type d’entreprise</p>
              <div className="grid grid-cols-1 gap-2">
                {COMPANY_TYPES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCompanyType(c)}
                    className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all ${
                      companyType === c ? 'border-indigo-500 bg-indigo-50 text-indigo-950' : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <Building2 size={18} className={companyType === c ? 'text-indigo-600' : 'text-slate-400'} />
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">Vos besoins prioritaires</p>
              <div className="flex flex-wrap gap-2">
                {NEEDS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => toggleNeed(n)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-colors ${
                      selectedNeeds.includes(n) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-3">
              <button type="button" onClick={() => setStep(0)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-2 py-3 rounded-xl bg-[#0f1a32] text-white text-sm font-bold hover:bg-[#1a2a4a]"
              >
                Suivant
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-bold text-slate-900">Votre première valeur en moins de 2 minutes</h1>
            <p className="text-sm text-slate-500 mt-1">Société → client → facture : ouvrez ces trois écrans dans l’ordre.</p>

            <ul className="mt-8 space-y-4">
              <li className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <Building2 size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">Créer votre première société</p>
                  <p className="text-xs text-slate-500 mt-0.5">Raison sociale, IF, ICE — base pour TVA et factures.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/companies')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Ouvrir Mes sociétés →
                  </button>
                </div>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <UserCircle2 size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">Ajouter un client</p>
                  <p className="text-xs text-slate-500 mt-0.5">Base clients partagée avec les factures.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/clients')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Ouvrir Clients →
                  </button>
                </div>
              </li>
              <li className="rounded-2xl border border-slate-200 bg-white p-4 flex gap-4 shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0">
                  <FileText size={22} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">Créer une facture</p>
                  <p className="text-xs text-slate-500 mt-0.5">Premier document émis, suivi des paiements.</p>
                  <button
                    type="button"
                    onClick={() => router.push('/factures')}
                    className="mt-2 text-xs font-bold text-indigo-600 hover:underline"
                  >
                    Ouvrir Factures →
                  </button>
                </div>
              </li>
            </ul>

            <div className="mt-8 rounded-xl bg-slate-50 border border-slate-100 p-4 flex gap-3">
              <CheckCircle2 className="text-emerald-600 shrink-0" size={20} />
              <p className="text-xs text-slate-600 leading-relaxed">
                Vous pourrez compléter plus tard depuis le tableau de bord. Nous vous rappellerons les prochaines échéances fiscales.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <button type="button" onClick={() => setStep(1)} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                Retour
              </button>
              <button
                type="button"
                onClick={finish}
                className="flex-2 py-3 rounded-xl bg-linear-to-r from-amber-400 to-amber-300 text-[#0b1428] text-sm font-extrabold shadow-md hover:brightness-105"
              >
                Accéder au tableau de bord
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
