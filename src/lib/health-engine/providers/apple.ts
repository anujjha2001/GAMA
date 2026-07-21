import { HealthData } from '../types';

export class AppleProvider {
  static getHealthData(): HealthData {
    return {
      metadata: {
        timestamp: new Date(),
        source: "apple",
        quality: "live",
        lastUpdated: new Date()
      },
      capabilities: {
        supportsHRV: true,
        supportsBloodOxygen: true,
        supportsBloodPressure: false,
        supportsSleepStages: true,
        supportsWorkoutLogs: true
      },
      steps: 12400,
      sleepHours: 6.8,
      sleepEfficiency: 85,
      sleepStages: {
        deep: 1.1,
        rem: 1.3,
        light: 3.8,
        awake: 0.6
      },
      hrv: 62,
      restingHeartRate: 64,
      currentHeartRate: 72,
      bloodOxygen: 97,
      waterIntakeMl: 1500,
      activeCalories: 380,
      mood: 3,
      screenTimeMin: 220,
      deepWorkMin: 180
    };
  }
}
