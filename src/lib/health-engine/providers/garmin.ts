import { HealthData } from '../types';

export class GarminProvider {
  static getHealthData(): HealthData {
    return {
      metadata: {
        timestamp: new Date(),
        source: "garmin",
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
      steps: 22100, // Highly active athlete
      sleepHours: 7.9,
      sleepEfficiency: 89,
      sleepStages: {
        deep: 1.8,
        rem: 1.6,
        light: 4.1,
        awake: 0.4
      },
      hrv: 88, // high fitness HRV
      restingHeartRate: 48, // low resting HR of an athlete
      currentHeartRate: 52,
      bloodOxygen: 99,
      waterIntakeMl: 3100,
      activeCalories: 820,
      mood: 5,
      screenTimeMin: 120,
      deepWorkMin: 300
    };
  }
}
