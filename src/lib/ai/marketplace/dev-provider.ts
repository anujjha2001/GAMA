import { FoodProvider, Meal, Restaurant } from './food-provider';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class DevelopmentDataProvider implements FoodProvider {
  name = 'DevelopmentDataProvider';
  isOfficialApiAvailable = true;

  async searchRestaurants(options: {
    lat?: number;
    lng?: number;
    vegOnly?: boolean;
    highProtein?: boolean;
    favOnly?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]> {
    // Basic dev implementation relying on the local DB
    const branches = await prisma.restaurantBranch.findMany({
      include: {
        restaurant: {
          include: {
            cuisines: true
          }
        },
        availability: true,
      },
      take: options.limit || 10,
    });

    return branches.map((branch) => ({
      id: branch.id,
      name: branch.restaurant.name,
      cuisine: branch.restaurant.cuisines[0]?.name || 'Healthy',
      platform: 'Swiggy', // Default for dev mock
      healthRating: branch.restaurant.healthScore,
      trustScore: 90,
      healthyMenuPercent: branch.restaurant.healthyMenuPct,
      freshScore: 90,
      lowOilAvailable: true,
      vegScore: 80,
      deliveryReliability: 95,
      distanceKm: 2.5,
      deliveryTimeMins: branch.availability[0]?.etaMin || 25,
      priceForTwo: 500,
      isBusyNow: false,
      offers: ['Free Delivery'],
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60', // Mock image
      scores: {
        overall: branch.restaurant.healthScore,
        nutrition: 90,
        recovery: 85,
        value: 80,
      }
    }));
  }

  async searchMeals(options: {
    restaurantId?: string;
    vegOnly?: boolean;
    highProtein?: boolean;
    favOnly?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Meal[]> {
    const meals = await prisma.healthyMeal.findMany({
      where: {
        ...(options.query ? { name: { contains: options.query, mode: 'insensitive' } } : {}),
      },
      include: {
        restaurant: true,
        nutrition: true,
        aiAnalyses: true,
      },
      take: options.limit || 10,
    });

    return meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      restaurantId: meal.restaurantId,
      restaurantName: meal.restaurant.name,
      platform: 'Swiggy',
      price: meal.basePrice,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy',
      auraScore: meal.healthScore,
      nutrients: {
        calories: meal.calories,
        proteinG: meal.protein,
        carbsG: meal.carbs,
        fatG: meal.fat,
        fiberG: meal.nutrition?.fiber || 0,
        sugarG: meal.nutrition?.sugar || 0,
        sodiumMg: meal.nutrition?.sodium || 0,
        glycemicLoad: meal.nutrition?.glycemicLoad || 0,
        processingLevel: 'Minimally Processed',
        vitamins: ['Vitamin A', 'Vitamin C'],
        minerals: ['Iron'],
      },
      scores: {
        overall: meal.aiAnalyses[0]?.proteinScore || 0,
        recovery: meal.aiAnalyses[0]?.recoveryScore || 0,
        protein: meal.aiAnalyses[0]?.proteinScore || 0,
        digestion: meal.aiAnalyses[0]?.gutHealthScore || 0,
        sleep: 80,
        workout: 85,
        hydration: meal.aiAnalyses[0]?.hydrationImpact || 0,
        brain: 80,
        longevity: 90,
        gut: meal.aiAnalyses[0]?.gutHealthScore || 0,
        inflammation: meal.aiAnalyses[0]?.inflammationScore || 0,
      },
      whyRecommend: meal.aiAnalyses[0]?.summary || 'Nutritious option.',
      whyAvoid: '',
      alternativeName: '',
      alternativeId: '',
      expectedFeeling: 'Energized',
    }));
  }

  async checkAvailability(branchId: string, mealId: string) {
    return {
      isAvailable: true,
      price: 320,
      etaMin: 20,
      etaMax: 30,
      deliveryFee: 40,
    };
  }

  getDeepLink(branchId: string, mealId: string): string {
    return `https://dev.provider.com/order?branch=${branchId}&meal=${mealId}`;
  }

  async getRestaurant(id: string): Promise<Restaurant | null> {
    const branches = await this.searchRestaurants({ limit: 1 });
    return branches[0] || null;
  }
}
