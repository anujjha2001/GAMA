import { prisma } from "@/lib/prisma";
import { RecommendationSeverity } from "@prisma/client";

export class RecommendationEngine {
  static async suggest(profileId: string) {
    console.log(`[RecommendationEngine] Generating recommendations for profile: ${profileId}`);
    return await prisma.aIRecommendation.create({
      data: {
        profileId,
        text: "Increase protein intake by 20g.",
        severity: "INFO",
        category: "Nutrition",
        sources: ["Sleep", "NutritionLog"],
        confidence: 0.88,
      }
    });
  }
}
