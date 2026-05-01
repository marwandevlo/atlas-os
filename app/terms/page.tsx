'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { PublicFooter } from '@/app/components/public/PublicFooter';

export default function TermsPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft size={16} /> Dashboard
        </button>
        <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <ShieldCheck size={16} /> Terms of Service
        </p>
        <div />
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Conditions d’utilisation · شروط الاستخدام</h1>
          <p className="text-sm text-gray-500 mt-2">
            Version temporaire (MVP). Ce document décrit les règles d’usage de ZAFIRIX PRO.
          </p>

          <div className="mt-8 space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900">1) Règles d’usage du service</h2>
              <ul className="mt-3 space-y-2">
                <li>- Utilisation conforme aux lois marocaines et aux bonnes pratiques de gestion.</li>
                <li>- Interdiction d’usage frauduleux, abusif, ou visant à contourner les limitations.</li>
                <li>- L’utilisateur est responsable des données saisies (factures, paiements, documents, etc.).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">2) Abonnements et paiements</h2>
              <ul className="mt-3 space-y-2">
                <li>- Les plans sont définis sur la page Tarifs et peuvent évoluer.</li>
                <li>- Tant que le paiement en ligne n’est pas activé, certaines méthodes restent “à venir”.</li>
                <li>- En paiement manuel, la souscription reste en <span className="font-semibold">pending</span> jusqu’à confirmation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">3) Validation du paiement manuel</h2>
              <ul className="mt-3 space-y-2">
                <li>- Le client effectue le paiement (CashPlus / WafaCash / Western Union).</li>
                <li>- Le client fournit une preuve de paiement et la référence.</li>
                <li>- Un administrateur active l’abonnement après vérification.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">4) Limites d’usage</h2>
              <ul className="mt-3 space-y-2">
                <li>- Les limites (sociétés, utilisateurs, opérations) dépendent du plan.</li>
                <li>- “Illimité” et “fair usage” impliquent une utilisation raisonnable et non abusive.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">5) Annulation</h2>
              <ul className="mt-3 space-y-2">
                <li>- L’utilisateur peut demander l’annulation de son abonnement.</li>
                <li>- Les modalités de remboursement (si applicable) seront précisées lors de l’activation des paiements en ligne.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">6) Support</h2>
              <ul className="mt-3 space-y-2">
                <li>- Support par email pendant les heures ouvrables (MVP).</li>
                <li>- Le délai de réponse dépend du plan et de la charge.</li>
              </ul>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

