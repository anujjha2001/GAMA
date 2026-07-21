export interface ChronoVitals {
  hrv: number;
  rhr: number;
  sleepHours: number;
  stressScore: number;
}

export class ChronobiologyEngine {
  static getRecoveryMultiplier(vitals: ChronoVitals): number {
    let multiplier = 1.0;

    // HRV below 50 lowers recovery
    if (vitals.hrv < 50) {
      multiplier -= 0.25;
    }
    // High RHR increases fatigue
    if (vitals.rhr > 75) {
      multiplier -= 0.15;
    }
    // Low sleep hours increases fatigue
    if (vitals.sleepHours < 6) {
      multiplier -= 0.2;
    }
    // High stress lowers recovery multiplier
    if (vitals.stressScore > 7) {
      multiplier -= 0.2;
    }

    return Math.max(0.1, multiplier);
  }

  static getOptimalWorkoutHour(chronotype: string): number {
    return chronotype === 'morning' ? 8 : chronotype === 'night' ? 19 : 17;
  }
}
