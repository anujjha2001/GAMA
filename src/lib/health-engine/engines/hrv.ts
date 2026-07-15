import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';
import { BaselineEngine } from '../core/baseline';

export class HrvEngine implements RegisteredHealthEngine {
  id = "hrv";
  name = "HRV Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const deviation = BaselineEngine.calculateDeviation(input.hrv, baseline.hrvAvg7d);
    
    // Normalizing HRV score. Standard score is centered around baseline.
    // 0 deviation = 80 score.
    // Positive deviation boosts to 100.
    // Negative deviation drops score.
    let score = 80;
    if (deviation >= 0) {
      score = Math.min(100, 80 + deviation * 0.5);
    } else {
      score = Math.max(10, 80 - Math.abs(deviation) * 1.5);
    }

    const factors = [
      { metric: "Weekly Baseline Comparison", contribution: Math.round(deviation) },
      { metric: "Autonomic Nervous Control", contribution: input.hrv > 65 ? 10 : -15 }
    ];

    let status = HealthStatus.Average;
    if (score >= 85) status = HealthStatus.Excellent;
    else if (score >= 70) status = HealthStatus.Good;
    else if (score >= 50) status = HealthStatus.Average;
    else if (score >= 30) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: Math.round(score),
      confidence: input.capabilities.supportsHRV ? 100 : 40,
      factors,
      status,
      algorithmVersion: "1.0.0",
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
