import { HealthData } from '../types';

export class OuraProvider {
  static getHealthData(): HealthData {
    return {
      metadata: {
        timestamp: new Date(),
        source: "oura",
        quality: "live",
        lastUpdated: new Date()
      },
      capabilities: {
        supportsHRV: true,
        supportsBloodOxygen: true,
        supportsBloodPressure: false,
        supportsSleepStages: true,
        supportsWorkoutLogs: false
      },
      steps: 8200,
      sleepHours: 8.4,
      sleepEfficiency: 95,
      sleepStages: {
        deep: 2.1,
        rem: 2.0,
        light: 3.8,
        awake: 0.5
      },
      hrv: 78,
      restingHeartRate: 56,
      currentHeartRate: 60,
      bloodOxygen: 98,
      waterIntakeMl: 2200,
      activeCalories: 310,
      mood: 4,
      screenTimeMin: 180,
      deepWorkMin: 220
    };
  }
}
