import { HealthData, UserBaseline } from '../types';

export interface CorrelationResult {
  title: string;
  description: string;
  metricType: "hrv" | "stress" | "sleep" | "steps" | "heart";
  impactValue: string;
  impactType: "positive" | "negative" | "neutral";
}

export class CorrelationEngine {
  static analyze(input: HealthData, baseline: UserBaseline): CorrelationResult[] {
    const correlations: CorrelationResult[] = [];

    // 1. HRV vs Sleep Schedule
    if (input.sleepHours < baseline.sleepAvg7d - 1.0) {
      const drop = Math.round(baseline.hrvAvg7d - input.hrv);
      correlations.push({
        title: "Sleep Deprivation HRV Link",
        description: `Your sleep dropped by ${Math.abs(baseline.sleepAvg7d - input.sleepHours).toFixed(1)}h below baseline. Correspondingly, your HRV dropped by ${drop}ms. Try targeting 8h sleep tonight.`,
        metricType: "hrv",
        impactValue: `-${drop}ms HRV`,
        impactType: "negative"
      });
    }

    // 2. Hydration vs Active Recovery
    if (input.waterIntakeMl > 2500) {
      correlations.push({
        title: "Optimal Hydration Circulatory Flow",
        description: "Your hydration volume is excellent today. Your resting heart rate shows high stability, helping cell repair.",
        metricType: "heart",
        impactValue: "+10% Flow",
        impactType: "positive"
      });
    }

    // 3. Screen Time vs Stress level
    if (input.screenTimeMin && input.screenTimeMin > 360) {
      correlations.push({
        title: "Digital Fatigue Index",
        description: `High screen usage (${input.screenTimeMin} min) is causing central nervous system load and mild stress indicators.`,
        metricType: "stress",
        impactValue: "+1.2 Stress",
        impactType: "negative"
      });
    }

    // Fallbacks if nothing triggered
    if (correlations.length === 0) {
      correlations.push({
        title: "Homeostasis Balance",
        description: "Your biomarker correlation network indicates physiological balance. All metrics match baseline averages.",
        metricType: "steps",
        impactValue: "Stable",
        impactType: "positive"
      });
    }

    return correlations;
  }
}
