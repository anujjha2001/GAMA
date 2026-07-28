/**
 * Provider abstraction layer — Phase 1
 * Every external data source implements one of these interfaces.
 * The ProviderChain tries each in order, auto-falling back on failure.
 */

// ─── Context passed to recommendation providers ───────────────────────────────
export interface RecommendationContext {
  /** "Morning" | "Afternoon" | "Evening" | "Night" */
  timeOfDay: string;
  /** e.g. "Hot & Humid" | "Monsoon Rain" | "Cool Winter" */
  weather: string;
  /** Coarse city name only — never GPS coordinates */
  city: string;
  /** e.g. "Muscle Gain" | "Weight Loss" | "Keto" */
  fitnessGoal: string;
  /**
   * Human-readable bucketed summary of biometrics.
   * NEVER includes raw HRV, BPM, or precise health values.
   * Example: "good sleep, low stress, strong HRV recovery"
   */
  biometricSummary: string;
  /** e.g. "Leg day completed" | "Rest day" | "No workout logged" */
  workoutToday: string;
  /** Random seed — drives variety between refreshes */
  seed: number;
}

// ─── Shape of a raw meal from the AI provider, before image resolution ────────
export interface RawRecommendation {
  name: string;
  restaurantName: string;
  cuisine: string;
  country: string;
  city: string;
  /** Specific dish description for food photography search */
  imageQuery: string;
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  glycemicLoad: number;
  processingLevel: 'Unprocessed' | 'Minimally Processed' | 'Moderately Processed' | 'Highly Processed';
  /** 0–100 health score */
  auraScore: number;
  /** 2–3 sentence personalized paragraph citing user biometrics */
  whyRecommend: string;
  /** Estimated price in INR */
  price: number;
  category: string;
  expectedFeeling: 'Energized' | 'Heavy' | 'Sleepy' | 'Perfect Before Workout' | 'Perfect Before Sleep';
  /** AI's own confidence in accuracy of this entry (0.0–1.0) */
  aiConfidence: number;
}

// ─── Result of a single image fetch attempt ───────────────────────────────────
export interface ImageFetchResult {
  url: string;
  /** true = real photo, false = generated gradient fallback */
  isVerified: boolean;
  providerName: string;
}

// ─── Provider contracts ────────────────────────────────────────────────────────
export interface RecommendationProvider {
  readonly name: string;
  generate(context: RecommendationContext): Promise<RawRecommendation[]>;
  isHealthy(): boolean;
  markUnhealthy(durationMs?: number): void;
}

export interface ImageProvider {
  readonly name: string;
  /** usedUrls: Set of image URLs already committed in this batch */
  fetchImage(query: string, usedUrls: Set<string>): Promise<ImageFetchResult | null>;
  isHealthy(): boolean;
  markUnhealthy(durationMs?: number): void;
}
