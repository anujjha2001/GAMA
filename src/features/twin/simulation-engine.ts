export interface SimulationMetrics {
  recoveryScore: number;
  stressLevel: number;
  bodyBattery: number;
  caloriesBurned: number;
  hydrationLevel: number;
  sleepHours: number;
  mood: string;
  hrv: number;
  heartRate: number;
  productivity: number;
  longevityFactor: number; // percentage offset
  biologicalAgeOffset: number; // e.g. -0.2 years, +0.5 years
  explanation: string;
}

export class SimulationEngine {
  static simulateScenario(scenarioId: string, current: {
    recoveryScore: number;
    stressLevel: number;
    hydrationLevel: number;
    sleepHours: number;
  }): SimulationMetrics {
    const base = {
      recoveryScore: current.recoveryScore,
      stressLevel: current.stressLevel,
      bodyBattery: Math.max(5, Math.min(100, current.recoveryScore - current.stressLevel * 2)),
      caloriesBurned: 1950,
      hydrationLevel: current.hydrationLevel,
      sleepHours: current.sleepHours,
      mood: 'RELAXED',
      hrv: 65,
      heartRate: 68,
      productivity: 78,
      longevityFactor: 100,
      biologicalAgeOffset: 0,
      explanation: 'Maintaining standard equilibrium.'
    };

    switch (scenarioId) {
      case 'sleep_deprived':
        base.recoveryScore = Math.max(10, Math.round(current.recoveryScore * 0.55));
        base.stressLevel = Math.min(10, Math.round(current.stressLevel * 1.8 + 2));
        base.sleepHours = 4.0;
        base.bodyBattery = Math.max(5, base.bodyBattery - 35);
        base.hrv = Math.max(20, Math.round(base.hrv * 0.7));
        base.heartRate += 8;
        base.mood = 'SLEEPY';
        base.productivity = 45;
        base.longevityFactor = 92;
        base.biologicalAgeOffset = +0.4;
        base.explanation = 'AURA Predicts: Sleep deprivation triggers elevated sympathetic drive, decreasing HRV by ~30% and locking recovery in the red. Highly recommend restricting workouts to mobility only.';
        break;

      case 'run_10k':
        base.recoveryScore = Math.max(15, Math.round(current.recoveryScore * 0.7));
        base.stressLevel = Math.max(2, Math.round(current.stressLevel * 1.3));
        base.hydrationLevel = Math.max(20, Math.round(current.hydrationLevel * 0.65));
        base.bodyBattery = Math.max(5, base.bodyBattery - 40);
        base.caloriesBurned += 750;
        base.hrv = Math.max(25, Math.round(base.hrv * 0.85));
        base.heartRate = 74;
        base.mood = 'MOTIVATED';
        base.productivity = 85;
        base.longevityFactor = 104;
        base.biologicalAgeOffset = -0.3;
        base.explanation = 'AURA Predicts: 10km run induces high cardiovascular loading. Temporary recovery suppression of -20% is expected, but long-term cellular health improves, offsetting bio-age by -0.3 years.';
        break;

      case 'skip_workout':
        base.recoveryScore = Math.min(98, Math.round(current.recoveryScore * 1.1));
        base.stressLevel = Math.max(1, Math.round(current.stressLevel * 0.8));
        base.bodyBattery = Math.min(100, base.bodyBattery + 15);
        base.hrv = Math.min(120, Math.round(base.hrv * 1.05));
        base.mood = 'RELAXED';
        base.productivity = 80;
        base.explanation = 'AURA Predicts: Skipping today\'s workout triggers a nervous system reload. Recovery rises slightly (+10%), allowing muscle fibers to fully repair from previous training cycles.';
        break;

      case 'hydrate_3l':
        base.hydrationLevel = 100;
        base.recoveryScore = Math.min(100, Math.round(current.recoveryScore * 1.08));
        base.stressLevel = Math.max(1, Math.round(current.stressLevel * 0.9));
        base.bodyBattery = Math.min(100, base.bodyBattery + 8);
        base.hrv = Math.min(120, Math.round(base.hrv * 1.1));
        base.heartRate -= 2;
        base.mood = 'HAPPY';
        base.productivity = 88;
        base.longevityFactor = 101;
        base.biologicalAgeOffset = -0.1;
        base.explanation = 'AURA Predicts: Optimal cellular hydration boosts blood plasma volume, easing cardiac strain. Rest heart rate drops by 2 BPM while executive focus efficiency increases to 88%.';
        break;

      case 'junk_food':
        base.recoveryScore = Math.max(25, Math.round(current.recoveryScore * 0.82));
        base.stressLevel = Math.min(10, Math.round(current.stressLevel * 1.4 + 1));
        base.hydrationLevel = Math.max(30, Math.round(current.hydrationLevel * 0.85));
        base.bodyBattery = Math.max(5, base.bodyBattery - 15);
        base.caloriesBurned += 50;
        base.hrv = Math.max(25, Math.round(base.hrv * 0.88));
        base.mood = 'TIRED';
        base.productivity = 60;
        base.longevityFactor = 97;
        base.biologicalAgeOffset = +0.15;
        base.explanation = 'AURA Predicts: High glycemic/saturated fat intake spikes systemic inflammatory markers, causing mild metabolic strain and decreasing deep sleep efficiency overnight.';
        break;

      case 'meditate_20':
        base.stressLevel = Math.max(1, Math.round(current.stressLevel * 0.4));
        base.recoveryScore = Math.min(100, Math.round(current.recoveryScore * 1.12));
        base.bodyBattery = Math.min(100, base.bodyBattery + 18);
        base.hrv = Math.min(130, Math.round(base.hrv * 1.25));
        base.heartRate -= 5;
        base.mood = 'FOCUSED';
        base.productivity = 92;
        base.longevityFactor = 106;
        base.biologicalAgeOffset = -0.2;
        base.explanation = 'AURA Predicts: 20 minutes of parasympathetic vagal stimulation triggers a rapid reduction in stress (-60%) and enhances heart rate variability. Biological age offset drops by -0.2 years.';
        break;
    }

    return base;
  }
}
