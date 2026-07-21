import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';

export class SleepEngine implements RegisteredHealthEngine {
  id = "sleep";
  name = "Sleep Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.sleep.weights;

    // 1. Duration Score (target = 8 hours)
    const durationScore = input.sleepHours >= 8 
      ? Math.max(70, 100 - (input.sleepHours - 8) * 10) 
      : (input.sleepHours / 8) * 100;

    // 2. Efficiency
    const efficiencyScore = input.sleepEfficiency;

    // 3. Deep Sleep Ratio (Target >= 20% of sleep)
    const deepRatio = input.sleepHours > 0 ? (input.sleepStages.deep / input.sleepHours) * 100 : 0;
    const deepScore = deepRatio >= 20 ? 100 : (deepRatio / 20) * 100;

    // 4. REM Sleep Ratio (Target >= 22% of sleep)
    const remRatio = input.sleepHours > 0 ? (input.sleepStages.rem / input.sleepHours) * 100 : 0;
    const remScore = remRatio >= 22 ? 100 : (remRatio / 22) * 100;

    const finalScore = Math.round(
      durationScore * weights.duration +
      efficiencyScore * weights.efficiency +
      deepScore * weights.deepRatio +
      remScore * weights.remRatio
    );

    const factors = [
      { metric: "Sleep Duration Efficiency", contribution: Math.round((durationScore - 80) * weights.duration) },
      { metric: "REM Rejuvenation Cycles", contribution: Math.round((remScore - 80) * weights.remRatio) },
      { metric: "Deep Restorative Cycles", contribution: Math.round((deepScore - 80) * weights.deepRatio) }
    ];

    let status = HealthStatus.Average;
    if (finalScore >= 90) status = HealthStatus.Excellent;
    else if (finalScore >= 75) status = HealthStatus.Good;
    else if (finalScore >= 60) status = HealthStatus.Average;
    else if (finalScore >= 45) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: input.capabilities.supportsSleepStages ? 95 : 60,
      factors,
      status,
      algorithmVersion: config.algorithms.sleep.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
