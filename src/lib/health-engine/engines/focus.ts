import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';

export class FocusEngine implements RegisteredHealthEngine {
  id = "focus";
  name = "Focus Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.focus.weights;

    // 1. Deep work ratio vs. 4-hour target (240 min)
    const deepWorkRatio = Math.min(100, ((input.deepWorkMin ?? 240) / 240) * 100);

    // 2. Screen Time penalty (exceeding 300 minutes penalty)
    const screenTime = input.screenTimeMin ?? 180;
    const screenTimePenalty = screenTime > 300 
      ? Math.min(100, ((screenTime - 300) / 240) * 100)
      : 0;
    const screenScore = Math.max(0, 100 - screenTimePenalty);

    // 3. Stress penalty (low HRV / elevated heart rate indicating anxiety or high distraction)
    const stressRatio = input.hrv < baseline.hrvAvg7d ? 35 : 0;
    const stressScore = Math.max(0, 100 - stressRatio);

    const calculatedFocus = (
      deepWorkRatio * weights.deepWorkRatio +
      screenScore * weights.screenTimePenalty +
      stressScore * weights.stressPenalty
    );

    const finalScore = Math.round(Math.max(10, Math.min(100, calculatedFocus)));

    const factors = [
      { metric: "Deep Flow Blocks", contribution: Math.round((deepWorkRatio - 80) * weights.deepWorkRatio) },
      { metric: "Digital Screen Fatigue", contribution: Math.round((screenScore - 80) * weights.screenTimePenalty) },
      { metric: "Autonomic Stress Control", contribution: Math.round((stressScore - 80) * weights.stressPenalty) }
    ];

    let status = HealthStatus.Average;
    if (finalScore >= 85) status = HealthStatus.Excellent;
    else if (finalScore >= 70) status = HealthStatus.Good;
    else if (finalScore >= 50) status = HealthStatus.Average;
    else if (finalScore >= 30) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: 80,
      factors,
      status,
      algorithmVersion: config.algorithms.focus.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
