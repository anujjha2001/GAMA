export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  platform: 'Swiggy' | 'Zomato';
  healthRating: number;      // AURA rating e.g., 4.7 / 5.0
  healthyMenuPercent: number; // e.g. 78%
  freshScore: number;         // e.g. 92%
  lowOilAvailable: boolean;
  vegScore: number;           // e.g. 85%
  deliveryReliability: number; // e.g. 95%
  distanceKm: number;
  deliveryTimeMins: number;
  priceForTwo: number;
  isBusyNow: boolean;
  peakHours: string;          // e.g., 1:00 PM - 2:30 PM
  bestOrderingTime: string;   // e.g., 12:15 PM
  offers: string[];
}

export class RestaurantSearch {
  private static mockRestaurants: Restaurant[] = [
    {
      id: 'rest-1',
      name: 'The Green Bowl Co.',
      cuisine: 'Salads & Healthy Bowls',
      platform: 'Swiggy',
      healthRating: 4.8,
      healthyMenuPercent: 92,
      freshScore: 95,
      lowOilAvailable: true,
      vegScore: 90,
      deliveryReliability: 96,
      distanceKm: 1.8,
      deliveryTimeMins: 22,
      priceForTwo: 500,
      isBusyNow: false,
      peakHours: '12:30 PM - 2:00 PM',
      bestOrderingTime: '12:00 PM',
      offers: ['20% OFF up to ₹120', 'Free delivery']
    },
    {
      id: 'rest-2',
      name: 'Organic Kitchen',
      cuisine: 'Healthy Indian & Whole Wheat',
      platform: 'Zomato',
      healthRating: 4.6,
      healthyMenuPercent: 85,
      freshScore: 88,
      lowOilAvailable: true,
      vegScore: 80,
      deliveryReliability: 92,
      distanceKm: 2.5,
      deliveryTimeMins: 28,
      priceForTwo: 600,
      isBusyNow: true,
      peakHours: '1:00 PM - 2:30 PM',
      bestOrderingTime: '12:45 PM',
      offers: ['Flat 15% OFF']
    },
    {
      id: 'rest-3',
      name: 'FitBites Café',
      cuisine: 'Smoothies, Keto Bowls & Wraps',
      platform: 'Swiggy',
      healthRating: 4.9,
      healthyMenuPercent: 96,
      freshScore: 97,
      lowOilAvailable: true,
      vegScore: 75,
      deliveryReliability: 98,
      distanceKm: 1.2,
      deliveryTimeMins: 18,
      priceForTwo: 450,
      isBusyNow: false,
      peakHours: '8:30 AM - 10:00 AM',
      bestOrderingTime: '9:00 AM',
      offers: ['Buy 1 Get 1 on Protein Smoothies']
    },
    {
      id: 'rest-4',
      name: 'Copper Chimney Health',
      cuisine: 'Clean North Indian Grills',
      platform: 'Zomato',
      healthRating: 4.3,
      healthyMenuPercent: 65,
      freshScore: 82,
      lowOilAvailable: true,
      vegScore: 50,
      deliveryReliability: 90,
      distanceKm: 3.4,
      deliveryTimeMins: 35,
      priceForTwo: 700,
      isBusyNow: false,
      peakHours: '7:30 PM - 9:30 PM',
      bestOrderingTime: '7:00 PM',
      offers: ['10% OFF on Grills']
    },
    {
      id: 'rest-5',
      name: 'Pure Veg Oasis',
      cuisine: 'Pure Vegetarian Healthy Delights',
      platform: 'Swiggy',
      healthRating: 4.5,
      healthyMenuPercent: 88,
      freshScore: 90,
      lowOilAvailable: true,
      vegScore: 100,
      deliveryReliability: 94,
      distanceKm: 2.1,
      deliveryTimeMins: 25,
      priceForTwo: 400,
      isBusyNow: true,
      peakHours: '1:15 PM - 2:30 PM',
      bestOrderingTime: '12:50 PM',
      offers: ['Flat ₹50 OFF']
    }
  ];

  static searchRestaurants(query: string, filters: {
    vegOnly?: boolean;
    highProtein?: boolean;
    lowOil?: boolean;
    platform?: 'Swiggy' | 'Zomato' | 'all';
  }): Restaurant[] {
    let list = [...this.mockRestaurants];

    if (query) {
      const q = query.toLowerCase();
      list = list.filter(r => r.name.toLowerCase().includes(q) || r.cuisine.toLowerCase().includes(q));
    }

    if (filters.vegOnly) {
      list = list.filter(r => r.vegScore > 80);
    }

    if (filters.lowOil) {
      list = list.filter(r => r.lowOilAvailable);
    }

    if (filters.platform && filters.platform !== 'all') {
      list = list.filter(r => r.platform === filters.platform);
    }

    // Sort by health rating
    return list.sort((a, b) => b.healthRating - a.healthRating);
  }

  static getRestaurantDetails(id: string): Restaurant | null {
    return this.mockRestaurants.find(r => r.id === id) || null;
  }
}
