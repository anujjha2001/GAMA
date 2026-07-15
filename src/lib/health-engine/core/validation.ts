import { HealthData } from '../types';

export class DataValidator {
  static validate(data: Partial<HealthData>): { valid: boolean; confidenceBonus: number; errors: string[] } {
    const errors: string[] = [];
    let confidenceBonus = 100;

    if (!data.metadata) {
      errors.push("Missing metadata");
      confidenceBonus -= 50;
    } else {
      const now = new Date().getTime();
      const dataTime = new Date(data.metadata.timestamp).getTime();
      const diffMin = (now - dataTime) / (1000 * 60);

      if (diffMin > 180) { // older than 3 hours
        confidenceBonus -= 30;
      }
      if (data.metadata.quality === "estimated") {
        confidenceBonus -= 15;
      }
      if (data.metadata.quality === "manual") {
        confidenceBonus -= 5;
      }
    }

    // Check availability of key biometric metrics
    if (data.hrv === undefined || data.hrv === null) {
      confidenceBonus -= 25;
      errors.push("Missing HRV biometric");
    }
    if (data.restingHeartRate === undefined || data.restingHeartRate === null) {
      confidenceBonus -= 15;
      errors.push("Missing Resting Heart Rate");
    }
    if (data.sleepHours === undefined || data.sleepHours === null) {
      confidenceBonus -= 15;
      errors.push("Missing Sleep Duration");
    }
    if (data.bloodOxygen === undefined || data.bloodOxygen === null) {
      confidenceBonus -= 10;
    }

    confidenceBonus = Math.max(10, Math.min(100, confidenceBonus));

    return {
      valid: errors.length < 3, // basic validity threshold
      confidenceBonus,
      errors
    };
  }
}
