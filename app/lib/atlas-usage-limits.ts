import { todayYmd } from '@/app/lib/atlas-dates';
import { readCompaniesFromLocalStorage } from '@/app/lib/atlas-companies-repository';
import { getAtlasPlanById, type AtlasLimit, type AtlasPricingPlan, type AtlasPricingPlan as Plan } from '@/app/lib/atlas-pricing-plans';

export type AtlasUsage = {
  companies: number;
  users: number;
  operations: number;
  invoices: number;
};

export type AtlasUsageType = keyof AtlasUsage;

export type AtlasActiveSubscriptionLike = {
  planId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
};

export const ATLAS_USAGE_STORAGE_KEY = 'atlas_usage';
export const ATLAS_ACTIVE_SUBSCRIPTIONS_STORAGE_KEY = 'atlas_active_subscriptions';

export const DEFAULT_USAGE: AtlasUsage = {
  companies: 0,
  users: 0,
  operations: 0,
  invoices: 0,
};

export type LimitLevel = 'ok' | 'warning' | 'limit';

export type LimitDecision = {
  /** Soft limits keep navigation; hard limits set `allowed: false` for gated actions (create company / invoice). */
  allowed: boolean;
  level: LimitLevel;
  messageAr?: string;
  messageFr?: string;
  used: number;
  limit: number | null;
  percent: number | null;
};

function normalizeNumber(n: unknown): number {
  const v = typeof n === 'number' ? n : Number.parseFloat(String(n));
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.floor(v));
}

function readJson<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getUsage(): AtlasUsage {
  const raw = readJson<Partial<AtlasUsage>>(ATLAS_USAGE_STORAGE_KEY);
  if (!raw) {
    writeJson(ATLAS_USAGE_STORAGE_KEY, DEFAULT_USAGE);
    return { ...DEFAULT_USAGE };
  }
  const next: AtlasUsage = {
    companies: normalizeNumber(raw.companies),
    users: normalizeNumber(raw.users),
    operations: normalizeNumber(raw.operations),
    invoices: normalizeNumber(raw.invoices),
  };
  writeJson(ATLAS_USAGE_STORAGE_KEY, next);
  return next;
}

export function setUsage(next: AtlasUsage): void {
  writeJson(ATLAS_USAGE_STORAGE_KEY, {
    companies: normalizeNumber(next.companies),
    users: normalizeNumber(next.users),
    operations: normalizeNumber(next.operations),
    invoices: normalizeNumber(next.invoices),
  } satisfies AtlasUsage);
}

export function incrementUsage(type: AtlasUsageType, delta: number = 1): AtlasUsage {
  const current = getUsage();
  const next: AtlasUsage = { ...current, [type]: normalizeNumber((current[type] ?? 0) + delta) } as AtlasUsage;
  setUsage(next);
  return next;
}

function readActiveSubscriptions(): AtlasActiveSubscriptionLike[] {
  const raw = readJson<unknown>(ATLAS_ACTIVE_SUBSCRIPTIONS_STORAGE_KEY);
  if (!raw) return [];
  return Array.isArray(raw) ? (raw as AtlasActiveSubscriptionLike[]) : [];
}

export function getActivePlan(): AtlasPricingPlan | null {
  const subs = readActiveSubscriptions();
  const candidate =
    subs.find((s) => (s?.status === 'active' || s?.status === 'trial') && typeof s?.planId === 'string') ??
    subs.find((s) => typeof s?.planId === 'string') ??
    null;
  const planId = candidate?.planId;
  if (!planId) return null;
  return getAtlasPlanById(planId) ?? null;
}

function limitToNumber(limit: AtlasLimit): number | null {
  if (limit.kind === 'fixed') return normalizeNumber(limit.value);
  return null;
}

function invoicesLimitForPlan(plan: Plan | null): number | null {
  if (!plan?.invoicesLimit) return null;
  return limitToNumber(plan.invoicesLimit);
}

export function getPlanLimits(plan: Plan | null = getActivePlan()): {
  companies: number | null;
  users: number | null;
  operations: number | null;
  invoices: number | null;
} {
  if (!plan) return { companies: null, users: null, operations: null, invoices: null };
  return {
    companies: limitToNumber(plan.companiesLimit),
    users: limitToNumber(plan.usersLimit),
    operations: limitToNumber(plan.operationsLimit),
    invoices: invoicesLimitForPlan(plan),
  };
}

export function getUsagePercentage(type: AtlasUsageType): number | null {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const limit = limits[type];
  if (!limit || limit <= 0) return null;
  const usage = getUsage();
  return Math.min(1, usage[type] / limit);
}

