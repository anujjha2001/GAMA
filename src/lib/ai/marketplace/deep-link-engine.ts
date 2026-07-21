export class DeepLinkEngine {
  /**
   * Generates a deep link to Swiggy or Zomato for a restaurant/dish selection.
   * Emulates routing logic so it redirects to a real web catalog item or custom search fallback.
   */
  static getRedirectUrl(
    platform: 'Swiggy' | 'Zomato',
    restaurantName: string,
    dishName?: string
  ): string {
    const formattedRest = encodeURIComponent(restaurantName);
    const formattedDish = dishName ? encodeURIComponent(dishName) : '';

    if (platform.toLowerCase() === 'swiggy') {
      // Swiggy web deep link or search fallbacks
      if (dishName) {
        return `https://www.swiggy.com/search?query=${formattedDish}`;
      }
      return `https://www.swiggy.com/restaurants/${formattedRest.toLowerCase()}`;
    } else {
      // Zomato web deep link or search fallbacks
      if (dishName) {
        return `https://www.zomato.com/search?q=${formattedDish}`;
      }
      return `https://www.zomato.com/search?q=${formattedRest}`;
    }
  }

  /**
   * Returns a mobile app custom scheme link if supported (for deep link redirects).
   */
  static getAppSchemeUrl(
    platform: 'Swiggy' | 'Zomato',
    restaurantName: string
  ): string {
    const term = restaurantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (platform.toLowerCase() === 'swiggy') {
      return `swiggy://restaurant/${term}`;
    }
    return `zomato://restaurant/${term}`;
  }
}
