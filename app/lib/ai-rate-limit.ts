type RateLimitResult = { ok: true } | { ok: false; retryAfterSec: number };

type Bucket = { resetAtMs: number; count: number };

const buckets = new Map<string, Bucket>();

function limits() {
  const windowSec = Number.parseInt(process.env.ATLAS_AI_RATE_WINDOW_SEC ?? '60', 10) || 60;
  const max = Number.parseInt(process.env.ATLAS_AI_RATE_MAX ?? '20', 10) || 20;
  return { windowSec: Math.max(10, windowSec), max: Math.max(1, max) };
}

/**
 * Simple in-memory rate limiter (per server instance).
 * Good enough to prevent accidental spam; can be swapped for Upstash/Redis later.
 */
export function checkAiRateLimit(key: string): RateLimitResult {
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