/** Secondary actions (reminders, exports): always allowed, messaging only. */
function decideSoft(used: number, limit: number | null): LimitDecision {
  if (limit === null) {
    return { allowed: true, level: 'ok', used, limit: null, percent: null };
  }
  const safeLimit = Math.max(0, limit);
  const percent = safeLimit === 0 ? 1 : used / safeLimit;
  const clamped = Math.min(1, Math.max(0, percent));
  if (clamped >= 1) {
    return {
      allowed: true,
      level: 'limit',
      messageAr: 'وصلت الحد الأقصى للعمليات، قم بترقية الباقة',
      messageFr: 'Limite d’opérations atteinte — passez à une offre supérieure.',
      used,
      limit: safeLimit,
      percent: 1,
    };
  }
  if (clamped >= 0.8) {
    return {
      allowed: true,
      level: 'warning',
      messageAr: 'لقد استعملت أكثر من 80٪ من حد العمليات',
      messageFr: 'Vous approchez de la limite d’opérations de votre forfait.',
      used,
      limit: safeLimit,
      percent: clamped,
    };
  }
  return { allowed: true, level: 'ok', used, limit: safeLimit, percent: clamped };
}

/** Create company / invite / invoice: block at hard limit. */
function decideHard(used: number, limit: number | null, kind: 'company' | 'invoice' | 'user'): LimitDecision {
  if (limit === null) {
    return { allowed: true, level: 'ok', used, limit: null, percent: null };
  }
  const safeLimit = Math.max(0, limit);
  const percent = safeLimit === 0 ? 1 : used / safeLimit;
  const clamped = Math.min(1, Math.max(0, percent));
  if (clamped >= 1) {
    const msg =
      kind === 'company'
        ? {
            messageFr: 'Limite d’essai : une seule société. Passez à une offre payante pour en ajouter d’autres.',
            messageAr: 'حد التجربة: شركة واحدة فقط. ترقية الباقة لإضافة المزيد.',
          }
        : kind === 'invoice'
          ? {
              messageFr: 'Limite d’essai : 5 factures maximum. Mettez à niveau pour continuer.',
              messageAr: 'حد التجربة: 5 فواتير كحد أقصى. قم بالترقية للمتابعة.',
            }
          : {
              messageFr: 'Limite utilisateurs atteinte pour votre forfait.',
              messageAr: 'تم بلوغ حد المستخدمين لهذه الباقة.',
            };
    return {
      allowed: false,
      level: 'limit',
      ...msg,
      used,
      limit: safeLimit,
      percent: 1,
    };
  }
  if (clamped >= 0.8) {
    const warn =
      kind === 'invoice'
        ? {
            messageFr: 'Vous approchez de la limite de factures de l’essai gratuit.',
            messageAr: 'أنت قريب من الحد الأقصى لفواتير التجربة.',
          }
        : kind === 'company'
          ? {
              messageFr: 'L’essai gratuit autorise une seule société.',
              messageAr: 'التجربة المجانية تسمح بشركة واحدة.',
            }
          : {
              messageFr: 'Vous approchez de la limite utilisateurs.',
              messageAr: 'أنت قريب من حد المستخدمين.',
            };
    return {
      allowed: true,
      level: 'warning',
      ...warn,
      used,
      limit: safeLimit,
      percent: clamped,
    };
  }
  return { allowed: true, level: 'ok', used, limit: safeLimit, percent: clamped };
}

export function syncInvoiceUsageCount(invoiceCount: number): void {
  const plan = getActivePlan();
  if (!plan?.invoicesLimit || plan.invoicesLimit.kind !== 'fixed') return;
  const u = getUsage();
  setUsage({ ...u, invoices: normalizeNumber(invoiceCount) });
}

export function syncCompanyUsageCount(companyCount: number): void {
  const plan = getActivePlan();
  if (!plan) return;
  if (plan.companiesLimit.kind !== 'fixed') return;
  const u = getUsage();
  setUsage({ ...u, companies: normalizeNumber(companyCount) });
}

export function canCreateCompany(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const count = typeof window !== 'undefined' ? readCompaniesFromLocalStorage().length : getUsage().companies;
  return decideHard(count, limits.companies, 'company');
}

export function canInviteUser(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decideHard(usage.users, limits.users, 'user');
}

export function canCreateInvoice(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decideHard(usage.invoices, limits.invoices, 'invoice');
}

export function canPerformOperation(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decideSoft(usage.operations, limits.operations);
}

export type TrialCountdown = {
  isTrial: boolean;
  daysLeft: number;
  endDateYmd: string | null;
};

export function getTrialCountdown(): TrialCountdown {
  const sub = readActiveSubscriptions().find((s) => s?.status === 'trial' && typeof s?.endDate === 'string');
  if (!sub?.endDate) return { isTrial: false, daysLeft: 0, endDateYmd: null };
  const today = todayYmd();
  const end = sub.endDate;
  const toUtc = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map((x) => Number.parseInt(x, 10));
    return Date.UTC(y, m - 1, d);
  };
  const diff = Math.round((toUtc(end) - toUtc(today)) / (24 * 60 * 60 * 1000));
  return { isTrial: true, daysLeft: Math.max(0, diff), endDateYmd: end };
}
