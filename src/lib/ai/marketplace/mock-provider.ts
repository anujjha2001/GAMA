import { FoodProvider, Restaurant, Meal, GroceryItem } from './food-provider';

export class MockProvider implements FoodProvider {
  name = 'MockProvider';

  async getRestaurants(options: {
    lat?: number;
    lng?: number;
    vegOnly?: boolean;
    highProtein?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Restaurant[]> {
    const queryTerm = options.query || 'healthy';
    const page = options.page || 1;
    const limit = options.limit || 4;
    try {
      const res = await fetch(`/api/food-search?query=${encodeURIComponent(queryTerm)}&vegOnly=${!!options.vegOnly}&highProtein=${!!options.highProtein}&page=${page}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.restaurants && Array.isArray(data.restaurants)) {
          return data.restaurants;
        }
      }
    } catch (err) {
      console.error('Failed to retrieve live restaurants from local dataset:', err);
    }
    return [];
  }

  async getMeals(options: {
    restaurantId?: string;
    vegOnly?: boolean;
    highProtein?: boolean;
    query?: string;
    page?: number;
    limit?: number;
  }): Promise<Meal[]> {
    const queryTerm = options.query || 'healthy';
    const page = options.page || 1;
    const limit = options.limit || 4;
    try {
      const res = await fetch(`/api/food-search?query=${encodeURIComponent(queryTerm)}&vegOnly=${!!options.vegOnly}&highProtein=${!!options.highProtein}&page=${page}&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.meals && Array.isArray(data.meals)) {
          let list = data.meals;
          if (options.restaurantId) {
            list = list.filter((m: Meal) => m.restaurantId === options.restaurantId);
          }
          return list;
        }
      }
    } catch (err) {
      console.error('Failed to retrieve live meals from local dataset:', err);
    }
    return [];
  }

  async getGroceryItems(category?: string, page?: number, limit?: number): Promise<GroceryItem[]> {
    const queryTerm = category || 'healthy';
    const p = page || 1;
    const l = limit || 3;
    try {
      const res = await fetch(`/api/food-search?query=${encodeURIComponent(queryTerm)}&page=${p}&limit=${l}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.groceries && Array.isArray(data.groceries)) {
          return data.groceries;
        }
      }
    } catch (err) {
      console.error('Failed to retrieve live groceries from local dataset:', err);
    }
    return [];
  }
}
