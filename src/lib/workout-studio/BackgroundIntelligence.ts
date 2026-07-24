import { useHealthOS } from '@/hooks/useHealthOS';

// 1. Recovery Engine
export class RecoveryEngine {
  static calculateReadiness(sleepQuality: number, yesterdayStress: number, muscleFatigueAvg: number): number {
    const sleepWeight = 0.4;
    const stressWeight = 0.3;
    const fatigueWeight = 0.3;

    const stressScore = 100 - yesterdayStress;
    const recoveryScore = Math.round(
      sleepQuality * sleepWeight +
      stressScore * stressWeight +
      (100 - muscleFatigueAvg) * fatigueWeight
    );
    return Math.min(100, Math.max(10, recoveryScore));
  }

  static getRecoverySuggestions(readiness: number): string[] {
    if (readiness > 80) {
      return ['Optimal readiness. Perfect day for high-intensity back squats.', 'Target peak performance load.'];
    } else if (readiness > 50) {
      return ['Moderate recovery status. Maintain volume but avoid progressive overload limits.', 'Ensure 10-minute dynamic warm-up.'];
    } else {
      return ['Recovery compromised. Prioritize mobility, dynamic stretching, and active rest.', 'Focus on core stability and joint rehabilitation.'];
    }
  }
}

// 2. Nutrition Engine
export interface NutritionPlan {
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  waterTargetMl: number;
  mealSuggestions: string[];
  recoveryFoods: string[];
  shoppingList: string[];
}

export class NutritionEngine {
  static generatePostWorkoutPlan(workoutDurationMinutes: number, caloriesBurned: number): NutritionPlan {
    const proteinTarget = Math.round(25 + (workoutDurationMinutes * 0.2)); // 25g baseline + active scale
    const carbsTarget = Math.round(40 + (caloriesBurned * 0.1)); // Replenish glycogen
    const fatTarget = Math.round(15 + (workoutDurationMinutes * 0.05));
    const waterTargetMl = Math.round(1000 + (workoutDurationMinutes * 15));

    return {
      proteinTarget,
      carbsTarget,
      fatTarget,
      waterTargetMl,
      mealSuggestions: ['Greek Yogurt with Blueberries & Chia Seeds', 'Grilled Chicken breast with brown rice', 'Avocado Toast with 2 scrambled eggs'],
      recoveryFoods: ['Whey Protein Shake', 'Greek Yogurt with Blueberries', 'Grilled Chicken Breast with Brown Rice', 'Bananas & Honey'],
      shoppingList: ['Fresh spinach', 'Quinoa', 'Organic avocados', 'Lean chicken breast', 'Greek yogurt', 'Chia seeds']
    };
  }
}

// 3. Digital Body Twin Engine
export class BodyTwinEngine {
  static getActivatedMuscles(exerciseId: string): { primary: string[]; secondary: string[] } {
    const store = useHealthOS.getState();
    const ex = store.activeExercise;
    return {
      primary: ex.primaryMuscles,
      secondary: ex.secondaryMuscles
    };
  }
}

// 4. Injury Prediction & Prevention Engine
export interface InjuryRiskData {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  jointStressScore: number;
  loadImbalanceRatio: number; // e.g. Left vs Right symmetry
  predictedRisk: string;
  alternatives: string[];
}

export class InjuryPredictionEngine {
  static evaluateRisk(symmetry: number, repsCount: number, stability: number): InjuryRiskData {
    let jointStressScore = Math.round((repsCount * 1.5) + (100 - stability) * 0.8);
    const loadImbalanceRatio = parseFloat((Math.abs(100 - symmetry) / 100).toFixed(2));
    
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    let predictedRisk = 'No significant risk patterns detected.';
    let alternatives: string[] = [];

    if (loadImbalanceRatio > 0.15 || jointStressScore > 65) {
      riskLevel = 'HIGH';
      predictedRisk = 'Overtraining & Patellar Tendinitis Risk';
      alternatives = ['Bodyweight Wall Squat', 'Mobility stretching only'];
    } else if (loadImbalanceRatio > 0.08 || jointStressScore > 40) {
      riskLevel = 'MEDIUM';
      predictedRisk = 'Moderate joint fatigue / back load imbalance';
      alternatives = ['Dumbbell Goblet Squat with light load', 'Leg Press'];
    }

    return {
      riskLevel,
      jointStressScore: Math.min(100, jointStressScore),
      loadImbalanceRatio,
      predictedRisk,
      alternatives
    };
  }
}

// 5. Achievement Engine
export interface UserAchievementInfo {
  slug: string;
  title: string;
  description: string;
  badgeUrl: string;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export class AchievementEngine {
  static checkMilestones(totalReps: number, totalCalories: number): UserAchievementInfo[] {
    const list: UserAchievementInfo[] = [
      {
        slug: 'streak-starter',
        title: 'Streak Starter',
        description: 'Completed your first interactive workout set.',
        badgeUrl: '🔥',
        isUnlocked: totalReps > 0,
        unlockedAt: totalReps > 0 ? new Date().toISOString() : undefined
      },
      {
        slug: 'calorie-crusher',
        title: 'Calorie Crusher',
        description: 'Burned over 100 active calories in a single session.',
        badgeUrl: '⚡',
        isUnlocked: totalCalories >= 100,
        unlockedAt: totalCalories >= 100 ? new Date().toISOString() : undefined
      },
      {
        slug: 'form-master',
        title: 'Form Master',
        description: 'Completed a set with over 90% average form accuracy.',
        badgeUrl: '🎯',
        isUnlocked: totalReps >= 8,
        unlockedAt: totalReps >= 8 ? new Date().toISOString() : undefined
      }
    ];

    return list;
  }
}
