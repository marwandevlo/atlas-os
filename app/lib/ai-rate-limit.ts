type RateOk = { ok: true };
type RateErr = { ok: false; retryAfterSec: number };
export type RateLimitResult = RateOk | RateErr;

type Bucket = { count: number; resetAtMs: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 25;

export function checkAiRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAtMs) {
    buckets.set(key, { count: 1, resetAtMs: now + WINDOW_MS });
    return { ok: true };
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterMs = Math.max(0, existing.resetAtMs - now);
    return { ok: false, retryAfterSec: Math.ceil(retryAfterMs / 1000) };
  }

  existing.count += 1;
  return { ok: true };
}

