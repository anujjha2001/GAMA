import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';

export class EnergyEngine implements RegisteredHealthEngine {
  id = "energy";
  name = "Energy Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.energy.weights;

    // 1. Sleep score
    const sleepScore = (input.sleepHours / baseline.sleepAvg7d) * 100;

    // 2. Activity / Step factor (more steps = higher energy expenditure and active circulation)
    const activityScore = Math.min(100, (input.steps / baseline.activityAvg7d) * 100);

    // 3. Hydration score
    const hydrationScore = Math.min(100, (input.waterIntakeMl / 2500) * 100);

    // 4. Stress level penalty
    const stressPenalty = (input.hrv < baseline.hrvAvg7d) ? 15 : 0;

    const calculatedEnergy = (
      sleepScore * weights.sleep +
      activityScore * weights.activity +
      hydrationScore * weights.hydration
    ) - stressPenalty;

    const finalScore = Math.round(Math.max(10, Math.min(100, calculatedEnergy)));

    const factors = [
      { metric: "Circadian Recharge (Sleep)", contribution: Math.round((sleepScore - 80) * weights.sleep) },
      { metric: "Hydration Balance", contribution: Math.round((hydrationScore - 80) * weights.hydration) },
      { metric: "Metabolic Output (Steps)", contribution: Math.round((activityScore - 80) * weights.activity) }
    ];

    let status = HealthStatus.Average;
    if (finalScore >= 85) status = HealthStatus.Excellent;
    else if (finalScore >= 70) status = HealthStatus.Good;
    else if (finalScore >= 50) status = HealthStatus.Average;
    else if (finalScore >= 30) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: 85,
      factors,
      status,
      algorithmVersion: config.algorithms.energy.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
