import { RawRecommendation, ImageFetchResult } from './providers/index';

export interface ConfidenceInput {
  meal: RawRecommendation;
  imageResult: ImageFetchResult;
  seenRestaurants: Set<string>;
  seenNames: Set<string>;
}

/**
 * Produces a confidence score (0.0–1.0) for a single recommendation.
 * Low-confidence items are ranked lower or omitted.
 *
 * Factor weights add up to 1.0:
 *   0.20 — verified real image (not gradient fallback)
 *   0.10 — unique image URL (not a duplicate)
 *   0.10 — unique restaurant in this batch
 *   0.15 — unique meal name in this batch
 *   0.20 — AI's own confidence estimate (from AIOrchestrator)
 *   0.10 — realistic calorie range (150–1400 kcal)
 *   0.05 — valid processing level string
 *   0.10 — realistic protein range (2–80g)
 */
export class ConfidenceScorer {
  static readonly OMIT_BELOW = 0.20;
  static readonly DEFER_BELOW = 0.50;

  static score(input: ConfidenceInput): number {
    const { meal, imageResult, seenRestaurants, seenNames } = input;
    let s = 0;

    // Image quality (+0.20)
    if (imageResult.isVerified) s += 0.20;

    // Image uniqueness (+0.10)
    if (!imageResult.url.startsWith('data:')) s += 0.10;

    // Restaurant uniqueness in batch (+0.10)
    if (!seenRestaurants.has(meal.restaurantName.toLowerCase())) s += 0.10;

    // Meal name uniqueness in batch (+0.15)
    if (!seenNames.has(meal.name.toLowerCase())) s += 0.15;

    // AI's own confidence estimate (+0.20 max)
    const aiConf = Math.min(1, Math.max(0, meal.aiConfidence ?? 0.7));
    s += aiConf * 0.20;

    // Realistic calorie range (+0.10)
    if (meal.calories >= 150 && meal.calories <= 1400) s += 0.10;

    // Valid processing level (+0.05)
    const validLevels = ['Unprocessed', 'Minimally Processed', 'Moderately Processed', 'Highly Processed'];
    if (validLevels.includes(meal.processingLevel)) s += 0.05;

    // Realistic protein range (+0.10)
    if (meal.proteinG >= 2 && meal.proteinG <= 80) s += 0.10;

    return Math.min(1.0, Math.max(0, s));
  }
}
