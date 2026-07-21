import { MealNutritionDetail } from './meal-intelligence';

export interface FoodAlternative {
  name: string;
  restaurantName: string;
  calories: number;
  proteinG: number;
  cost: number;
  reason: string;
}

export class NutritionEngine {
  /**
   * Generates health optimization suggestions for specific dishes.
   */
  static getOptimizations(dishName: string): string[] {
    const d = dishName.toLowerCase();
    if (d.includes('pizza')) {
      return [
        'Request thin whole-wheat crust to reduce refined flour',
        'Remove extra cheese and replace with double mushrooms',
        'Add extra spinach and bell peppers for high dietary fiber'
      ];
    }
    if (d.includes('biryani')) {
      return [
        'Request lower oil or ghee in preparation if available',
        'Request double chicken breast pieces (increase protein by 18g)',
        'Opt for brown rice base if supported by restaurant'
      ];
    }
    if (d.includes('burger')) {
      return [
        'Swap brioche bun for multigrain bun or lettuce wrap',
        'Remove mayonnaise and request mustard sauce',
        'Add double tomato and lettuce layers'
      ];
    }
    // Default general suggestions
    return [
      'Request sauces and dressings on the side',
      'Double the protein serving (paneer/chicken/tofu)',
      'Add a side salad to improve satiety duration'
    ];
  }

  /**
   * Detects biological deficiency gaps and suggests meals.
   */
  static detectDeficiencies(biometrics: { recoveryScore: number; hrv: number; sleepHours: number }): {
    deficiency: string;
    missingNutrient: string;
    reason: string;
    correctingFoods: string[];
  }[] {
    const list = [];
    if (biometrics.sleepHours < 6.0) {
      list.push({
        deficiency: 'Electrolyte Deficit & Magnesium Gap',
        missingNutrient: 'Magnesium / Potassium',
        reason: 'Poor sleep duration reduces neural cellular repair rate and depletes electrolyte reserves.',
        correctingFoods: ['Avocado Greens Bowl', 'Almond Banana Smoothie', 'Spinach Salad']
      });
    }
    if (biometrics.recoveryScore < 55) {
      list.push({
        deficiency: 'Low Protein Sync',
        missingNutrient: 'Essential Amino Acids',
        reason: 'System requires rapid amino acid synthesis to rebuild muscle fibers and lower body stress.',
        correctingFoods: ['Grilled Chicken Breast Salad', 'Tofu Quinoa High Protein Bowl', 'Paneer Tikka Grill']
      });
    }
    return list;
  }

  /**
   * Suggests healthier food alternatives for high-calorie cravings.
   */
  static getAlternatives(craving: string): FoodAlternative[] {
    const c = craving.toLowerCase();
    if (c.includes('pizza')) {
      return [
        { name: 'Multigrain Pesto Flatbread', restaurantName: 'The Green Bowl Co.', calories: 380, proteinG: 18, cost: 280, reason: 'Uses complex grains and features 40% fewer calories' },
        { name: 'Keto Cauliflower Crust Pizza', restaurantName: 'FitBites Café', calories: 340, proteinG: 22, cost: 350, reason: 'Keto-friendly with high protein density' }
      ];
    }
    if (c.includes('burger')) {
      return [
        { name: 'Grilled Chicken Lettuce Wrap', restaurantName: 'FitBites Café', calories: 280, proteinG: 32, cost: 240, reason: 'Replaces refined bun with crisp leaf greens' },
        { name: 'Oatmeal Patty Veggie Burger', restaurantName: 'Organic Kitchen', calories: 320, proteinG: 14, cost: 210, reason: 'High fiber veggie patty with low oil' }
      ];
    }
    // Default
    return [
      { name: 'Quinoa Protein Bowl', restaurantName: 'The Green Bowl Co.', calories: 420, proteinG: 28, cost: 290, reason: 'High satiety, balanced clean complex carbs' }
    ];
  }

  /**
   * Optimizes options for cost vs. protein/nutrient densities.
   */
  static optimizeBudget(meals: { name: string; cost: number; proteinG: number; calories: number }[]): {
    cheapestHealthy: string;
    bestProteinRatio: string; // highest protein per rupee
    bestValue: string;
    explanation: string;
  } {
    if (meals.length === 0) {
      return { cheapestHealthy: '', bestProteinRatio: '', bestValue: '', explanation: 'No meals to compare' };
    }

    const sortedByPrice = [...meals].sort((a, b) => a.cost - b.cost);
    const sortedByProteinRatio = [...meals].sort((a, b) => (b.proteinG / b.cost) - (a.proteinG / a.cost));

    const cheapest = sortedByPrice[0];
    const bestProtein = sortedByProteinRatio[0];

    const ratioDiff = (bestProtein.proteinG / bestProtein.cost) / (cheapest.proteinG / cheapest.cost);
    const explanation = `₹${bestProtein.cost} gives ${bestProtein.proteinG}g protein (best value at ${Math.round(bestProtein.proteinG * 10 / bestProtein.cost)}g per ₹100), while the cheapest healthy option (₹${cheapest.cost}) provides ${cheapest.proteinG}g protein.`;

    return {
      cheapestHealthy: cheapest.name,
      bestProteinRatio: bestProtein.name,
      bestValue: bestProtein.name,
      explanation
    };
  }
}
