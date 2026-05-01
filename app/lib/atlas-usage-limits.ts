import { getAtlasPlanById, type AtlasLimit, type AtlasPricingPlan, type AtlasPricingPlan as Plan } from '@/app/lib/atlas-pricing-plans';

export type AtlasUsage = {
  companies: number;
  users: number;
  operations: number;
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
};

export type LimitLevel = 'ok' | 'warning' | 'limit';

export type LimitDecision = {
  /** We keep this "soft": when at limit, we still allow but surface messaging. */
  allowed: true;
  level: LimitLevel;
  messageAr?: string;
  messageFr?: string;
  used: number;
  limit: number | null;
  percent: number | null; // 0..1 or null for unlimited/fair usage
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
  };
  // ensure key exists for future reads
  writeJson(ATLAS_USAGE_STORAGE_KEY, next);
  return next;
}

export function setUsage(next: AtlasUsage): void {
  writeJson(ATLAS_USAGE_STORAGE_KEY, {
    companies: normalizeNumber(next.companies),
    users: normalizeNumber(next.users),
    operations: normalizeNumber(next.operations),
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
  // unlimited / fair usage
  return null;
}

export function getPlanLimits(plan: Plan | null = getActivePlan()): {
  companies: number | null;
  users: number | null;
  operations: number | null;
} {
  if (!plan) return { companies: null, users: null, operations: null };
  return {
    companies: limitToNumber(plan.companiesLimit),
    users: limitToNumber(plan.usersLimit),
    operations: limitToNumber(plan.operationsLimit),
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

function decide(used: number, limit: number | null): LimitDecision {
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
      messageAr: 'وصلت الحد الأقصى، قم بترقية الباقة',
      messageFr: 'Limite atteinte — veuillez mettre à niveau votre forfait.',
      used,
      limit: safeLimit,
      percent: 1,
    };
  }
  if (clamped >= 0.8) {
    return {
      allowed: true,
      level: 'warning',
      messageAr: 'لقد استعملت %80 من الباقة',
      messageFr: 'Vous avez utilisé 80% de votre forfait.',
      used,
      limit: safeLimit,
      percent: clamped,
    };
  }
  return { allowed: true, level: 'ok', used, limit: safeLimit, percent: clamped };
}

export function canCreateCompany(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decide(usage.companies, limits.companies);
}

export function canInviteUser(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decide(usage.users, limits.users);
}

export function canPerformOperation(): LimitDecision {
  const plan = getActivePlan();
  const limits = getPlanLimits(plan);
  const usage = getUsage();
  return decide(usage.operations, limits.operations);
}

