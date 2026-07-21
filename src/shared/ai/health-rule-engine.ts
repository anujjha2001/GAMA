export interface RuleInput {
  sleepHours: number;
  workoutDurationMin: number;
  stressLevel: number;
  waterIntakeMl: number;
}

export interface RuleOutput {
  hasPenalty: boolean;
  penaltyReason?: string;
  recoveryPenaltyValue: number;
}

export class HealthRuleEngine {
  static evaluate(input: RuleInput): RuleOutput {
    let penalty = 0;
    const reasons: string[] = [];

    if (input.sleepHours < 5 && input.workoutDurationMin > 90) {
      penalty += 25;
      reasons.push('High-intensity exercise on short sleep (< 5h)');
    }

    if (input.stressLevel > 4 && input.sleepHours < 6) {
      penalty += 15;
      reasons.push('Elevated autonomic stress with insufficient sleep');
    }

    if (input.waterIntakeMl < 1500) {
      penalty += 10;
      reasons.push('Dehydration risk (< 1500ml water)');
    }

    return {
      hasPenalty: penalty > 0,
      penaltyReason: reasons.join('; '),
      recoveryPenaltyValue: penalty
    };
  }
}
