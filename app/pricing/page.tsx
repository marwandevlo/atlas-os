'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Check, Zap, Shield, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 299,
    icon: Zap,
    color: 'bg-blue-500',
    description: 'Pour les auto-entrepreneurs',
    features: [
      'Dashboard complet',
      'Déclaration TVA',
      'Jusqu\'à 50 factures/mois',
      'Support email',
    ],
    cta: 'Commencer',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 599,
    icon: Shield,
    color: 'bg-purple-500',
    description: 'Pour les PME',
    popular: true,
    features: [
      'Tout Starter +',
      'Comptabilité complète',
      'IR / Salaires CNSS',
      'Import IA documents',
      'Factures illimitées',
      'Support prioritaire',
    ],
    cta: 'Choisir Pro',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 1299,
    icon: Crown,
    color: 'bg-amber-500',
    description: 'Pour les grandes entreprises',
    features: [
      'Tout Pro +',
      'Multi-utilisateurs',
      'API dédiée',
      'Consultant IA 24/7',
      'Formation incluse',
      'Support téléphonique',
      'SLA garanti',
    ],
    cta: 'Nous contacter',
  },
];

export default function PricingPage() {
  const router = useRouter();
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#1B2A4A] text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <div className="w-8 h-8 bg-amber-400 rounded-lg flex items-center justify-center">
              <Building2 size={18} className="text-[#1B2A4A]" />
            </div>
            <span className="font-bold text-lg">Atlas OS</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/login')} className="text-white/70 hover:text-white text-sm transition-colors">
              Se connecter
            </button>
            <button onClick={() => router.push('/login')} className="px-4 py-2 bg-amber-400 text-[#1B2A4A] rounded-lg text-sm font-medium hover:bg-amber-300 transition-colors">
              Essai gratuit
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-[#1B2A4A] text-white pb-16 pt-12">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h1 className="text-4xl font-bold mb-4">Tarifs simples et transparents</h1>
          <p className="text-white/60 text-lg mb-8">Conforme à la législation marocaine · DGI · CNSS · AMO</p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-white/40'}`}>Mensuel</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`w-12 h-6 rounded-full transition-colors ${annual ? 'bg-amber-400' : 'bg-white/20'}`}
            >
              <span className={`block w-5 h-5 bg-white rounded-full transition-transform mx-0.5 ${annual ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-white/40'}`}>
              Annuel <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">-20%</span>
            </span>
          </div>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 pb-16">
        <div className="grid grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl shadow-lg overflow-hidden ${plan.popular ? 'ring-2 ring-purple-500 scale-105' : ''}`}>
              {plan.popular && (
                <div className="bg-purple-500 text-white text-xs font-bold text-center py-2 tracking-wide">
                  PLUS POPULAIRE
                </div>
              )}
              <div className="p-6">
                <div className={`w-10 h-10 ${plan.color} rounded-xl flex items-center justify-center mb-4`}>
                  <plan.icon size={20} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">{plan.name}</h2>
                <p className="text-gray-400 text-sm mt-1 mb-4">{plan.description}</p>

                <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-gray-800">
                    {annual ? Math.round(plan.price * 0.8) : plan.price}
                  </span>
                  <span className="text-gray-400 text-sm mb-1">MAD/mois</span>
                </div>

                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${plan.popular ? 'bg-purple-500 text-white hover:bg-purple-600' : 'bg-[#1B2A4A] text-white hover:bg-[#243660]'}`}
                >
                  {plan.cta}
                </button>

                <div className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={14} className="text-green-500 shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="text-center mt-12 text-sm text-gray-400">
          <p>Tous les prix sont HT · TVA 20% applicable · Essai gratuit 14 jours sans carte bancaire</p>
          <p className="mt-2">Des questions? <span className="text-blue-500 cursor-pointer">Contactez-nous</span></p>
        </div>
      </div>
    </div>
  );
}