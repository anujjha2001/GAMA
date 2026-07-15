import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';

export class WellnessEngine implements RegisteredHealthEngine {
  id = "wellness";
  name = "Wellness Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    // Wellness aggregates scores: Sleep, HRV, Steps, and Stress
    // Sleep: target 8h. HRV: deviation. Steps: target baseline. Stress: raw level.
    // Let's implement the standard GAMA formulas using normalized scores
    const sleepWeight = input.sleepHours * 10;
    const stepsWeight = input.steps / 250;
    
    // We compute a wellness score based on balanced parameters
    const hrvFactor = input.hrv;
    const stressFactor = input.hrv < baseline.hrvAvg7d ? 1.5 : 1.0;

    const rawWellness = (sleepWeight + hrvFactor + stepsWeight) / (stressFactor * 3.5);
    const finalScore = Math.round(Math.min(100, Math.max(10, rawWellness)));

    const factors = [
      { metric: "Circadian Sleep Quality", contribution: Math.round(sleepWeight / 3.5 - 25) },
      { metric: "Autonomic Reserve (HRV)", contribution: Math.round(hrvFactor / 3.5 - 25) },
      { metric: "Metabolic Step Volume", contribution: Math.round(stepsWeight / 3.5 - 25) }
    ];

    let status = HealthStatus.Average;
    if (finalScore >= 80) status = HealthStatus.Excellent;
    else if (finalScore >= 70) status = HealthStatus.Good;
    else if (finalScore >= 50) status = HealthStatus.Average;
    else if (finalScore >= 35) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: 90,
      factors,
      status,
      algorithmVersion: "1.0.0",
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
