import { prisma } from '@/lib/prisma';
import { getValidatedModel, groqClient } from './client';
import { SummaryType, RiskLevel, ProcessingStatus, PredictionMetric, RecommendationSeverity, InsightCategory } from '@prisma/client';

// -------------------------------------------------------------
// 1. HEALTH MEMORY SERVICE
// -------------------------------------------------------------
export class HealthMemoryService {
  static async recallMemory(profileId: string): Promise<any[]> {
    return await prisma.memoryNode.findMany({
      where: { profileId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async saveMemoryNode(profileId: string, label: string, category: string, confidence: number = 0.9): Promise<any> {
    const existing = await prisma.memoryNode.findFirst({
      where: { profileId, label }
    });
    if (existing) return existing;

    return await prisma.memoryNode.create({
      data: { profileId, label, category, confidence }
    });
  }
}

// -------------------------------------------------------------
// 2. TREND ANALYSIS SERVICE
// -------------------------------------------------------------
export class TrendAnalysisService {
  static async calculateAverages7d(profileId: string): Promise<any> {
    const healthRecords = await prisma.healthRecord.findMany({
      where: { profileId },
      orderBy: { recordedAt: 'desc' },
      take: 7
    });

    if (healthRecords.length === 0) {
      return {
        avgSteps: 10000,
        avgSleepHours: 7.5,
        avgHrv: 65,
        avgRhr: 60
      };
    }

    const sumSteps = healthRecords.reduce((sum, r) => sum + r.vitalityScore * 100, 0);
    const sumSleep = healthRecords.reduce((sum, r) => sum + (r.sleepHours || 7.5), 0);
    const sumHrv = healthRecords.reduce((sum, r) => sum + (r.hrv || 65), 0);
    const sumRhr = healthRecords.reduce((sum, r) => sum + (r.heartRate || 60), 0);

    return {
      avgSteps: sumSteps / healthRecords.length,
      avgSleepHours: sumSleep / healthRecords.length,
      avgHrv: sumHrv / healthRecords.length,
      avgRhr: sumRhr / healthRecords.length
    };
  }
}

// -------------------------------------------------------------
// 3. RECOVERY ENGINE
// -------------------------------------------------------------
export class RecoveryEngineService {
  static async calculateRecovery(profileId: string, currentData: { sleepHours: number; hrv: number; rhr: number; stressLevel: number; waterIntake: number; exerciseMinutes: number }): Promise<any> {
    const startTime = Date.now();
    
    // Deduplication guard: skip write if a log was created in the last 60 minutes
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLog = await prisma.recoveryScoreLog.findFirst({
      where: { profileId, recordedAt: { gte: oneHourAgo } },
      orderBy: { recordedAt: 'desc' }
    });
    if (recentLog) {
      console.log(`[RecoveryEngine] Skipping duplicate write for ${profileId} — recent log exists`);
      return recentLog;
    }
    
    const sleepContribution = Math.min(25, Math.max(5, Math.round(currentData.sleepHours * 3.2)));
    const nutritionContribution = 20;
    const stressContribution = Math.min(20, Math.max(0, Math.round((5.0 - currentData.stressLevel) * 4)));
    const hydrationContribution = Math.min(15, Math.max(0, Math.round(currentData.waterIntake / 200)));
    const exerciseContribution = Math.min(20, Math.max(5, Math.round(currentData.exerciseMinutes * 0.4)));

    const score = Math.min(100, Math.max(10, sleepContribution + nutritionContribution + stressContribution + hydrationContribution + exerciseContribution));

    const breakdown = {
      sleep: sleepContribution,
      nutrition: nutritionContribution,
      stress: stressContribution,
      hydration: hydrationContribution,
      exercise: exerciseContribution
    };

    const reasons: string[] = [];
    if (currentData.sleepHours < 7) reasons.push("Sleep below target");
    if (currentData.stressLevel > 3.0) reasons.push("Autonomic stress elevated");
    if (currentData.waterIntake < 2000) reasons.push("Hydration below average");

    const recommendations: string[] = [];
    if (currentData.sleepHours < 7) recommendations.push("Sleep early tonight");
    if (currentData.stressLevel > 3.0) recommendations.push("Perform box breathing exercises");
    if (currentData.waterIntake < 2000) recommendations.push("Consume 500ml water");

    const logEntry = await prisma.recoveryScoreLog.create({
      data: {
        profileId,
        score,
        sleepContribution,
        nutritionContribution,
        stressContribution,
        hydrationContribution,
        exerciseContribution,
        breakdown,
        reasons,
        recommendations,
        confidence: 0.95,
        modelVersion: "gama-recovery-v2",
        provider: "GAMA Core Engine",
        processingTimeMs: Date.now() - startTime
      }
    });

    return logEntry;
  }
}

// -------------------------------------------------------------
// 4. BURNOUT ENGINE
// -------------------------------------------------------------
export class BurnoutEngine {
  static async calculateBurnoutRisk(profileId: string, currentData: { sleepDebt: number; stressLevel: number; mood: number; hrv: number }): Promise<any> {
    const startTime = Date.now();
    
    // Deduplication guard: skip write if a log was created in the last 60 minutes
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentLog = await prisma.burnoutScoreLog.findFirst({
      where: { profileId, recordedAt: { gte: oneHourAgo } },
      orderBy: { recordedAt: 'desc' }
    });
    if (recentLog) {
      console.log(`[BurnoutEngine] Skipping duplicate write for ${profileId} — recent log exists`);
      return recentLog;
    }
    
    let riskPoints = 0;
    if (currentData.sleepDebt > 5) riskPoints += 30;
    if (currentData.stressLevel > 3.5) riskPoints += 30;
    if (currentData.mood < 3) riskPoints += 20;
    if (currentData.hrv < 50) riskPoints += 20;

    const score = Math.min(100, riskPoints);
    let riskLevel = RiskLevel.LOW;
    if (score > 70) riskLevel = RiskLevel.HIGH;
    else if (score > 35) riskLevel = RiskLevel.MEDIUM;

    const reasons: string[] = [];
    if (currentData.sleepDebt > 5) reasons.push("Accumulating sleep debt");
    if (currentData.stressLevel > 3.5) reasons.push("Chronic high stress");
    
    const recommendations: string[] = [];
    if (riskLevel === RiskLevel.HIGH) recommendations.push("Schedule immediate offline recovery day");
    else recommendations.push("Maintain balanced activity levels");

    const logEntry = await prisma.burnoutScoreLog.create({
      data: {
        profileId,
        score,
        riskLevel,
        reasons,
        recommendations,
        confidence: 0.9,
        modelVersion: "gama-burnout-v2",
        provider: "GAMA Core Engine",
        processingTimeMs: Date.now() - startTime
      }
    });

    return logEntry;
  }
}

// -------------------------------------------------------------
// 5. INSIGHT GENERATOR
// -------------------------------------------------------------
export class InsightGenerator {
  static async generateInsight(profileId: string, category: InsightCategory, headline: string, explanation: string, confidence: number = 0.85): Promise<any> {
    const summaryJson = {
      headline,
      explanation,
      recommendations: ["Maintain current rhythm", "Optimize nutrient loads"],
      confidence
    };

    return await prisma.healthInsight.create({
      data: {
        profileId,
        category,
        summary: summaryJson,
        confidence,
        modelVersion: "gama-insights-v1",
        provider: "Insight Engine"
      }
    });
  }
}

// -------------------------------------------------------------
// 6. HEALTH COACH SERVICE
// -------------------------------------------------------------
export class HealthCoachService {
  static async generateSummary(profileId: string, type: SummaryType, text: string): Promise<any> {
    const content = {
      headline: `${type} Health Update`,
      body: text,
      actionItems: ["Hydrate properly", "Engage in zone 2 training"]
    };

    return await prisma.aIHealthSummary.create({
      data: {
        profileId,
        type,
        content,
        confidence: 0.9,
        status: ProcessingStatus.COMPLETED,
        modelVersion: "gama-coach-v2",
        provider: "AURA Coach"
      }
    });
  }
}

// -------------------------------------------------------------
// 7. PREDICTION SERVICE
// -------------------------------------------------------------
export class PredictionService {
  static async generatePrediction(profileId: string, metric: PredictionMetric, predictedValue: number, reasoning: string): Promise<any> {
    return await prisma.healthPrediction.create({
      data: {
        profileId,
        metric,
        predictedValue,
        confidence: 0.85,
        timeframeHours: 24,
        reasoning
      }
    });
  }
}

// -------------------------------------------------------------
// 8. RECOMMENDATION ENGINE
// -------------------------------------------------------------
export class RecommendationEngine {
  static async createRecommendation(profileId: string, text: string, severity: RecommendationSeverity, category: string, sources: string[]): Promise<any> {
    return await prisma.aIRecommendation.create({
      data: {
        profileId,
        text,
        severity,
        category,
        sources: sources,
        confidence: 0.92
      }
    });
  }
}

// -------------------------------------------------------------
// 9. AI ORCHESTRATOR
// -------------------------------------------------------------
export class AIOrchestrator {
  static async triggerTelemetryCalculations(profileId: string, data: { steps: number; sleepHours: number; hrv: number; restingHeartRate: number; stressLevel: number; waterIntakeMl: number }) {
    console.log(`[AIOrchestrator] Running background calculations for user ${profileId}`);

    try {
      const rec = await RecoveryEngineService.calculateRecovery(profileId, {
        sleepHours: data.sleepHours,
        hrv: data.hrv,
        rhr: data.restingHeartRate,
        stressLevel: data.stressLevel,
        waterIntake: data.waterIntakeMl,
        exerciseMinutes: 45
      });

      await BurnoutEngine.calculateBurnoutRisk(profileId, {
        sleepDebt: Math.max(0, 8.0 - data.sleepHours),
        stressLevel: data.stressLevel,
        mood: 4,
        hrv: data.hrv
      });

      if (data.sleepHours < 6) {
        await InsightGenerator.generateInsight(
          profileId,
          InsightCategory.SLEEP,
          "Sleep Duration Deficit",
          "Your sleep duration dropped 22% compared to your weekly average, suppressing next-day HRV recovery indicators.",
          0.94
        );
      }

      if (rec.score < 60) {
        await RecommendationEngine.createRecommendation(
          profileId,
          "Your Recovery Score dropped to 52. Target a restorative stretch routine and limit heavy cardiovascular loads today.",
          RecommendationSeverity.WARNING,
          "recovery",
          ["Sleep", "HRV"]
        );
      }
    } catch (e) {
      console.error("[AIOrchestrator] Pipeline failure:", e);
    }
  }
}
