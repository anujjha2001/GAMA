import { HealthRuleEngine, RuleInput } from './health-rule-engine';

export interface Recommendation {
  id: string;
  category: 'RECOVERY' | 'NUTRITION' | 'HYDRATION' | 'GENERAL';
  title: string;
  actionItem: string;
  evidence: string;
  confidence: number;
}

export class RecommendationEngine {
  static generate(input: RuleInput): Recommendation[] {
    const rules = HealthRuleEngine.evaluate(input);
    const recommendations: Recommendation[] = [];

    if (rules.hasPenalty) {
      recommendations.push({
        id: 'rec_recovery_penalty',
        category: 'RECOVERY',
        title: 'Mandatory Active Recovery Day',
        actionItem: 'Limit workout to 20 mins light stretching or walking today.',
        evidence: rules.penaltyReason || 'Rule Engine Alert',
        confidence: 0.95
      });
    }

    if (input.waterIntakeMl < 2000) {
      recommendations.push({
        id: 'rec_hydration_boost',
        category: 'HYDRATION',
        title: 'Hydration Target Increase',
        actionItem: 'Drink an additional 500ml of water with electrolytes.',
        evidence: `Water intake is ${input.waterIntakeMl}ml against 2000ml target.`,
        confidence: 0.9
      });
    }

    // Default general advice if nothing triggered
    if (recommendations.length === 0) {
      recommendations.push({
        id: 'rec_keep_going',
        category: 'GENERAL',
        title: 'Maintain Circadian Consistency',
        actionItem: 'Continue sleeping and training at your current scheduled intervals.',
        evidence: 'Vitals and sleep duration are within standard baseline standard deviations.',
        confidence: 0.85
      });
    }

    return recommendations;
  }
}
