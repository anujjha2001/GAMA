import { HealthData } from '../types';

export class Normalizer {
  static normalize(raw: any): HealthData {
    // Standardize string entries, undefined boundaries, etc.
    const steps = typeof raw.steps === 'number' ? Math.max(0, raw.steps) : 0;
    const sleepHours = typeof raw.sleepHours === 'number' ? Math.max(0, raw.sleepHours) : 8;
    const sleepEfficiency = typeof raw.sleepEfficiency === 'number' ? Math.max(0, Math.min(100, raw.sleepEfficiency)) : 90;
    
    const sleepStages = raw.sleepStages || {
      deep: sleepHours * 0.2,
      rem: sleepHours * 0.25,
      light: sleepHours * 0.5,
      awake: sleepHours * 0.05
    };

    const hrv = typeof raw.hrv === 'number' ? Math.max(10, Math.min(250, raw.hrv)) : 65;
    const restingHeartRate = typeof raw.restingHeartRate === 'number' ? Math.max(35, Math.min(150, raw.restingHeartRate)) : 60;
    const currentHeartRate = typeof raw.currentHeartRate === 'number' ? Math.max(35, Math.min(220, raw.currentHeartRate)) : restingHeartRate;
    const bloodOxygen = typeof raw.bloodOxygen === 'number' ? Math.max(70, Math.min(100, raw.bloodOxygen)) : 98;
    const waterIntakeMl = typeof raw.waterIntakeMl === 'number' ? Math.max(0, raw.waterIntakeMl) : 2000;
    const activeCalories = typeof raw.activeCalories === 'number' ? Math.max(0, raw.activeCalories) : 400;
    const mood = typeof raw.mood === 'number' ? Math.max(1, Math.min(5, raw.mood)) : 3;

    return {
      metadata: {
        timestamp: raw.metadata?.timestamp ? new Date(raw.metadata.timestamp) : new Date(),
        source: raw.metadata?.source || "mock",
        quality: raw.metadata?.quality || "estimated",
        lastUpdated: raw.metadata?.lastUpdated ? new Date(raw.metadata.lastUpdated) : new Date()
      },
      capabilities: raw.capabilities || {
        supportsHRV: true,
        supportsBloodOxygen: true,
        supportsBloodPressure: true,
        supportsSleepStages: true,
        supportsWorkoutLogs: true
      },
      steps,
      sleepHours,
      sleepEfficiency,
      sleepStages,
      hrv,
      restingHeartRate,
      currentHeartRate,
      bloodOxygen,
      bloodPressure: raw.bloodPressure || { systolic: 120, diastolic: 80 },
      waterIntakeMl,
      activeCalories,
      mood,
      screenTimeMin: typeof raw.screenTimeMin === 'number' ? raw.screenTimeMin : 180,
      deepWorkMin: typeof raw.deepWorkMin === 'number' ? raw.deepWorkMin : 240
    };
  }
}
