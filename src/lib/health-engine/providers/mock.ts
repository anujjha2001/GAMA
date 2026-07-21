import { HealthData } from '../types';

export class MockProvider {
  static getHealthData(simulatedHour?: number): HealthData {
    const hour = simulatedHour !== undefined ? simulatedHour : new Date().getHours();
    
    // Model realistic circadian rhythm variables based on the hour of the day
    let currentHeartRate = 60;
    let hrv = 75;
    let steps = 0;
    let activeCalories = 0;
    let waterIntakeMl = 1200;
    let screenTimeMin = 120;
    let deepWorkMin = 180;
    let mood = 4;

    if (hour >= 6 && hour < 9) { // Morning wake/reset
      currentHeartRate = 58;
      hrv = 82;
      steps = 2200;
      activeCalories = 80;
      waterIntakeMl = 350;
      screenTimeMin = 15;
      deepWorkMin = 0;
      mood = 5;
    } else if (hour >= 9 && hour < 13) { // Morning deep work / active
      currentHeartRate = 72;
      hrv = 76;
      steps = 6500;
      activeCalories = 210;
      waterIntakeMl = 1100;
      screenTimeMin = 90;
      deepWorkMin = 120;
      mood = 4;
    } else if (hour >= 13 && hour < 17) { // Afternoon workout / meetings
      currentHeartRate = 125; // exercise peak
      hrv = 55; // autonomic drop due to exercise
      steps = 14500;
      activeCalories = 480;
      waterIntakeMl = 1800;
      screenTimeMin = 210;
      deepWorkMin = 180;
      mood = 4;
    } else if (hour >= 17 && hour < 21) { // Evening winding down
      currentHeartRate = 66;
      hrv = 78;
      steps = 18200;
      activeCalories = 540;
      waterIntakeMl = 2400;
      screenTimeMin = 270;
      deepWorkMin = 210;
      mood = 5;
    } else { // Night/Sleep cycle
      currentHeartRate = 54;
      hrv = 85;
      steps = 19840;
      activeCalories = 550;
      waterIntakeMl = 2500;
      screenTimeMin = 300;
      deepWorkMin = 240;
      mood = 4;
    }

    return {
      metadata: {
        timestamp: new Date(),
        source: "mock",
        quality: "live",
        lastUpdated: new Date()
      },
      capabilities: {
        supportsHRV: true,
        supportsBloodOxygen: true,
        supportsBloodPressure: true,
        supportsSleepStages: true,
        supportsWorkoutLogs: true
      },
      steps,
      sleepHours: 7.75,
      sleepEfficiency: 92,
      sleepStages: {
        deep: 1.9,
        rem: 1.8,
        light: 3.5,
        awake: 0.55
      },
      hrv,
      restingHeartRate: 59,
      currentHeartRate,
      bloodOxygen: 98,
      bloodPressure: { systolic: 118, diastolic: 76 },
      waterIntakeMl,
      activeCalories,
      mood,
      screenTimeMin,
      deepWorkMin
    };
  }
}
