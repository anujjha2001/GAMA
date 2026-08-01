export interface MealNutritionDetail {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG: number;
  sugarG: number;
  sodiumMg: number;
  glycemicLoad: number;
  processingLevel: 'Unprocessed' | 'Minimally Processed' | 'Moderately Processed' | 'Highly Processed';
  vitamins: string[];
  minerals: string[];
}

export interface Meal {
  id: string;
  name: string;
  restaurantId: string;
  restaurantName: string;
  platform: 'Swiggy' | 'Zomato';
  nutrients: MealNutritionDetail;
  price: number;
  imageUrl: string;
  category: string;
  auraScore: number;
  scores: {
    overall: number;
    recovery: number;
    protein: number;
    digestion: number;
    sleep: number;
    workout: number;
    hydration: number;
    brain: number;
    longevity: number;
    gut: number;
    inflammation: number;
  };
  whyRecommend: string;
  whyAvoid: string;
  alternativeName: string;
  alternativeId: string;
  expectedFeeling: 'Energized' | 'Heavy' | 'Sleepy' | 'Perfect Before Workout' | 'Perfect Before Sleep';
  /** Cuisine type — used for diversity enforcement (max 2 per cuisine in feed) */
  cuisineType?: string;
  /** Confidence score 0.0–1.0 from ConfidenceScorer — used for ranking */
  confidence?: number;
}

export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  platform: 'Swiggy' | 'Zomato';
  healthRating: number;
  trustScore: number;
  healthyMenuPercent: number;
  freshScore: number;
  lowOilAvailable: boolean;
  vegScore: number;
  deliveryReliability: number;
  distanceKm: number;
  deliveryTimeMins: number;
  priceForTwo: number;
  isBusyNow: boolean;
  offers: string[];
  imageUrl: string;
  scores: {
    overall: number;
    nutrition: number;
    recovery: number;
    value: number;
  };
}

export interface GroceryItem {
  id: string;
  name: string;
  category: 'Fruits' | 'Vegetables' | 'Protein' | 'Dairy' | 'Supplements' | 'Healthy Snacks';
  price: number;
  healthScore: number;
  recipeSuggestion: string;
  nutrients: string; // e.g. "Vitamin C, Fiber"
  imageUrl: string;
}

export interface FoodProvider {
  name: string;
  isOfficialApiAvailable: boolean;

  searchRestaurants(options: {
    lat?: number;
    lng?: number;
    vegOnly?: boolean;
    highProtein?: boolean;
    favOnly?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]>;

  searchMeals(options: {
    restaurantId?: string;
    vegOnly?: boolean;
    highProtein?: boolean;
    favOnly?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Meal[]>;

  checkAvailability(branchId: string, mealId: string): Promise<{
    isAvailable: boolean;
    price: number;
    etaMin: number;
    etaMax: number;
    deliveryFee: number;
  }>;

  getDeepLink(branchId: string, mealId: string): string;
  
  getRestaurant(id: string): Promise<Restaurant | null>;
}

export class FoodProviderManager {
  private static activeProvider: FoodProvider;

  static setProvider(provider: FoodProvider) {
    this.activeProvider = provider;
  }

  static getProvider(): FoodProvider {
    return this.activeProvider;
  }
}
