import { prisma } from '@/lib/prisma';

export class NutritionService {
  /**
   * Search for foods using fuzzy name matching.
   */
  static async searchFood(query: string) {
    const foods = await prisma.food.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { aliases: { has: query.toLowerCase() } }
        ]
      },
      take: 5
    });
    
    return foods;
  }
  
  /**
   * Log a meal for a user.
   */
  static async logMeal(profileId: string, mealName: string, type: string, foodItems: { foodId: string, amount: number, unit: string }[]) {
    // Basic aggregation
    let totalCals = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    
    for (const item of foodItems) {
      const food = await prisma.food.findUnique({ where: { id: item.foodId } });
      if (food) {
        const ratio = item.amount / food.servingSize;
        totalCals += food.calories * ratio;
        totalProtein += food.protein * ratio;
        totalCarbs += food.carbs * ratio;
        totalFat += food.fat * ratio;
      }
    }

    const meal = await prisma.meal.create({
      data: {
        profileId,
        name: mealName,
        type,
        totalCals: Math.round(totalCals),
        totalProtein: Math.round(totalProtein * 10) / 10,
        totalCarbs: Math.round(totalCarbs * 10) / 10,
        totalFat: Math.round(totalFat * 10) / 10,
        items: {
          create: foodItems.map(item => ({
            foodId: item.foodId,
            amount: item.amount,
            unit: item.unit
          }))
        }
      }
    });
    
    return meal;
  }
}
