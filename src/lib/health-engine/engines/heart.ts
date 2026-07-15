import { RegisteredHealthEngine, HealthData, UserBaseline, EngineResult, HealthStatus } from '../types';
import { config } from '../core/config';
import { BaselineEngine } from '../core/baseline';

export class HeartEngine implements RegisteredHealthEngine {
  id = "heart";
  name = "Heart Health Engine";

  calculate(input: HealthData, baseline: UserBaseline): EngineResult {
    const weights = config.algorithms.heart.weights;

    // Normal ranges: currentHR (60-80 rest, 120-160 activity), bloodOxygen (95-100)
    let currentHrScore = 100;
    if (input.currentHeartRate > 100) {
      currentHrScore = Math.max(30, 100 - (input.currentHeartRate - 100) * 1.2);
    } else if (input.currentHeartRate < 50) {
      currentHrScore = Math.max(50, 100 - (50 - input.currentHeartRate) * 2.0);
    }

    const rhrDeviation = BaselineEngine.calculateDeviation(input.restingHeartRate, baseline.restingHrAvg7d);
    let rhrScore = 100;
    if (Math.abs(rhrDeviation) > 10) {
      rhrScore = Math.max(40, 100 - Math.abs(rhrDeviation) * 1.5);
    }

    const hrvDeviation = BaselineEngine.calculateDeviation(input.hrv, baseline.hrvAvg7d);
    let hrvScore = 100;
    if (hrvDeviation < 0) {
      hrvScore = Math.max(30, 100 - Math.abs(hrvDeviation) * 1.8);
    }

    const oxygenScore = input.bloodOxygen ? (input.bloodOxygen >= 95 ? 100 : Math.max(10, 100 - (95 - input.bloodOxygen) * 15)) : 95;

    let bpScore = 100;
    if (input.bloodPressure) {
      const sysDiff = Math.abs(input.bloodPressure.systolic - 120);
      const diaDiff = Math.abs(input.bloodPressure.diastolic - 80);
      bpScore = Math.max(20, 100 - (sysDiff * 1.5 + diaDiff * 2));
    }

    const finalScore = Math.round(
      currentHrScore * weights.currentHeartRate +
      rhrScore * weights.restingHeartRate +
      hrvScore * weights.hrv +
      oxygenScore * weights.bloodOxygen +
      bpScore * weights.bloodPressure
    );

    const factors = [
      { metric: "Autonomic Balance (HRV)", contribution: Math.round((hrvScore - 100) * weights.hrv) },
      { metric: "Resting Heart Stability", contribution: Math.round((rhrScore - 100) * weights.restingHeartRate) },
      { metric: "Blood Oxygenation (SpO2)", contribution: Math.round((oxygenScore - 100) * weights.bloodOxygen) }
    ];

    let status = HealthStatus.Excellent;
    if (finalScore >= 85) status = HealthStatus.Excellent;
    else if (finalScore >= 70) status = HealthStatus.Good;
    else if (finalScore >= 55) status = HealthStatus.Average;
    else if (finalScore >= 40) status = HealthStatus.Poor;
    else status = HealthStatus.Critical;

    return {
      score: finalScore,
      confidence: input.capabilities.supportsBloodOxygen && input.capabilities.supportsHRV ? 98 : 70,
      factors,
      status,
      algorithmVersion: config.algorithms.heart.version,
      generatedAt: new Date(),
      provider: input.metadata.source
    };
  }
}
