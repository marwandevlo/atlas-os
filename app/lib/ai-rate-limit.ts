type RateLimitOk = { ok: true };
type RateLimitErr = { ok: false; retryAfterSec: number };

type Bucket = { windowStartMs: number; count: number };

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 30;

function getStore(): Map<string, Bucket> {
  const g = globalThis as unknown as { __atlasAiRateStore?: Map<string, Bucket> };
  if (!g.__atlasAiRateStore) g.__atlasAiRateStore = new Map();
  return g.__atlasAiRateStore;
}

export function checkAiRateLimit(key: string): RateLimitOk | RateLimitErr {
  const now = Date.now();
  const store = getStore();
  const bucket = store.get(key);

  if (!bucket || now - bucket.windowStartMs >= WINDOW_MS) {
    store.set(key, { windowStartMs: now, count: 1 });
    return { ok: true };
  }

  if (bucket.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSec = Math.max(1, Math.ceil((WINDOW_MS - (now - bucket.windowStartMs)) / 1000));
    return { ok: false, retryAfterSec };
  }

  bucket.count += 1;
  store.set(key, bucket);
  return { ok: true };
}

