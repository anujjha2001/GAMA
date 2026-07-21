import { HealthData, Recommendation, RecommendationSeverity } from '../types';

export class RecommendationEngine {
  static generate(data: HealthData, stressScore: number, recoveryScore: number): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // 1. Critical breathing recommendation if stress is very high
    if (stressScore > 75) {
      recommendations.push({
        id: "rec_breathing",
        text: "Stress is high. Perform a 2-minute box breathing session (4s inhale, 4s hold, 4s exhale, 4s hold) to lower heart rate.",
        severity: RecommendationSeverity.Critical,
        category: "breathing",
        generatedFrom: ["stress"]
      });
    }

    // 2. High Hydration suggestion
    if (data.waterIntakeMl < 2000) {
      recommendations.push({
        id: "rec_water",
        text: "Hydration levels are low. Drink 500ml of mineralized water to optimize active cell repair.",
        severity: RecommendationSeverity.High,
        category: "hydration",
        generatedFrom: ["recovery"]
      });
    }

    // 3. Medium Sleep suggestion
    if (data.sleepHours < 7.0) {
      recommendations.push({
        id: "rec_sleep",
        text: "Target an early bedtime tonight to offset cumulative sleep debt and restore nervous systems.",
        severity: RecommendationSeverity.Medium,
        category: "sleep",
        generatedFrom: ["sleep", "recovery"]
      });
    }

    // 4. Low Active movement suggestion
    if (data.steps < 8000) {
      recommendations.push({
        id: "rec_movement",
        text: "Walk for 15 minutes to increase active recovery circulation and lymphatic flow.",
        severity: RecommendationSeverity.Low,
        category: "activity",
        generatedFrom: ["steps"]
      });
    }

    // Baseline fallback
    if (recommendations.length === 0) {
      recommendations.push({
        id: "rec_maintain",
        text: "All biometric parameters are in homeostasis. Maintain current training schedule and rest intervals.",
        severity: RecommendationSeverity.Low,
        category: "mind",
        generatedFrom: ["wellness"]
      });
    }

    return recommendations;
  }
}
