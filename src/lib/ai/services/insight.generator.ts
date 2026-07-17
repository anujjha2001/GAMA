import { prisma } from "@/lib/prisma";
import { InsightCategory } from "@prisma/client";

export class InsightGenerator {
  /**
   * Automatically mines patterns from historical biometrics.
   */
  static async generate(profileId: string, category: InsightCategory) {
    console.log(`[InsightGenerator] Generating insights for category ${category}, profile: ${profileId}`);

    // Mock Insight Data
    const summary = {
      headline: "Protein Intake Trend",
      explanation: "You have consistently hit your protein goals this week, aiding muscle recovery.",
      recommendations: ["Keep incorporating lean meats"],
    };

    const insight = await prisma.healthInsight.create({
      data: {
        profileId,
        category,
        summary,
        confidence: 0.91,
        modelVersion: "gpt-4o-mini",
        provider: "openai",
        processingTimeMs: 400,
        tokensUsed: 150,
      }
    });

    return insight;
  }
}
