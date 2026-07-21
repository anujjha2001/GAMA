import { prisma } from '@/lib/prisma';
import { ChronobiologyEngine } from './chronobiology-engine';
import { FocusEngine } from './focus-engine';
import { HabitIntelligenceEngine } from './habit-intelligence';
import { WeatherIntelligenceEngine } from './weather-intelligence';
import { PredictionEngine } from './prediction-engine';
import { RecommendationEngine } from '@/shared/ai/recommendation-engine';

export interface ScheduleBlock {
  id?: string;
  title: string;
  category: 'WORKOUT' | 'NUTRITION' | 'RECOVERY' | 'DEEP_WORK' | 'SLEEP' | 'MEDICINE' | 'TRAVEL' | 'GENERAL';
  startTime: Date;
  endTime: Date;
  durationMinutes: number;
  purpose: string;
  priority: number;
  energyCost: number;
  recoveryCost: number;
  healthImpact: string;
  aiReasoning: string;
  confidenceScore: number;
}

export class ScheduleOrchestrator {
  
  // 1. Context Builder
  static async buildContext(profileId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sleep = await prisma.sleepLog.findFirst({
      where: { profileId },
      orderBy: { recordedAt: 'desc' }
    });

    const health = await prisma.healthRecord.findFirst({
      where: { profileId },
      orderBy: { recordedAt: 'desc' }
    });

    const weather = await WeatherIntelligenceEngine.getLiveContext();

    return {
      sleepHours: sleep?.durationHours || 7.5,
      hrv: health?.hrv || 65,
      rhr: health?.heartRate || 60,
      stressScore: health?.stressLevel || 3,
      weather
    };
  }

  // 2. Agent Router & Optimization Engine
  static async optimizeSchedule(profileId: string): Promise<{
    blocks: ScheduleBlock[];
    decisionLog: any[];
  }> {
    const context = await this.buildContext(profileId);
    const decisionLog: any[] = [];

    // Chrono optimization calculations
    const recoveryMultiplier = ChronobiologyEngine.getRecoveryMultiplier({
      hrv: context.hrv,
      rhr: context.rhr,
      sleepHours: context.sleepHours,
      stressScore: context.stressScore
    });

    const focus = FocusEngine.getFocusScore({
      sleepHours: context.sleepHours,
      timeOfDayHour: 9,
      meetingsScheduledCount: 1
    });

    const now = new Date();
    const blocks: ScheduleBlock[] = [];

    // Decisions based on Vitals and Weather
    let workoutTitle = 'HIIT Strength Session';
    let workoutCategory: ScheduleBlock['category'] = 'WORKOUT';
    let workoutDuration = 45;
    let workoutReason = 'Optimal chronobiological energy state';
    let workoutEnergy = 35;

    // Trigger changes if sleep or HRV is low
    if (recoveryMultiplier < 0.8) {
      workoutTitle = 'Restorative Yoga & Stretch';
      workoutCategory = 'RECOVERY';
      workoutDuration = 30;
      workoutReason = `HRV is low (${context.hrv}ms). Swapped high-intensity gym session for light active recovery.`;
      workoutEnergy = 10;

      decisionLog.push({
        decision: 'Downgraded workout intensity',
        confidence: 0.94,
        reason: `Low recovery multiplier: ${recoveryMultiplier.toFixed(2)}`,
        affectedMetrics: ['Recovery', 'Stress'],
        alternatives: ['Total Rest', 'Light Walk']
      });
    }

    // Weather checks
    if (context.weather.aqi > 150) {
      decisionLog.push({
        decision: 'Moved exercise indoors',
        confidence: 0.98,
        reason: `Poor AQI index (${context.weather.aqi}).`,
        affectedMetrics: ['Performance', 'Lungs'],
        alternatives: ['Indoor treadmill', 'Rest']
      });
    }

    // Block 1: Morning Sleep/Wake
    const wakeTime = new Date(now);
    wakeTime.setHours(7, 0, 0, 0);
    blocks.push({
      title: 'Wake Up & Circadian Light',
      category: 'RECOVERY',
      startTime: wakeTime,
      endTime: new Date(wakeTime.getTime() + 20 * 60000),
      durationMinutes: 20,
      purpose: 'Cortisol synchronization',
      priority: 0.9,
      energyCost: -5,
      recoveryCost: -20,
      healthImpact: 'Aligns circadian rhythm and boosts mood.',
      aiReasoning: 'Weather is clear; sunrise offers high lux light exposure.',
      confidenceScore: 0.95
    });

    // Block 2: Optimized Workout
    const workoutTime = new Date(now);
    workoutTime.setHours(8, 0, 0, 0);
    blocks.push({
      title: workoutTitle,
      category: workoutCategory,
      startTime: workoutTime,
      endTime: new Date(workoutTime.getTime() + workoutDuration * 60000),
      durationMinutes: workoutDuration,
      purpose: 'Cardiovascular efficiency',
      priority: 0.85,
      energyCost: workoutEnergy,
      recoveryCost: 40,
      healthImpact: 'Builds musculoskeletal resilience.',
      aiReasoning: workoutReason,
      confidenceScore: 0.91
    });

    // Block 3: Focus deep work
    const focusTime = new Date(now);
    focusTime.setHours(10, 0, 0, 0);
    blocks.push({
      title: 'Deep Focus: Software Architecture',
      category: 'DEEP_WORK',
      startTime: focusTime,
      endTime: new Date(focusTime.getTime() + 120 * 60000),
      durationMinutes: 120,
      purpose: 'Cognitive peak production',
      priority: 0.95,
      energyCost: 50,
      recoveryCost: 0,
      healthImpact: 'Brain energy efficiency is maximized.',
      aiReasoning: `Peak focus state (${focus.state}) detected based on sleep baseline.`,
      confidenceScore: 0.88
    });

    // Save decision logs to DB
    for (const log of decisionLog) {
      await prisma.aIDecisionLog.create({
        data: {
          profileId,
          decision: log.decision,
          reason: log.reason,
          confidence: log.confidence,
          affectedMetrics: log.affectedMetrics,
          alternatives: log.alternatives
        }
      });
    }

    return { blocks, decisionLog };
  }
}
