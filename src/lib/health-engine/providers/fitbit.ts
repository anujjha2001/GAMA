import { HealthData } from '../types';

export class FitbitProvider {
  static getHealthData(): HealthData {
    return {
      metadata: {
        timestamp: new Date(),
        source: "fitbit",
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
      steps: 10500,
      sleepHours: 6.2,
      sleepEfficiency: 82,
      sleepStages: {
        deep: 0.9,
        rem: 1.1,
        light: 3.6,
        awake: 0.6
      },
      hrv: 45,
      restingHeartRate: 68,
      currentHeartRate: 74,
      bloodOxygen: 95,
      waterIntakeMl: 1400,
      activeCalories: 290,
      mood: 2,
      screenTimeMin: 320,
      deepWorkMin: 120
    };
  }
}
