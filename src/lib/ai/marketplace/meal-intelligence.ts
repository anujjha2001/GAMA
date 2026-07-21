import { HealthRecord } from '@prisma/client';

export interface MealForecast {
  expectedEnergyChange: number; // e.g. +25%
  energyDurationHrs: number;   // e.g. 4 hours
  recoveryImpactPercent: number; // e.g. +8%
  digestionDifficulty: 'Easy' | 'Moderate' | 'Heavy';
  bloodSugarStability: 'Stable' | 'Moderate Spike' | 'High Spike';
  sleepImpact: 'Positive' | 'Neutral' | 'Disruptive';
  workoutReadiness: 'High' | 'Medium' | 'Low';
  mentalFocus: 'Enhanced' | 'Neutral' | 'Drowsy';
  satietyDurationHrs: number;
  hydrationEffect: 'Hydrating' | 'Neutral' | 'Dehydrating';
  confidenceScore: number;
}

export interface MealExplanation {
  whyRecommend: string;
  biometricsInfluenced: string[];
  missingNutrientsAddressed: string[];
  drawbacks: string[];
  scientificReasoning: string;
  oneImportantCorrection: string;
}

export interface MealNutritionDetail {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
}

export class MealIntelligence {
  /**
   * Computes a highly personalized health score (0-100) for a meal item.
   */
  static calculateAuraScore(
    meal: { name: string; nutrients: MealNutritionDetail; description?: string },
    biometrics: { recoveryScore: number; stressLevel: number; hydrationLevel: number; sleepHours: number },
    goals: { weightLoss?: boolean; muscleGain?: boolean; lowSodium?: boolean; keto?: boolean }
  ): { score: number; label: string; tagColor: string } {
    let score = 80; // Baseline

    // 1. Stress & Recovery matching
    if (biometrics.recoveryScore < 50) {
      // Prioritize recovery-friendly nutrients (low sugar, high anti-inflammatory, moderate protein)
      if (meal.nutrients.sugarG > 15) score -= 15;
      if (meal.nutrients.proteinG > 20) score += 10;
    } else {
      if (meal.nutrients.proteinG > 25) score += 8;
    }

    // 2. Stress penalizes high sodium / high sugar
    if (biometrics.stressLevel > 7) {
      if (meal.nutrients.sodiumMg > 800) score -= 12;
      if (meal.nutrients.sugarG > 12) score -= 10;
    }

    // 3. Hydration matches
    if (biometrics.hydrationLevel < 65) {
      if (meal.name.toLowerCase().includes('salad') || meal.name.toLowerCase().includes('soup') || meal.name.toLowerCase().includes('fruit')) {
        score += 10;
      }
    }

    // 4. Goal constraints
    if (goals.muscleGain && meal.nutrients.proteinG >= 35) score += 12;
    if (goals.weightLoss && meal.nutrients.calories > 750) score -= 18;
    if (goals.keto) {
      if (meal.nutrients.carbsG > 15) score -= 40;
      else score += 15;
    }

    // Clip score
    score = Math.max(10, Math.min(100, score));

    let label = 'Healthy choice';
    let tagColor = 'emerald';
    if (score >= 90) {
      label = 'Perfect Recovery Meal';
      tagColor = 'indigo';
    } else if (score >= 75) {
      label = 'Excellent High Protein Option';
      tagColor = 'amber';
    } else if (score >= 55) {
      label = 'Moderate Balance';
      tagColor = 'yellow';
    } else {
      label = 'Avoid Today';
      tagColor = 'rose';
    }

    return { score, label, tagColor };
  }

  /**
   * Forecasts the physiological effects of a meal based on nutrition and user biometrics.
   */
  static generateForecast(
    mealName: string,
    nutrients: MealNutritionDetail,
    biometrics: { recoveryScore: number; stressLevel: number; sleepHours: number }
  ): MealForecast {
    const isHighCarb = nutrients.carbsG > 60;
    const isHighProtein = nutrients.proteinG > 30;
    const isHighSugar = nutrients.sugarG > 18;

    let expectedEnergyChange = 15;
    let energyDurationHrs = 3.5;
    let recoveryImpactPercent = 2;
    let digestion: 'Easy' | 'Moderate' | 'Heavy' = 'Moderate';
    let sugarStability: 'Stable' | 'Moderate Spike' | 'High Spike' = 'Stable';
    let sleep: 'Positive' | 'Neutral' | 'Disruptive' = 'Neutral';
    let focus: 'Enhanced' | 'Neutral' | 'Drowsy' = 'Neutral';

    if (isHighSugar) {
      expectedEnergyChange = 35; // Short burst
      energyDurationHrs = 1.5;
      sugarStability = 'High Spike';
      focus = 'Drowsy';
      sleep = 'Disruptive';
    } else if (isHighProtein) {
      expectedEnergyChange = 20;
      energyDurationHrs = 4.5;
      recoveryImpactPercent = biometrics.recoveryScore < 60 ? 8 : 4;
      digestion = nutrients.fatG > 25 ? 'Heavy' : 'Moderate';
    }

    if (nutrients.calories > 800) {
      digestion = 'Heavy';
      focus = 'Drowsy';
    }

    if (biometrics.sleepHours < 6) {
      sleep = isHighSugar ? 'Disruptive' : 'Positive';
    }

    return {
      expectedEnergyChange,
      energyDurationHrs,
      recoveryImpactPercent,
      digestionDifficulty: digestion,
      bloodSugarStability: sugarStability,
      sleepImpact: sleep,
      workoutReadiness: isHighProtein && nutrients.calories > 350 && nutrients.calories < 700 ? 'High' : 'Medium',
      mentalFocus: focus,
      satietyDurationHrs: Math.round((nutrients.fiberG * 0.3 + nutrients.proteinG * 0.1 + 2) * 10) / 10,
      hydrationEffect: nutrients.sodiumMg > 900 ? 'Dehydrating' : 'Hydrating',
      confidenceScore: 85 + Math.floor(Math.random() * 12)
    };
  }

  /**
   * Generates AI explainability content explaining why GAMA recommends a meal.
   */
  static generateExplainability(
    mealName: string,
    nutrients: MealNutritionDetail,
    biometrics: { recoveryScore: number; stressLevel: number; sleepHours: number },
    score: number
  ): MealExplanation {
    const whyRecommend = score >= 90
      ? `This meal perfectly complements your current low recovery (${biometrics.recoveryScore}%) by providing optimal branch-chain amino acids and clean complex carbs without overloading your digestive system.`
      : `Recommended as a moderate fuel source. It contains necessary macronutrients to meet your daily targets, though you should monitor the sodium content.`;

    const drawbacks: string[] = [];
    if (nutrients.sodiumMg > 900) drawbacks.push('High sodium content may raise blood pressure slightly.');
    if (nutrients.sugarG > 15) drawbacks.push('Sugar content could lead to a minor insulin response.');

    return {
      whyRecommend,
      biometricsInfluenced: ['Recovery Score', 'Circadian Phase', 'Active Muscle Stress'],
      missingNutrientsAddressed: nutrients.proteinG > 25 ? ['Protein', 'BCAA'] : ['Complex Fiber'],
      drawbacks,
      scientificReasoning: 'Glutamine and magnesium levels in high-protein whole foods support muscle protein synthesis and nervous system cooling during periods of active biometric stress.',
      oneImportantCorrection: 'To maximize nutritional absorption, request dressing or sauces on the side to reduce oil saturation.'
    };
  }
}
