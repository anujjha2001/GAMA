/**
 * Diversity enforcer — applies cuisine, restaurant, and image uniqueness rules
 * to the final ranked array before returning to the client.
 *
 * Rules (applied in order, phase 1):
 * 1. No restaurant appears more than once in the first 20 cards
 * 2. No cuisine type appears more than 2 times in the first 20 cards
 * 3. No imageUrl appears more than once in the same batch
 * Items that violate a rule are deferred and fill remaining slots if space allows.
 */

const MAX_CUISINE_COUNT = 2;
const TARGET_RESULTS = 20;

export class DiversityEnforcer {
  /**
   * @param meals Already ranked by (auraScore × confidence) descending.
   * @returns Diversity-filtered array up to TARGET_RESULTS items.
   */
  static apply<T extends {
    restaurantName: string;
    imageUrl: string;
    cuisineType?: string;
    category?: string;
  }>(meals: T[]): T[] {
    const cuisineCounts = new Map<string, number>();
    const seenRestaurants = new Set<string>();
    const seenImages = new Set<string>();
    const accepted: T[] = [];
    const deferred: T[] = [];

    for (const meal of meals) {
      const cuisine = (meal.cuisineType || meal.category || 'Unknown').toLowerCase();
      const restaurant = meal.restaurantName.toLowerCase();
      const img = meal.imageUrl;

      const overCuisine = (cuisineCounts.get(cuisine) ?? 0) >= MAX_CUISINE_COUNT;
      const dupRestaurant = seenRestaurants.has(restaurant);
      const dupImage = img ? seenImages.has(img) : false;

      if (overCuisine || dupRestaurant || dupImage) {
        deferred.push(meal);
        continue;
      }

      cuisineCounts.set(cuisine, (cuisineCounts.get(cuisine) ?? 0) + 1);
      seenRestaurants.add(restaurant);
      if (img) seenImages.add(img);
      accepted.push(meal);

      if (accepted.length >= TARGET_RESULTS) break;
    }

    // Fill remaining slots from deferred, avoiding image duplicates
    if (accepted.length < TARGET_RESULTS) {
      for (const meal of deferred) {
        if (accepted.length >= TARGET_RESULTS) break;
        const img = meal.imageUrl;
        if (!img || !seenImages.has(img)) {
          if (img) seenImages.add(img);
          accepted.push(meal);
        }
      }
    }

    return accepted;
  }
}
