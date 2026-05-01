type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = { resetAtMs: number; count: number };

const buckets = new Map<string, Bucket>();

function limits() {
  const windowSec = Number.parseInt(process.env.ATLAS_PAYMENT_RATE_WINDOW_SEC ?? '60', 10) || 60;
  const max = Number.parseInt(process.env.ATLAS_PAYMENT_RATE_MAX ?? '30', 10) || 30;
  return { windowSec: Math.max(10, windowSec), max: Math.max(1, max) };
}

/**
 * Simple in-memory rate limiter (per server instance).
 * Good enough to slow down spam on payment endpoints until Redis/Upstash is added.
 */
export function checkPaymentRateLimit(key: string): RateLimitResult {
  const { windowSec, max } = limits();
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAtMs <= now) {
    buckets.set(key, { resetAtMs: now + windowSec * 1000, count: 1 });
    return { ok: true };
  }

  if (existing.count >= max) {
    const retryAfterSec = Math.max(1, Math.ceil((existing.resetAtMs - now) / 1000));
    return { ok: false, retryAfterSec };
  }

  existing.count += 1;
  buckets.set(key, existing);
  return { ok: true };
}

