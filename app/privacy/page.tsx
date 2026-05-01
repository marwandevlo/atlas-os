'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock } from 'lucide-react';
import { PublicFooter } from '@/app/components/public/PublicFooter';

export default function PrivacyPage() {
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
          <Lock size={16} /> Privacy Policy
        </p>
        <div />
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-extrabold text-gray-900">Politique de confidentialité · سياسة الخصوصية</h1>
          <p className="text-sm text-gray-500 mt-2">
            Version temporaire (MVP). Cette page décrit les données collectées et leurs usages.
          </p>

          <div className="mt-8 space-y-8 text-sm text-gray-700 leading-relaxed">
            <section>
              <h2 className="text-lg font-bold text-gray-900">1) Données collectées</h2>
              <ul className="mt-3 space-y-2">
                <li>- Informations personnelles: nom, email, numéro de téléphone.</li>
                <li>- Informations entreprise: raison sociale, ville, ICE (optionnel).</li>
                <li>- Données d’usage: opérations, factures, paiements (selon modules utilisés).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">2) Utilisation des informations</h2>
              <ul className="mt-3 space-y-2">
                <li>- Création et gestion du compte.</li>
                <li>- Support utilisateur et communication liée au service.</li>
                <li>- Amélioration du produit et prévention de la fraude.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">3) Numéro de téléphone</h2>
              <ul className="mt-3 space-y-2">
                <li>- Utilisé pour contact support, notifications (si activées) et sécurité.</li>
                <li>- Pas de partage non nécessaire à l’exécution du service.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">4) Informations de paiement</h2>
              <ul className="mt-3 space-y-2">
                <li>- Tant que les paiements en ligne ne sont pas activés, aucune carte n’est débitée via ZAFIRIX PRO.</li>
                <li>- En paiement manuel, la preuve peut être partagée avec l’admin/support pour validation.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">5) Communication</h2>
              <ul className="mt-3 space-y-2">
                <li>- Emails transactionnels (création de compte, activation, support).</li>
                <li>- Messages de relance/notifications lorsque l’utilisateur les déclenche (ex: factures).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">6) Sécurité</h2>
              <ul className="mt-3 space-y-2">
                <li>- Mesures techniques et organisationnelles raisonnables pour protéger les données.</li>
                <li>- Accès limité selon le besoin (admin/support).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">7) Droits des utilisateurs</h2>
              <ul className="mt-3 space-y-2">
                <li>- Accès, rectification, suppression (selon faisabilité et obligations légales).</li>
                <li>- Contact pour demandes: <a className="text-blue-600 hover:underline" href="mailto:contact@zafirix.group">contact@zafirix.group</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-bold text-gray-900">8) Contact</h2>
              <p className="mt-3">
                Pour toute question liée à la confidentialité: <a className="text-blue-600 hover:underline" href="mailto:contact@zafirix.group">contact@zafirix.group</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}

