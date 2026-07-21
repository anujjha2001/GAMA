import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';
import { BaselineEngine } from '../core/baseline';

export class RecoveryEngine implements RegisteredHealthEngine {
  id = "recovery";
  name = "Recovery Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.recovery.weights;

    // 1. Sleep quality contribution
    const sleepRatio = Math.min(1.2, input.sleepHours / baseline.sleepAvg7d);
    const sleepScore = sleepRatio * 100;

    // 2. HRV baseline contribution
    const hrvDeviation = BaselineEngine.calculateDeviation(input.hrv, baseline.hrvAvg7d);
    let hrvScore = 80;
    if (hrvDeviation >= 0) {
      hrvScore = Math.min(100, 80 + hrvDeviation * 0.5);
    } else {
      hrvScore = Math.max(20, 80 - Math.abs(hrvDeviation) * 1.5);
    }

    // 3. Resting HR baseline contribution
    const rhrDeviation = BaselineEngine.calculateDeviation(input.restingHeartRate, baseline.restingHrAvg7d);
    let rhrScore = 80;
    if (rhrDeviation <= 0) {
      rhrScore = Math.min(100, 80 + Math.abs(rhrDeviation) * 1.0);
    } else {
      rhrScore = Math.max(20, 80 - rhrDeviation * 2.0);
    }

    // 4. Stress deduction
    // High stress drains recovery
    const stressDeduction = (input.screenTimeMin && input.screenTimeMin > 300) ? 20 : 0;
    
    // Weighted Calculation
    const calculatedRecovery = (
      sleepScore * weights.sleep +
      hrvScore * weights.hrv +
      rhrScore * weights.restingHeartRate
    ) - stressDeduction;

    const finalScore = Math.round(Math.max(10, Math.min(100, calculatedRecovery)));

    const factors = [
      { metric: "Autonomic Recovery (HRV)", contribution: Math.round((hrvScore - 80) * weights.hrv) },
      { metric: "Sleep Rejuvenation", contribution: Math.round((sleepScore - 80) * weights.sleep) },
      { metric: "Cardiovascular Load (RHR)", contribution: Math.round((rhrScore - 80) * weights.restingHeartRate) }
    ];

    let status = HealthStatus.Average;
    if (finalScore >= 85) status = HealthStatus.Excellent;
    else if (finalScore >= 66) status = HealthStatus.Good;
    else if (finalScore >= 50) status = HealthStatus.Average;
    else if (finalScore >= 30) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: input.capabilities.supportsHRV && input.capabilities.supportsSleepStages ? 98 : 65,
      factors,
      status,
      algorithmVersion: config.algorithms.recovery.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
