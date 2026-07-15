import { UserBaseline } from '../types';

export class BaselineEngine {
  static getBaseline(): UserBaseline {
    // Return typical standard averages for a healthy user
    return {
      hrvAvg7d: 78,
      hrvAvg30d: 74,
      restingHrAvg7d: 59,
      sleepAvg7d: 7.5,
      activityAvg7d: 12000,
      waterAvg7d: 22000,
      stressAvg7d: 45
    };
  }

  static calculateDeviation(current: number, baseline: number): number {
    if (baseline === 0) return 0;
    const deviation = ((current - baseline) / baseline) * 100;
    return parseFloat(deviation.toFixed(1));
  }
}
