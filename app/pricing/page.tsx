'use client';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Crown, Rocket, ShieldCheck, Sparkles, Building2, BriefcaseBusiness } from 'lucide-react';
import { ATLAS_PRICING_PLANS, formatLimit, formatPriceMadYear } from '@/app/lib/atlas-pricing-plans';
import { PublicFooter } from '@/app/components/public/PublicFooter';

const planStyleById: Record<
  string,
  { accentBg: string; accentText: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }> }
> = {
  'free-trial': { accentBg: 'bg-sky-50', accentText: 'text-sky-700', border: 'border-sky-200', icon: Sparkles },
  starter: { accentBg: 'bg-blue-50', accentText: 'text-blue-700', border: 'border-blue-200', icon: Rocket },
  growth: { accentBg: 'bg-emerald-50', accentText: 'text-emerald-700', border: 'border-emerald-200', icon: Building2 },
  pro: { accentBg: 'bg-amber-50', accentText: 'text-amber-800', border: 'border-amber-300', icon: Crown },
  business: { accentBg: 'bg-violet-50', accentText: 'text-violet-700', border: 'border-violet-200', icon: BriefcaseBusiness },
  advanced: { accentBg: 'bg-slate-50', accentText: 'text-slate-700', border: 'border-slate-200', icon: ShieldCheck },
  enterprise: { accentBg: 'bg-gray-900', accentText: 'text-white', border: 'border-gray-800', icon: Crown },
};

