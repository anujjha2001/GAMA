import { prisma } from "@/lib/prisma";
import { PredictionMetric } from "@prisma/client";

export class PredictionService {
  static async predict(profileId: string, metric: PredictionMetric) {
    console.log(`[PredictionService] Predicting ${metric} for profile: ${profileId}`);
    
    return await prisma.healthPrediction.create({
      data: {
        profileId,
        metric,
        predictedValue: 75.5,
        confidence: 0.82,
        timeframeHours: 24,
        reasoning: "Based on recent sleep and diet trends.",
      }
    });
  }
}
