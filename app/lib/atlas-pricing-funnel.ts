import type { AtlasPricingPlan } from '@/app/lib/atlas-pricing-plans';
import { ATLAS_PRICING_PLANS, formatLimit, formatPriceMadYear } from '@/app/lib/atlas-pricing-plans';

/** Public pricing funnel: 3 plans max — maps to existing `AtlasPricingPlan` ids. */
export const FUNNEL_PLAN_IDS = ['starter', 'pro', 'business'] as const;

export type FunnelPlanId = (typeof FUNNEL_PLAN_IDS)[number];

export type FunnelPlanPresentation = {
  plan: AtlasPricingPlan;
  funnelId: FunnelPlanId;
  personaTitleFr: string;
  personaTitleAr: string;
  taglineFr: string;
  taglineAr: string;
  /** Value-first bullets (not raw feature names). */
  benefitsFr: string[];
  benefitsAr: string[];
  isMostPopular: boolean;
};

const FUNNEL_META: Record<
  FunnelPlanId,
  Omit<FunnelPlanPresentation, 'plan' | 'isMostPopular'> & { isMostPopular?: boolean }
> = {
  starter: {
    funnelId: 'starter',
    personaTitleFr: 'Starter — Entrepreneur & indépendant',
    personaTitleAr: 'Starter — رائد أعمال ومستقل',
    taglineFr: 'Une base solide pour facturer et rester à jour.',
    taglineAr: 'أساس متين للفوترة والبقاء محدّثاً.',
    benefitsFr: [
      'Centralisez vos factures et clients',
      'Préparez TVA / IS avec des repères marocains',
      'Idéal pour démarrer sans complexité',
    ],
    benefitsAr: [
      'جمّع الفواتير والعملاء',
      'أعد TVA / IS مع معالم مغربية',
      'مثالي للبداية بلا تعقيد',
    ],
  },
  pro: {
    funnelId: 'pro',
    personaTitleFr: 'Pro — PME en croissance',
    personaTitleAr: 'Pro — شركة ناشئة',
    taglineFr: 'Le meilleur équilibre volume / collaboration.',
    taglineAr: 'أفضل توازن بين الحجم والتعاون.',
    benefitsFr: [
      'Multi-sociétés et équipe jusqu’à 5 utilisateurs',
      'Volume confortable pour TVA, IR et facturation',
      'Priorité usage au quotidien',
    ],
    benefitsAr: [
      'عدة شركات وفريق حتى 5 مستخدمين',
      'حجم مريح لـ TVA وIR والفوترة',
      'أولوية للاستخدام اليومي',
    ],
    isMostPopular: true,
  },
  business: {
    funnelId: 'business',
    personaTitleFr: 'Cabinet — Cabinets & groupes',
    personaTitleAr: 'Cabinet — مكاتب ومجموعات',
    taglineFr: 'Limites élevées pour plusieurs dossiers clients.',
    taglineAr: 'حدود عالية لعدة ملفات عملاء.',
    benefitsFr: [
      'Jusqu’à 70 sociétés et 12 utilisateurs',
      'Pilotage de portefeuilles clients',
      'Conçu pour la production cabinet',
    ],
    benefitsAr: [
      'حتى 70 شركة و12 مستخدماً',
      'إدارة محافظ العملاء',
      'مصمم لإنتاج المكاتب',
    ],
  },
};

export function getFunnelPlanPresentations(): FunnelPlanPresentation[] {
  return FUNNEL_PLAN_IDS.map((id) => {
    const plan = ATLAS_PRICING_PLANS.find((p) => p.id === id);
    if (!plan) throw new Error(`Missing pricing plan: ${id}`);
    const meta = FUNNEL_META[id];
    return {
      plan,
      funnelId: id,
      personaTitleFr: meta.personaTitleFr,
      personaTitleAr: meta.personaTitleAr,
      taglineFr: meta.taglineFr,
      taglineAr: meta.taglineAr,
      benefitsFr: meta.benefitsFr,
      benefitsAr: meta.benefitsAr,
      isMostPopular: meta.isMostPopular ?? false,
    };
  });
}

export function monthlyEquivalentMad(plan: AtlasPricingPlan): string {
  if (plan.billingPeriod !== 'year') return '—';
  const m = Math.round(plan.price / 12);
  return `${m.toLocaleString('fr-MA')} MAD/mois`;
}

export { formatLimit, formatPriceMadYear };
