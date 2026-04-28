/**
 * In-process sliding-window rate limiter for API routes.
 * Suitable for single-node deployments; for horizontal scale, swap for Redis (Upstash, etc.).
 */

type Bucket = { windowStartMs: number; count: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = Math.max(
  60_000,
  Number.parseInt(process.env.AI_RATE_LIMIT_WINDOW_MS ?? '3600000', 10) || 3_600_000,
);

const MAX_REQUESTS = Math.max(
  1,
  Number.parseInt(process.env.AI_RATE_LIMIT_MAX_PER_WINDOW ?? '120', 10) || 120,
);

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

/**
 * @param key Stable identifier (e.g. Supabase user id)
 */
export function checkAiRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  let b = buckets.get(key);

  if (!b || now - b.windowStartMs >= WINDOW_MS) {
    b = { windowStartMs: now, count: 0 };
    buckets.set(key, b);
  }

  if (b.count >= MAX_REQUESTS) {
    const retryAfterSec = Math.ceil((b.windowStartMs + WINDOW_MS - now) / 1000);
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  b.count += 1;
  return { ok: true };
}