export default function PricingPage() {
  const router = useRouter();
  const plans = ATLAS_PRICING_PLANS;

  const onSelectPlan = (planId: string) => {
    router.push(`/payment?plan=${encodeURIComponent(planId)}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#0F1F3D] text-white py-16 px-6 text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-400 rounded-xl flex items-center justify-center">
            <Building2 size={28} className="text-[#0F1F3D]" />
          </div>
          <span className="text-2xl font-bold">ZAFIRIX PRO</span>
        </div>
        <h1 className="text-3xl lg:text-4xl font-bold mb-4">
          Tarifs simples et transparents
        </h1>
        <p className="text-white/60 text-lg max-w-2xl mx-auto">
          Le logiciel de comptabilité et fiscalité le plus complet au Maroc.
          Un style SaaS moderne, pensé pour les entreprises marocaines.
        </p>
        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-white/50">
          <span>✓ Sans engagement</span>
          <span>✓ Annuler à tout moment</span>
          <span>✓ Support inclus</span>
        </div>
      </div>

      {/* Plans */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const style = planStyleById[plan.id] ?? planStyleById.starter;
            const Icon = style.icon;
            const isEnterprise = plan.id === 'enterprise';
            const isTrial = plan.billingPeriod === 'trial';
            const cta =
              plan.id === 'free-trial'
                ? 'ابدأ التجربة'
                : isEnterprise
                  ? 'تواصل معنا'
                  : 'اختر الخطة';

            const priceLabel = plan.billingPeriod === 'year'
              ? formatPriceMadYear(plan.price)
              : `${plan.price.toLocaleString()} ${plan.currency} · ${plan.durationDays ?? 7} jours`;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border ${style.border} shadow-sm hover:shadow-md transition-shadow overflow-hidden relative ${plan.isPopular ? 'ring-2 ring-amber-300 shadow-lg' : ''}`}
              >
                {plan.isPopular && (
                  <div className="absolute top-4 right-4 bg-amber-400 text-[#0F1F3D] text-xs font-bold px-3 py-1 rounded-full">
                    الأكثر اختياراً
                  </div>
                )}

                <div className={`p-6 ${isEnterprise ? 'bg-gray-950' : style.accentBg}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${isEnterprise ? 'bg-white/10 border-white/10' : 'bg-white border-white/70'}`}>
                      <Icon size={22} className={isEnterprise ? 'text-white' : style.accentText} />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${isEnterprise ? 'text-white/80 border-white/15 bg-white/5' : 'text-gray-600 border-gray-200 bg-white/60'}`}>
                      {isTrial ? 'Essai' : 'Annuel'}
                    </span>
                  </div>

                  <h2 className={`text-2xl font-bold mt-4 ${isEnterprise ? 'text-white' : 'text-gray-900'}`}>{plan.name}</h2>
                  <p className={`text-sm mt-1 ${isEnterprise ? 'text-white/60' : 'text-gray-500'}`}>{plan.description}</p>

                  <div className={`mt-4 text-3xl font-extrabold tracking-tight ${isEnterprise ? 'text-white' : style.accentText}`}>
                    {priceLabel}
                  </div>
                  {plan.billingPeriod === 'year' && (
                    <p className={`text-xs mt-1 ${isEnterprise ? 'text-white/60' : 'text-gray-400'}`}>
                      Facturation annuelle · MAD
                    </p>
                  )}
                </div>

                <div className="p-6">
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><span className="font-semibold">Sociétés</span> · {formatLimit(plan.companiesLimit)}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><span className="font-semibold">Utilisateurs</span> · {formatLimit(plan.usersLimit)}</span>
                    </li>
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      <span><span className="font-semibold">Opérations</span> · {formatLimit(plan.operationsLimit)}</span>
                    </li>
                  </ul>

                  <button
                    onClick={() => onSelectPlan(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.isPopular
                        ? 'bg-amber-400 text-[#0F1F3D] hover:bg-amber-300'
                        : isEnterprise
                          ? 'bg-[#0F1F3D] text-white hover:bg-[#1a3060]'
                          : isTrial
                            ? 'bg-sky-600 text-white hover:bg-sky-700'
                            : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    {cta}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison */}
        <div className="mt-14 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-6 border-b border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">Comparaison des offres</h2>
            <p className="text-sm text-gray-500 mt-1">Limites principales (sociétés, utilisateurs, opérations) pour choisir la bonne formule.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr className="text-left">
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold">Prix</th>
                  <th className="px-6 py-4 font-semibold">Sociétés</th>
                  <th className="px-6 py-4 font-semibold">Utilisateurs</th>
                  <th className="px-6 py-4 font-semibold">Opérations</th>
                  <th className="px-6 py-4 font-semibold">CTA</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => {
                  const isEnterprise = p.id === 'enterprise';
                  const isTrial = p.billingPeriod === 'trial';
                  const price = p.billingPeriod === 'year' ? formatPriceMadYear(p.price) : `${p.price.toLocaleString()} ${p.currency} / ${p.durationDays ?? 7} jours`;
                  const cta = p.id === 'free-trial' ? 'ابدأ التجربة' : isEnterprise ? 'تواصل معنا' : 'اختر الخطة';
                  return (
                    <tr key={p.id} className={`border-t border-gray-100 ${p.isPopular ? 'bg-amber-50/40' : ''}`}>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{p.name}</span>
                          {p.isPopular && (
                            <span className="text-[10px] uppercase tracking-wide bg-amber-200 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full font-bold">
                              الأكثر اختياراً
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">{price}</td>
                      <td className="px-6 py-4 text-gray-700">{formatLimit(p.companiesLimit)}</td>
                      <td className="px-6 py-4 text-gray-700">{formatLimit(p.usersLimit)}</td>
                      <td className="px-6 py-4 text-gray-700">{formatLimit(p.operationsLimit)}</td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => onSelectPlan(p.id)}
                          className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                            p.isPopular
                              ? 'bg-amber-400 text-[#0F1F3D] border-amber-400 hover:bg-amber-300'
                              : isEnterprise
                                ? 'bg-[#0F1F3D] text-white border-[#0F1F3D] hover:bg-[#1a3060]'
                                : isTrial
                                  ? 'bg-sky-600 text-white border-sky-600 hover:bg-sky-700'
                                  : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          {cta}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Des questions? Contactez-nous sur{' '}
            <a href="mailto:contact@zafirix.group" className="text-blue-500 hover:underline">
              contact@zafirix.group
            </a>
          </p>
          <button onClick={() => router.push('/')} className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors">
            ← Retour au dashboard
          </button>
        </div>
      </div>

      <PublicFooter />
    </div>
  );
}