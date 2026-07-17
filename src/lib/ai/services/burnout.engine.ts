import { prisma } from "@/lib/prisma";

export class BurnoutEngine {
  /**
   * Synthesizes Sleep Debt, Stress levels, Mood trends, and activity to predict burnout risks.
   */
  static async evaluate(profileId: string) {
    console.log(`[BurnoutEngine] Evaluating burnout risk for profile: ${profileId}`);

    // Mock evaluation logic
    const score = 45;
    const riskLevel = "MEDIUM";

    const burnoutLog = await prisma.burnoutScoreLog.create({
      data: {
        profileId,
        score,
        riskLevel,
        reasons: ["Consistent lack of sleep", "High stress recorded"],
        recommendations: ["Take a day off from heavy workouts", "Prioritize 8 hours of sleep"],
        confidence: 0.85,
        modelVersion: "v1-heuristic", // or AI model
        processingTimeMs: 45,
      }
    });

    return burnoutLog;
  }
}
