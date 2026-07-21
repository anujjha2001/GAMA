import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';
import { BaselineEngine } from '../core/baseline';

export class StressEngine implements RegisteredHealthEngine {
  id = "stress";
  name = "Stress Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.stress.weights;
    
    // Normalize HRV input (lower is worse/higher stress)
    // HRV baseline comparison
    const hrvDeviation = BaselineEngine.calculateDeviation(input.hrv, baseline.hrvAvg7d);
    let hrvStressContribution = 50; // mid-range
    if (hrvDeviation < 0) {
      // HRV below baseline = higher stress contribution
      hrvStressContribution = Math.min(100, 50 + Math.abs(hrvDeviation) * 1.5);
    } else {
      hrvStressContribution = Math.max(0, 50 - hrvDeviation * 1.0);
    }

    // Normalize RHR input (higher is worse/higher stress)
    const rhrDeviation = BaselineEngine.calculateDeviation(input.restingHeartRate, baseline.restingHrAvg7d);
    let rhrStressContribution = 50;
    if (rhrDeviation > 0) {
      rhrStressContribution = Math.min(100, 50 + rhrDeviation * 2.0);
    } else {
      rhrStressContribution = Math.max(0, 50 - Math.abs(rhrDeviation) * 1.5);
    }

    // Sleep contribution (lower sleep = higher stress)
    const sleepDeficit = Math.max(0, baseline.sleepAvg7d - input.sleepHours);
    const sleepStressContribution = Math.min(100, (sleepDeficit / 3.0) * 100);

    // Activity contribution (very low steps = higher physiological stress, high steps = lower stress)
    const activityRatio = Math.min(1.5, input.steps / baseline.activityAvg7d);
    const activityStressContribution = Math.max(0, 100 - activityRatio * 70);

    // Mood contribution
    const moodFactor = input.mood ? (5 - input.mood) / 4 * 100 : 50;

    // Weighted calculations
    const finalScore = Math.round(
      hrvStressContribution * weights.hrv +
      rhrStressContribution * weights.restingHeartRate +
      sleepStressContribution * weights.sleep +
      activityStressContribution * weights.activity +
      moodFactor * weights.mood
    );

    // Factor Breakdown
    const factors = [
      { metric: "Heart Rate Variability", contribution: Math.round((hrvStressContribution - 50) * weights.hrv) },
      { metric: "Resting Heart Rate", contribution: Math.round((rhrStressContribution - 50) * weights.restingHeartRate) },
      { metric: "Sleep Debt", contribution: Math.round((sleepStressContribution - 50) * weights.sleep) },
      { metric: "Activity Level", contribution: Math.round((activityStressContribution - 50) * weights.activity) }
    ];

    let status = HealthStatus.Average;
    if (finalScore < 25) status = HealthStatus.Excellent;
    else if (finalScore < 45) status = HealthStatus.Good;
    else if (finalScore < 65) status = HealthStatus.Average;
    else if (finalScore < 85) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: input.capabilities.supportsHRV ? 95 : 60,
      factors,
      status,
      algorithmVersion: config.algorithms.stress.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
