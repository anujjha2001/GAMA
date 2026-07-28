/**
 * In-process memory cache for recommendation results and image URLs.
 *
 * Vercel serverless functions don't share memory across instances.
 * This cache reduces redundant provider calls within the same warm instance.
 * Edge-level caching (Cache-Control headers) handles cross-instance caching.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

class TTLCache<T> {
  private readonly store = new Map<string, CacheEntry<T>>();

  set(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  get(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /** Purge all expired entries (call periodically if needed) */
  purge(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) this.store.delete(key);
    }
  }
}

// ─── Module-level singletons (survive warm serverless restarts) ───────────────

/** Caches fully built recommendation arrays */
export const recommendationCache = new TTLCache<any[]>();

/** Caches resolved image URLs per query string */
export const imageUrlCache = new TTLCache<string>();

export const RECOMMENDATION_TTL_MS = 5 * 60 * 1_000; // 5 minutes
export const IMAGE_CACHE_TTL_MS = 60 * 60 * 1_000;    // 1 hour

/**
 * Build a stable cache key.
 * seed is bucketed into 5-minute windows so the same seed always returns
 * the same result within that window (prevents cache storms on rapid refresh).
 */
export function buildCacheKey(userId: string, seed: number, contextHash: string): string {
  const seedBucket = Math.floor(seed / RECOMMENDATION_TTL_MS);
  return `rec:${userId}:${seedBucket}:${contextHash}`;
}

/** FNV-1a hash of an object (context without seed, to avoid seed invalidating context cache) */
export function hashContext(obj: Record<string, unknown>): string {
  const str = JSON.stringify(obj, Object.keys(obj).sort());
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}
