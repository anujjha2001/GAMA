/**
 * Observability — structured JSON logging for every recommendation pipeline run.
 * Logs are visible in the Vercel real-time logs panel.
 * userId is always hashed before logging (privacy requirement).
 */

export interface RecommendationMetrics {
  event: 'recommendations_generated';
  /** FNV-hashed user ID — never the real value */
  userId: string;
  recsSeed: number;
  cacheHit: boolean;
  totalMs: number;
  imageResolutionMs: number;
  providerUsed: string;
  providerFailures: string[];
  duplicatesRemoved: number;
  imageFallbackCount: number;
  mealsReturned: number;
  cuisineDistribution: Record<string, number>;
  avgConfidence: number;
}

export function emitMetrics(metrics: RecommendationMetrics): void {
  // Single JSON line — parseable by log aggregation tools
  console.log(JSON.stringify(metrics));
}

/** FNV-1a hash of a userId string for privacy-safe logging */
export function hashUserId(id: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36);
}

/** Compute average confidence across a meal array */
export function computeAvgConfidence(meals: { confidence?: number }[]): number {
  if (!meals.length) return 0;
  const sum = meals.reduce((acc, m) => acc + (m.confidence ?? 0.7), 0);
  return Math.round((sum / meals.length) * 100) / 100;
}

/** Build cuisine distribution map for logging */
export function buildCuisineDistribution(meals: { cuisineType?: string; category?: string }[]): Record<string, number> {
  const dist: Record<string, number> = {};
  for (const m of meals) {
    const c = m.cuisineType || m.category || 'Unknown';
    dist[c] = (dist[c] ?? 0) + 1;
  }
  return dist;
}
