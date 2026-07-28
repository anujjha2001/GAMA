import { NextRequest, NextResponse } from 'next/server';
import { AIRecommendationProvider } from '@/lib/ai/marketplace/providers/ai-recommendation-provider';
import { UnsplashImageProvider } from '@/lib/ai/marketplace/providers/unsplash-image-provider';
import { PexelsImageProvider } from '@/lib/ai/marketplace/providers/pexels-image-provider';
import { GradientFallbackProvider } from '@/lib/ai/marketplace/providers/gradient-fallback-provider';
import { ProviderChain } from '@/lib/ai/marketplace/provider-chain';
import { ConfidenceScorer } from '@/lib/ai/marketplace/confidence-scorer';
import { DiversityEnforcer } from '@/lib/ai/marketplace/diversity-enforcer';
import {
  recommendationCache,
  imageUrlCache,
  buildCacheKey,
  hashContext,
  RECOMMENDATION_TTL_MS,
  IMAGE_CACHE_TTL_MS,
} from '@/lib/ai/marketplace/recommendation-cache';
import {
  emitMetrics,
  hashUserId,
  computeAvgConfidence,
  buildCuisineDistribution,
} from '@/lib/ai/marketplace/observability';
import { Meal } from '@/lib/ai/marketplace/food-provider';
import { RawRecommendation, RecommendationContext } from '@/lib/ai/marketplace/providers/index';

// Vercel max function duration (seconds)
export const maxDuration = 60;

// ─── Module-level provider singletons (reused across warm requests) ────────────
const aiProvider = new AIRecommendationProvider();
const unsplashProvider = new UnsplashImageProvider();
const pexelsProvider = new PexelsImageProvider();
const gradientProvider = new GradientFallbackProvider();

