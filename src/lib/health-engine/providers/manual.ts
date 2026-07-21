import { HealthData } from '../types';

export class ManualProvider {
  static getHealthData(manualInputs: {
    steps?: number;
    sleepHours?: number;
    hrv?: number;
    restingHeartRate?: number;
    currentHeartRate?: number;
    bloodOxygen?: number;
    systolic?: number;
    diastolic?: number;
    waterIntakeMl?: number;
    activeCalories?: number;
    mood?: number;
    screenTimeMin?: number;
    deepWorkMin?: number;
  }): HealthData {
    return {
      metadata: {
        timestamp: new Date(),
        source: "manual",
        quality: "manual",
        lastUpdated: new Date()
      },
      capabilities: {
        supportsHRV: manualInputs.hrv !== undefined,
        supportsBloodOxygen: manualInputs.bloodOxygen !== undefined,
        supportsBloodPressure: manualInputs.systolic !== undefined,
        supportsSleepStages: false,
        supportsWorkoutLogs: true
      },
      steps: manualInputs.steps ?? 10000,
      sleepHours: manualInputs.sleepHours ?? 7.0,
      sleepEfficiency: 88,
      sleepStages: {
        deep: (manualInputs.sleepHours ?? 7.0) * 0.2,
        rem: (manualInputs.sleepHours ?? 7.0) * 0.22,
        light: (manualInputs.sleepHours ?? 7.0) * 0.53,
        awake: (manualInputs.sleepHours ?? 7.0) * 0.05
      },
      hrv: manualInputs.hrv ?? 60,
      restingHeartRate: manualInputs.restingHeartRate ?? 65,
      currentHeartRate: manualInputs.currentHeartRate ?? 70,
      bloodOxygen: manualInputs.bloodOxygen ?? 98,
      bloodPressure: {
        systolic: manualInputs.systolic ?? 120,
        diastolic: manualInputs.diastolic ?? 80
      },
      waterIntakeMl: manualInputs.waterIntakeMl ?? 1500,
      activeCalories: manualInputs.activeCalories ?? 300,
      mood: manualInputs.mood ?? 3,
      screenTimeMin: manualInputs.screenTimeMin ?? 240,
      deepWorkMin: manualInputs.deepWorkMin ?? 180
    };
  }
}
