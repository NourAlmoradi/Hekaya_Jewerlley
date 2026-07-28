/**
 * Best-effort in-memory, per-IP rate limiting for API routes.
 *
 * Scope and limits (unchanged from the original implementation in the memory
 * upload route): this is per server INSTANCE, not global. On a serverless
 * platform each cold start gets a fresh map and concurrent instances do not
 * share state, so it is a guard against casual abuse from one client, not a
 * hard quota. A real global limit needs a shared store — Upstash Redis is the
 * usual answer — and that is worth doing before any of these routes become
 * genuinely valuable to attack.
 *
 * What this fixes (H8): the original kept a `Map<string, number[]>` and pruned
 * old timestamps only when that SAME ip came back. An address that hit the
 * route once and never returned kept its entry for the lifetime of the process,
 * so the map grew without bound on a long-lived instance. Entries are now
 * dropped as soon as their window empties, and a sweep runs periodically to
 * collect addresses that never return.
 */

type Bucket = { hits: number[] };

export type RateLimitRule = {
  /** Max requests allowed inside the window. */
  limit: number;
  /** Sliding window length in milliseconds. */
  windowMs: number;
};

/** One map per named limiter, so routes cannot exhaust each other's budgets. */
const buckets = new Map<string, Map<string, Bucket>>();

/** Sweep every N calls rather than on a timer — serverless has no idle time. */
const SWEEP_EVERY = 500;
let callsSinceSweep = 0;

function sweep(now: number, windowMs: number, entries: Map<string, Bucket>) {
  for (const [key, bucket] of entries) {
    const fresh = bucket.hits.filter((t) => now - t < windowMs);
    if (fresh.length === 0) entries.delete(key);
    else bucket.hits = fresh;
  }
}

/**
 * Record a hit for `key` and report whether it exceeded the rule.
 *
 * @param name  Limiter name, e.g. "memory-upload". Keeps budgets separate.
 * @param key   Usually the client IP.
 * @returns `true` when the caller should be rejected with 429.
 */
export function rateLimited(
  name: string,
  key: string,
  { limit, windowMs }: RateLimitRule,
): boolean {
  const now = Date.now();
  let entries = buckets.get(name);
  if (!entries) {
    entries = new Map();
    buckets.set(name, entries);
  }

  if (++callsSinceSweep >= SWEEP_EVERY) {
    callsSinceSweep = 0;
    sweep(now, windowMs, entries);
  }

  const recent = (entries.get(key)?.hits ?? []).filter(
    (t) => now - t < windowMs,
  );
  recent.push(now);

  // Drop the key outright when nothing is left in the window, so one-shot
  // visitors do not accumulate forever.
  if (recent.length === 0) entries.delete(key);
  else entries.set(key, { hits: recent });

  return recent.length > limit;
}

/**
 * Best-effort client IP from the proxy headers Vercel sets.
 * Falls back to a constant so a missing header shares one bucket rather than
 * bypassing the limit entirely.
 */
export function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for") ?? "";
  return (
    forwarded.split(",")[0].trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Reset a limiter. Test-only. */
export function __resetRateLimits(name?: string) {
  if (name) buckets.delete(name);
  else buckets.clear();
}
