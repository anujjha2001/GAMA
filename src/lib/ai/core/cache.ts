export class CacheLayer {
  // Simple in-memory maps for Edge compatibility.
  // In a distributed production env, these would use Redis.
  private static responseCache = new Map<string, { value: any, expiresAt: number }>();
  private static semanticCache = new Map<string, { value: any, expiresAt: number }>();
  
  static async getResponse(cacheKey: string): Promise<any | null> {
    const item = this.responseCache.get(cacheKey);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.responseCache.delete(cacheKey);
      return null;
    }
    return item.value;
  }

  static async setResponse(cacheKey: string, value: any, ttlMs: number = 3600 * 1000) {
    this.responseCache.set(cacheKey, { value, expiresAt: Date.now() + ttlMs });
  }

  static async getSemantic(embedding: string): Promise<any | null> {
    // A mock semantic match (In reality, compare embedding cosines)
    return null;
  }

  static clearExpired() {
    const now = Date.now();
    for (const [k, v] of this.responseCache.entries()) {
      if (now > v.expiresAt) this.responseCache.delete(k);
    }
    for (const [k, v] of this.semanticCache.entries()) {
      if (now > v.expiresAt) this.semanticCache.delete(k);
    }
  }
}