const recChain = new ProviderChain([aiProvider]);
const imgChain = new ProviderChain([unsplashProvider, pexelsProvider, gradientProvider]);

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const startMs = Date.now();

  // ── Auth ────────────────────────────────────────────────────────────────────
  // We rely on the session cookie / JWT that the app sets; just read the user
  // from the session without exposing health data to any external party.
  let userId = 'anonymous';
  try {
    // Dynamic import to avoid issues if auth lib isn't available in all envs
    const authModule = await import('@/lib/auth').catch(() => null);
    if (authModule && typeof authModule.getServerSession === 'function') {
      const session = await authModule.getServerSession();
      if (session?.user?.id) userId = session.user.id;
    }
  } catch { /* proceed without auth guard for Phase 1 */ }

  // ── Parse body ──────────────────────────────────────────────────────────────
  let body: {
    recsSeed?: number;
    context?: {
      weather?: string;
      city?: string;
      fitnessGoal?: string;
      biometricSummary?: string;
      workoutToday?: string;
    };
  } = {};
  try { body = await request.json(); } catch { /* use defaults */ }

  const recsSeed = body.recsSeed ?? Date.now();
  const clientCtx = body.context ?? {};

  // ── Build privacy-safe context (never includes raw biometrics) ──────────────
  const context: RecommendationContext = {
    timeOfDay: getTimeOfDay(),
    weather: sanitizeString(clientCtx.weather, 'Clear'),
    city: sanitizeString(clientCtx.city, 'Bengaluru'),
    fitnessGoal: sanitizeString(clientCtx.fitnessGoal, 'Balanced Nutrition'),
    biometricSummary: sanitizeString(clientCtx.biometricSummary, 'Normal baseline health metrics'),
    workoutToday: sanitizeString(clientCtx.workoutToday, 'No workout logged'),
    seed: recsSeed,
  };

  // ── Cache lookup ────────────────────────────────────────────────────────────
  // Seed excluded from context hash so same health context in same time window
  // returns the same array (prevents micro-variations breaking cache)
  const { seed: _omit, ...contextWithoutSeed } = context;
  const contextHash = hashContext(contextWithoutSeed as Record<string, unknown>);
  const cacheKey = buildCacheKey(userId, recsSeed, contextHash);

  const cached = recommendationCache.get(cacheKey);
  if (cached) {
    emitMetrics({
      event: 'recommendations_generated',
      userId: hashUserId(userId),
      recsSeed,
      cacheHit: true,
      totalMs: Date.now() - startMs,
      imageResolutionMs: 0,
      providerUsed: 'MemoryCache',
      providerFailures: [],
      duplicatesRemoved: 0,
      imageFallbackCount: 0,
      mealsReturned: cached.length,
      cuisineDistribution: buildCuisineDistribution(cached),
      avgConfidence: computeAvgConfidence(cached),
    });

    return NextResponse.json(
      { success: true, recommendations: cached, fromCache: true },
      { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
    );
  }

  // ── Generate recommendations ────────────────────────────────────────────────
  let rawMeals: RawRecommendation[] = [];
  let providerUsed = 'None';
  const providerFailures: string[] = [];

  try {
    rawMeals = await recChain.execute(p => p.generate(context));
    providerUsed = aiProvider.name;
    providerFailures.push(...recChain.getFailures());
  } catch (err: any) {
    providerFailures.push(...recChain.getFailures());
    console.error('[Recommendations] All recommendation providers failed:', err?.message);

    return NextResponse.json(
      {
        success: false,
        error: 'Recommendations are temporarily unavailable. Please try refreshing in a moment.',
        recommendations: [],
      },
      { status: 503 }
    );
  }

  // ── Resolve images (parallel, capped at 5 concurrent) ──────────────────────
  const imageStartMs = Date.now();
  const usedImageUrls = new Set<string>();
  const seenRestaurants = new Set<string>();
  const seenNames = new Set<string>();
  let imageFallbackCount = 0;
  let duplicatesRemoved = 0;

  const CONCURRENCY = 5;
  const enrichedMeals: (Meal & { confidence: number; cuisineType: string })[] = [];

  for (let i = 0; i < rawMeals.length; i += CONCURRENCY) {
    const batch = rawMeals.slice(i, i + CONCURRENCY);

    const results = await Promise.all(
      batch.map(async (raw) => {
        // ── Dedup guard before image fetch ────────────────────────────────
        const nameKey = raw.name.toLowerCase().trim();
        const restKey = raw.restaurantName.toLowerCase().trim();

        if (seenNames.has(nameKey) || seenRestaurants.has(restKey)) {
          duplicatesRemoved++;
          return null;
        }

        // ── Image resolution ──────────────────────────────────────────────
        const imgCacheKey = `img:${raw.imageQuery}`;
        let imageUrl: string;
        let imageVerified = false;
        let imgProviderName = '';

        // Check in-process image cache first
        const cachedImg = imageUrlCache.get(imgCacheKey);
        if (cachedImg && !usedImageUrls.has(cachedImg)) {
          imageUrl = cachedImg;
          imageVerified = !imageUrl.startsWith('data:');
          imgProviderName = 'ImageCache';
        } else {
          try {
            const imgResult = await imgChain.execute(p =>
              p.fetchImage(raw.imageQuery, usedImageUrls)
            );

            if (imgResult) {
              imageUrl = imgResult.url;
              imageVerified = imgResult.isVerified;
              imgProviderName = imgResult.providerName;
              // Cache verified (non-gradient) URLs for reuse across requests
              if (imageVerified) {
                imageUrlCache.set(imgCacheKey, imageUrl, IMAGE_CACHE_TTL_MS);
              }
            } else {
              // imgChain always has gradient fallback — this branch is safety only
              const fb = await gradientProvider.fetchImage(raw.imageQuery, usedImageUrls);
              imageUrl = fb!.url;
              imageVerified = false;
              imgProviderName = 'GradientFallback';
            }
          } catch {
            const fb = await gradientProvider.fetchImage(raw.imageQuery, usedImageUrls);
            imageUrl = fb!.url;
            imageVerified = false;
            imgProviderName = 'GradientFallback';
          }
        }

        if (!imageVerified) imageFallbackCount++;

        // ── Confidence scoring ────────────────────────────────────────────
        const confidence = ConfidenceScorer.score({
          meal: raw,
          imageResult: { url: imageUrl, isVerified: imageVerified, providerName: imgProviderName },
          seenRestaurants,
          seenNames,
        });

        // Omit very low-confidence entries
        if (confidence < ConfidenceScorer.OMIT_BELOW) {
          duplicatesRemoved++;
          return null;
        }

        // Commit uniqueness trackers
        usedImageUrls.add(imageUrl);
        seenRestaurants.add(restKey);
        seenNames.add(nameKey);

        // ── Map RawRecommendation → Meal ──────────────────────────────────
        const meal: Meal & { confidence: number; cuisineType: string } = {
          id: `rec-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 7)}`,
          name: raw.name,
          restaurantId: `rest-${restKey.replace(/\s+/g, '-').slice(0, 40)}`,
          restaurantName: raw.restaurantName,
          platform: 'Swiggy',
          imageUrl,
          price: Math.max(80, Math.round(raw.price)),
          category: raw.category || 'Lunch',
          auraScore: Math.min(99, Math.max(60, raw.auraScore)),
          nutrients: {
            calories: raw.calories,
            proteinG: raw.proteinG,
            carbsG: raw.carbsG,
            fatG: raw.fatG,
            fiberG: raw.fiberG,
            sugarG: raw.sugarG,
            sodiumMg: raw.sodiumMg,
            glycemicLoad: raw.glycemicLoad,
            processingLevel: raw.processingLevel,
            vitamins: [],
            minerals: [],
          },
          scores: {
            overall: raw.auraScore,
            recovery: Math.min(100, raw.auraScore + 3),
            protein: Math.min(100, Math.round((raw.proteinG / 50) * 100)),
            digestion:
              raw.processingLevel === 'Unprocessed' ? 95 :
              raw.processingLevel === 'Minimally Processed' ? 85 :
              raw.processingLevel === 'Moderately Processed' ? 70 : 55,
            sleep: 78,
            workout: raw.auraScore,
            hydration: 74,
            brain: 79,
            longevity: raw.auraScore,
            gut: 77,
            inflammation:
              raw.processingLevel === 'Unprocessed' ? 92 :
              raw.processingLevel === 'Minimally Processed' ? 82 : 68,
          },
          whyRecommend: raw.whyRecommend,
          whyAvoid:
            raw.processingLevel === 'Highly Processed'
              ? 'This meal is highly processed. Consume in moderation and pair with high-fiber sides.'
              : raw.sodiumMg > 1200
                ? 'Sodium content is above recommended daily limit. Drink extra water with this meal.'
                : 'No major concerns identified.',
          alternativeName: '',
          alternativeId: '',
          expectedFeeling: (raw.expectedFeeling as Meal['expectedFeeling']) || 'Energized',
          confidence,
          cuisineType: raw.cuisine,
        };

        return meal;
      })
    );

    for (const m of results) {
      if (m !== null) enrichedMeals.push(m);
    }
  }

  const imageResolutionMs = Date.now() - imageStartMs;

  // ── Rank: auraScore × confidence, descending ────────────────────────────────
  enrichedMeals.sort((a, b) => (b.auraScore * b.confidence) - (a.auraScore * a.confidence));

  // ── Apply diversity rules ───────────────────────────────────────────────────
  const diverse = DiversityEnforcer.apply(enrichedMeals);

  // ── Cache result ────────────────────────────────────────────────────────────
  recommendationCache.set(cacheKey, diverse, RECOMMENDATION_TTL_MS);

  // ── Observability ───────────────────────────────────────────────────────────
  emitMetrics({
    event: 'recommendations_generated',
    userId: hashUserId(userId),
    recsSeed,
    cacheHit: false,
    totalMs: Date.now() - startMs,
    imageResolutionMs,
    providerUsed,
    providerFailures,
    duplicatesRemoved,
    imageFallbackCount,
    mealsReturned: diverse.length,
    cuisineDistribution: buildCuisineDistribution(diverse),
    avgConfidence: computeAvgConfidence(diverse),
  });

  return NextResponse.json(
    { success: true, recommendations: diverse, fromCache: false },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } }
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getTimeOfDay(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Night';
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  if (h < 21) return 'Evening';
  return 'Night';
}

function sanitizeString(val: string | undefined, fallback: string): string {
  if (!val || typeof val !== 'string') return fallback;
  // Strip any potential injection — allow letters, digits, common punctuation
  return val.replace(/[^\w\s.,!?%-]/g, '').slice(0, 120).trim() || fallback;
}
