export interface FocusMetrics {
  sleepHours: number;
  timeOfDayHour: number;
  meetingsScheduledCount: number;
}

export class FocusEngine {
  static getFocusScore(metrics: FocusMetrics): { score: number; state: 'PEAK' | 'MODERATE' | 'FATIGUED' } {
    let score = 100;

    // Penalty for sleep deprivation
    if (metrics.sleepHours < 6) {
      score -= 30;
    } else if (metrics.sleepHours < 7.5) {
      score -= 10;
    }

    // Circadian fatigue dip (usually 1pm to 4pm)
    if (metrics.timeOfDayHour >= 13 && metrics.timeOfDayHour <= 16) {
      score -= 20;
    }

    // Meeting cognitive load
    score -= metrics.meetingsScheduledCount * 8;

    score = Math.max(10, score);
    const state = score > 80 ? 'PEAK' : score > 50 ? 'MODERATE' : 'FATIGUED';

    return { score, state };
  }
}
