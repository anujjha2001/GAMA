import { MealNutritionDetail } from './meal-intelligence';

export interface TimingRecommendation {
  label: string;
  recommendedTime: string;
  idealMacros: string;
  suggestedDish: string;
  rationale: string;
}

export interface WeeklyPlanDay {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  cost: number;
}

export class MealRecommendationEngine {
  /**
   * Generates biometric timing suggestions integrating with GAMA Schedule OS.
   */
  static getTimingIntelligence(
    workoutScheduledTime?: string,
    circadianPhase?: string
  ): TimingRecommendation[] {
    return [
      {
        label: 'Ideal Breakfast Slot',
        recommendedTime: '08:30 AM',
        idealMacros: '30g Protein, 12g Fiber, <10g Sugar',
        suggestedDish: 'Chia Seed Oatmeal Bowl',
        rationale: 'Aligns with your morning cortisol spike to optimize metabolic rate and sustain focus.'
      },
      {
        label: 'Pre-Workout Fuel Slot',
        recommendedTime: workoutScheduledTime ? `${workoutScheduledTime} - 1.5h` : '04:30 PM',
        idealMacros: '45g Complex Carbs, 20g Protein',
        suggestedDish: 'Almond Butter Banana Toast',
        rationale: 'Provides steady-release glycogen stores for muscular contraction during training.'
      },
      {
        label: 'Post-Workout Recovery Window',
        recommendedTime: workoutScheduledTime ? `${workoutScheduledTime} + 45m` : '07:30 PM',
        idealMacros: '35g Protein, 50g Carbs, Low Fat',
        suggestedDish: 'Tofu Quinoa Bowl with Spinach',
        rationale: 'Rebuilds glycogen stores and triggers protein synthesis for optimal cellular recovery.'
      },
      {
        label: 'Sleep-Friendly Cutoff',
        recommendedTime: '09:00 PM',
        idealMacros: 'No calories, fluids only',
        suggestedDish: 'Chamomile Infusion / Electrolyte Water',
        rationale: 'Prevents gastrointestinal distress and core temperature elevation during deep sleep.'
      }
    ];
  }

  /**
   * Recommends recovery foods based on user stress/fatigue levels and ambient weather conditions.
   */
  static getRecoveryRecommendations(
    biometrics: { recoveryScore: number; sleepHours: number; stressLevel: number },
    weather: { tempC: number; rainProb: number; aqi: number }
  ): {
    modeName: string;
    description: string;
    badgeText: string;
    recommendedDish: string;
  } {
    // 1. Extreme low recovery
    if (biometrics.recoveryScore < 50) {
      return {
        modeName: 'Biological Recovery Active',
        description: 'Your recovery is severely strained. AURA has adapted your feed to focus on digestible clean proteins and anti-inflammatory compounds.',
        badgeText: 'Recovery Mode',
        recommendedDish: 'Bone Broth / Steamed Tofu Greens'
      };
    }

    // 2. High stress
    if (biometrics.stressLevel > 7) {
      return {
        modeName: 'Nervous System Soothing Active',
        description: 'Elevated stress detected. Showing foods rich in Magnesium, L-Theanine, and Vitamin B to calm parasympathetic nerve receptors.',
        badgeText: 'Stress Buster',
        recommendedDish: 'Dark Chocolate Pumpkin Seed Oatmeal'
      };
    }

    // 3. Hot weather
    if (weather.tempC > 32) {
      return {
        modeName: 'Thermoregulatory Support Active',
        description: 'Ambient temperatures exceed 32°C. Recommending high hydration dishes containing natural sodium, magnesium, and water-dense fruits.',
        badgeText: 'Electrolyte Replenish',
        recommendedDish: 'Watermelon Feta Salad / Electrolyte Citrus Smoothie'
      };
    }

    // 4. Rainy weather
    if (weather.rainProb > 60) {
      return {
        modeName: 'Immune Barrier Defense Active',
        description: 'Monsoon weather patterns detected. Prioritizing zinc, vitamin C, and warming broths to bolster immune response.',
        badgeText: 'Immune Support',
        recommendedDish: 'Ginger Garlic Spiced Lentil Soup'
      };
    }

    // Default
    return {
      modeName: 'Sustained Vitality Active',
      description: 'Your biometric parameters are in a healthy baseline. Maintaining standard balanced macronutrient flows.',
      badgeText: 'Baseline Nutrition',
      recommendedDish: 'Grilled Salmon Quinoa Bowl'
    };
  }

  /**
   * Generates a complete weekly meal schedule.
   */
  static generateWeeklyPlan(): WeeklyPlanDay[] {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const breakfasts = ['Chia Seed Almond Oatmeal', 'Scrambled Eggs with Avocado Toast', 'Spiced Paneer Scramble', 'High Protein Green Smoothie', 'Oat Bran Pancakes', 'Tofu Veggie Wrap', 'Fruit & Greek Yogurt Bowl'];
    const lunches = ['Grilled Salmon Greens', 'Quinoa Grilled Chicken Salad', 'Brown Rice Dal Tadka & Bhindi', 'Keto Tofu Broccoli Stir-fry', 'Whole Wheat Paneer Wrap', 'Lentil Soup with Multigrain Sourdough', 'Mediterranean Hummus Bowl'];
    const dinners = ['Baked Tilapia with Asparagus', 'Teriyaki Tofu Brown Rice Bowl', 'Chicken Breast Tikka Grill', 'Mushroom Quinoa Risotto', 'Vegan Black Bean Salad', 'Mixed Lentil Curry with Chapati', 'Tofu Avocado Superfood Bowl'];

    return days.map((day, i) => ({
      day,
      breakfast: breakfasts[i],
      lunch: lunches[i],
      dinner: dinners[i],
      cost: 450 + Math.floor(Math.random() * 150)
    }));
  }

  /**
   * Generates a weekly grocery list.
   */
  static generateGroceryBasket(goalMode: string): {
    category: string;
    items: string[];
  }[] {
    const isKeto = goalMode.toLowerCase() === 'keto';
    const isMuscle = goalMode.toLowerCase() === 'muscle gain';

    return [
      {
        category: 'Proteins & Seeds',
        items: isKeto
          ? ['Free-Range Eggs', 'Organic Chicken Breast', 'Fresh Paneer', 'Pumpkin Seeds', 'Hemp Hearts']
          : isMuscle
            ? ['Greek Yogurt', 'Fresh Tofu Blocks', 'Organic Chicken Breast', 'Lentils', 'Chia Seeds']
            : ['Tofu Blocks', 'Chickpeas', 'Flaxseeds', 'Fresh Paneer']
      },
      {
        category: 'Fruits & Hydration',
        items: ['Blueberries', 'Bananas (Pre-workout)', 'Avocados', 'Coconut Water Pack', 'Electrolyte Sachets']
      },
      {
        category: 'Vegetables & Grains',
        items: isKeto
          ? ['Organic Spinach', 'Broccoli Florets', 'Cauliflower (for rice)', 'Zucchini Noodles']
          : ['Organic Spinach', 'Broccoli Florets', 'Brown Basmati Rice', 'Quinoa Seeds', 'Multigrain Sourdough']
      }
    ];
  }
}
