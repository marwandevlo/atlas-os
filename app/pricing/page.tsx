'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle, Zap, Building2, Crown } from 'lucide-react';

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    nameAr: 'المبتدئ',
    price: 299,
    color: 'border-blue-200',
    headerColor: 'bg-blue-500',
    icon: Zap,
    popular: false,
    features: [
      '1 société',
      '50 documents / mois',
      'TVA + IS + IR + CNSS',
      'Factures & Comptabilité',
      'Documents IA (OCR)',
      'Consultant IA',
      'Rapports PDF',
      'Support email',
    ],
    featuresAr: [
      'شركة واحدة',
      '50 وثيقة / شهر',
      'TVA + IS + IR + CNSS',
      'الفواتير والمحاسبة',
      'وثائق ذكية (OCR)',
      'المستشار الذكي',
      'تقارير PDF',
      'دعم بالبريد',
    ],
    notIncluded: [
      'Agents IA',
      'Etude de faisabilité',
      'Juridique & RH',
      'Multi-sociétés',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    nameAr: 'المحترف',
    price: 599,
    color: 'border-amber-400',
    headerColor: 'bg-amber-400',
    icon: Building2,
    popular: true,
    features: [
      '20 sociétés',
      '200 documents / mois',
      'Tout Starter +',
      'Agents IA (TVA/Paie/IS/Audit/Alert)',
      'Etude de faisabilité IA',
      'Juridique (50 modèles)',
      'RH (contrats & attestations)',
      'Export XML DGI & CNSS',
      'Portail client',
      'Support prioritaire',
    ],
    featuresAr: [
      '20 شركة',
      '200 وثيقة / شهر',
      'كل Starter +',
      'Agents IA (TVA/Paie/IS/Audit/Alert)',
      'دراسة الجدوى الذكية',
      'الوثائق القانونية (50 نموذج)',
      'الموارد البشرية',
      'تصدير XML DGI و CNSS',
      'بوابة العميل',
      'دعم أولوي',
    ],
    notIncluded: [],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    nameAr: 'المؤسسات',
    price: 1299,
    color: 'border-purple-400',
    headerColor: 'bg-[#0F1F3D]',
    icon: Crown,
    popular: false,
    features: [
      'Sociétés illimitées',
      'Documents illimités',
      'Tout Pro +',
      'API Access',
      'White Label',
      'Formation dédiée',
      'Account Manager',
      'SLA 99.9%',
      'Intégration sur mesure',
      'Support 24/7',
    ],
    featuresAr: [
      'شركات غير محدودة',
      'وثائق غير محدودة',
      'كل Pro +',
      'API Access',
      'White Label',
      'تدريب مخصص',
      'مدير حساب',
      'SLA 99.9%',
      'تكامل مخصص',
      'دعم 24/7',
    ],
    notIncluded: [],
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0F1F3D] text-white py-16 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
            <Building2 size={28} className="text-[#0F1F3D]" />
          </div>
          <span className="text-2xl font-bold">Atlas OS Enterprise</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          Tarifs simples et transparents
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Le logiciel de comptabilité et fiscalité le plus complet au Maroc.
          Moins cher qu'un comptable, plus puissant qu'un ERP.
        </p>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
          <span>✓ Sans engagement</span>
          <span>✓ Annuler à tout moment</span>
          <span>✓ Support inclus</span>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm overflow-hidden relative ${plan.popular ? 'shadow-xl scale-105' : ''}`}>
              {plan.popular && (
                <div className="absolute top-4 right-4 bg-amber-400 text-[#0F1F3D] text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ POPULAIRE
                </div>
              )}
              <div className={`${plan.headerColor} p-6`}>
                <plan.icon size={28} className={plan.popular ? 'text-[#0F1F3D]' : 'text-white'} />
                <h2 className={`text-2xl font-bold mt-2 ${plan.popular ? 'text-[#0F1F3D]' : 'text-white'}`}>{plan.name}</h2>
                <div className={`flex items-end gap-1 mt-3 ${plan.popular ? 'text-[#0F1F3D]' : 'text-white'}`}>
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-lg mb-1">MAD</span>
                  <span className="text-sm mb-1 opacity-70">/ mois</span>
                </div>
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-green-500 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                  {plan.notIncluded.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300 line-through">
                      <CheckCircle size={16} className="text-gray-200 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => router.push('/login')}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.popular
                      ? 'bg-amber-400 text-[#0F1F3D] hover:bg-amber-300'
                      : plan.id === 'enterprise'
                      ? 'bg-[#0F1F3D] text-white hover:bg-[#1a3060]'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.id === 'enterprise' ? 'Contacter les ventes' : 'Commencer gratuitement'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Pourquoi Atlas OS?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4">
              <p className="text-3xl font-bold text-blue-600">10x</p>
              <p className="text-sm text-gray-500 mt-1">moins cher qu'un comptable</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-green-600">24/7</p>
              <p className="text-sm text-gray-500 mt-1">disponible sans arrêt</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-purple-600">100%</p>
              <p className="text-sm text-gray-500 mt-1">conforme DGI Maroc</p>
            </div>
            <div className="p-4">
              <p className="text-3xl font-bold text-amber-600">5 min</p>
              <p className="text-sm text-gray-500 mt-1">pour déclarer la TVA</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Des questions? Contactez-nous sur{' '}
            <a href="mailto:contact@atlas-os.ma" className="text-blue-500 hover:underline">
              contact@atlas-os.ma
            </a>
          </p>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}