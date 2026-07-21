import { NextResponse, type NextRequest } from 'next/server';
import { swiggyDataset } from '@/app/(dashboard)/live-order/Dataset-swiggy';
import { Restaurant, Meal, GroceryItem } from '@/lib/ai/marketplace/food-provider';

// Hardcoded Unsplash visuals mapping for clean theme integration
const getUnsplashFoodImage = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('fish') || q.includes('salmon') || q.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1485921325814-a5341adc7c9c?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('chicken') || q.includes('poultry') || q.includes('meat') || q.includes('bhurji')) {
    return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('salad') || q.includes('greens') || q.includes('veg')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('orange') || q.includes('citrus') || q.includes('fruit')) {
    return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('biryani') || q.includes('rice') || q.includes('indian') || q.includes('pulao')) {
    return 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
};

// Local helper to dynamically generate healthy menu dishes matching a restaurant's cuisines
const generateHealthyMeals = (r: any): Meal[] => {
  const list: Meal[] = [];
  const cuisines = (r.cuisine || []).map((c: string) => c.trim().toLowerCase());

  const hasBiryani = cuisines.some((c: string | string[]) => c.includes('biryani') || c.includes('hyderabadi') || c.includes('lucknowi'));
  const hasNorthIndian = cuisines.some((c: string | string[]) => c.includes('north indian') || c.includes('punjabi') || c.includes('mughlai') || c.includes('andhra') || c.includes('indian'));
  const hasSouthIndian = cuisines.some((c: string | string[]) => c.includes('south indian') || c.includes('andhra'));
  const hasChinese = cuisines.some((c: string | string[]) => c.includes('chinese') || c.includes('asian'));

  if (hasBiryani) {
    list.push({
      id: `meal-biryani-chicken-${r.restaurant_id}`,
      name: `Brown Rice Chicken Biryani (Low Oil)`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 280,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Indian',
      auraScore: 92,
      nutrients: {
        calories: 450,
        proteinG: 34,
        carbsG: 48,
        fatG: 10,
        fiberG: 6,
        sugarG: 1,
        sodiumMg: 420,
        glycemicLoad: 7,
        processingLevel: 'Minimally Processed',
        vitamins: ['Vitamin B6', 'Niacin'],
        minerals: ['Iron', 'Selenium']
      },
      scores: { overall: 92, recovery: 95, protein: 88, digestion: 85, sleep: 80, workout: 92, hydration: 75, brain: 80, longevity: 85, gut: 85, inflammation: 80 },
      whyRecommend: 'High protein density and complex carbs from brown basmati rice support recovery.',
      whyAvoid: 'Mildly elevated sodium.',
      alternativeName: 'Quinoa Vegetable Biryani',
      alternativeId: `meal-biryani-veg-${r.restaurant_id}`,
      expectedFeeling: 'Energized'
    });
    list.push({
      id: `meal-biryani-veg-${r.restaurant_id}`,
      name: `Quinoa Vegetable Biryani`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 240,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Indian',
      auraScore: 95,
      nutrients: {
        calories: 320,
        proteinG: 12,
        carbsG: 52,
        fatG: 5,
        fiberG: 9,
        sugarG: 2,
        sodiumMg: 280,
        glycemicLoad: 5,
        processingLevel: 'Unprocessed',
        vitamins: ['Vitamin C', 'Folate'],
        minerals: ['Magnesium', 'Potassium']
      },
      scores: { overall: 95, recovery: 88, protein: 55, digestion: 96, sleep: 90, workout: 80, hydration: 80, brain: 88, longevity: 94, gut: 95, inflammation: 94 },
      whyRecommend: 'High in dietary fiber and essential plant minerals.',
      whyAvoid: 'None.',
      alternativeName: 'Brown Rice Veg Biryani',
      alternativeId: `meal-biryani-chicken-${r.restaurant_id}`,
      expectedFeeling: 'Energized'
    });
  }

  if (hasNorthIndian) {
    list.push({
      id: `meal-paneer-${r.restaurant_id}`,
      name: `Low-Fat Paneer Bhurji (Whole Wheat)`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 220,
      imageUrl: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Indian',
      auraScore: 94,
      nutrients: {
        calories: 360,
        proteinG: 22,
        carbsG: 24,
        fatG: 14,
        fiberG: 5,
        sugarG: 2,
        sodiumMg: 320,
        glycemicLoad: 4,
        processingLevel: 'Minimally Processed',
        vitamins: ['Vitamin D', 'Vitamin B12'],
        minerals: ['Calcium', 'Zinc']
      },
      scores: { overall: 94, recovery: 90, protein: 78, digestion: 92, sleep: 88, workout: 85, hydration: 80, brain: 85, longevity: 90, gut: 90, inflammation: 88 },
      whyRecommend: 'Rich source of vegetarian proteins and bioavailable calcium.',
      whyAvoid: 'Contains dairy.',
      alternativeName: 'Yellow Dal Tadka',
      alternativeId: `meal-dal-${r.restaurant_id}`,
      expectedFeeling: 'Perfect Before Workout'
    });
    list.push({
      id: `meal-dal-${r.restaurant_id}`,
      name: `Yellow Dal Tadka with Steamed Brown Rice`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 180,
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Indian',
      auraScore: 93,
      nutrients: {
        calories: 290,
        proteinG: 14,
        carbsG: 44,
        fatG: 6,
        fiberG: 8,
        sugarG: 1,
        sodiumMg: 290,
        glycemicLoad: 4,
        processingLevel: 'Unprocessed',
        vitamins: ['Folate', 'Vitamin B1'],
        minerals: ['Iron', 'Potassium']
      },
      scores: { overall: 93, recovery: 92, protein: 60, digestion: 95, sleep: 92, workout: 75, hydration: 85, brain: 85, longevity: 92, gut: 94, inflammation: 93 },
      whyRecommend: 'Clean, easily digestible plant protein and complex carbs.',
      whyAvoid: 'Relatively low in protein for advanced post-workout recovery.',
      alternativeName: 'Low-Fat Paneer Bhurji',
      alternativeId: `meal-paneer-${r.restaurant_id}`,
      expectedFeeling: 'Perfect Before Sleep'
    });
  }

  if (hasSouthIndian) {
    list.push({
      id: `meal-idli-${r.restaurant_id}`,
      name: `Steamed Ragi Idli (3 pcs) with Sambar`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 130,
      imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy South Indian',
      auraScore: 96,
      nutrients: {
        calories: 220,
        proteinG: 6,
        carbsG: 42,
        fatG: 2,
        fiberG: 7,
        sugarG: 2,
        sodiumMg: 210,
        glycemicLoad: 3,
        processingLevel: 'Unprocessed',
        vitamins: ['Vitamin B1', 'Niacin'],
        minerals: ['Calcium', 'Iron']
      },
      scores: { overall: 96, recovery: 85, protein: 35, digestion: 98, sleep: 95, workout: 70, hydration: 90, brain: 90, longevity: 96, gut: 97, inflammation: 96 },
      whyRecommend: 'Extremely easy on the gut; ragi offers outstanding calcium content.',
      whyAvoid: 'Low protein content.',
      alternativeName: 'Oats Rava Dosa',
      alternativeId: `meal-dosa-${r.restaurant_id}`,
      expectedFeeling: 'Perfect Before Sleep'
    });
  }

  if (hasChinese) {
    list.push({
      id: `meal-tofu-stir-${r.restaurant_id}`,
      name: `Ginger Garlic Stir-Fry Tofu & Broccoli`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 240,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Asian',
      auraScore: 94,
      nutrients: {
        calories: 240,
        proteinG: 16,
        carbsG: 18,
        fatG: 9,
        fiberG: 6,
        sugarG: 3,
        sodiumMg: 340,
        glycemicLoad: 3,
        processingLevel: 'Minimally Processed',
        vitamins: ['Vitamin C', 'Vitamin K'],
        minerals: ['Iron', 'Calcium']
      },
      scores: { overall: 94, recovery: 92, protein: 65, digestion: 94, sleep: 90, workout: 80, hydration: 85, brain: 88, longevity: 94, gut: 92, inflammation: 95 },
      whyRecommend: 'Rich in anti-inflammatory active compounds from fresh ginger and garlic.',
      whyAvoid: 'Check soy sauce levels for custom sodium limits.',
      alternativeName: 'Ragi Idli with Sambar',
      alternativeId: `meal-idli-${r.restaurant_id}`,
      expectedFeeling: 'Energized'
    });
  }

  // Base fallback if no specific cuisine matched
  if (list.length === 0) {
    list.push({
      id: `meal-fallback-salad-${r.restaurant_id}`,
      name: `Avocado Quinoa Green Salad`,
      restaurantId: r.restaurant_id,
      restaurantName: r.name,
      platform: 'Swiggy',
      price: 290,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      category: 'Healthy Bowls',
      auraScore: 96,
      nutrients: {
        calories: 310,
        proteinG: 10,
        carbsG: 26,
        fatG: 16,
        fiberG: 9,
        sugarG: 2,
        sodiumMg: 180,
        glycemicLoad: 3,
        processingLevel: 'Unprocessed',
        vitamins: ['Vitamin E', 'Vitamin C'],
        minerals: ['Magnesium', 'Potassium']
      },
      scores: { overall: 96, recovery: 92, protein: 55, digestion: 98, sleep: 90, workout: 82, hydration: 90, brain: 95, longevity: 98, gut: 97, inflammation: 96 },
      whyRecommend: 'Packed with monounsaturated healthy fats, potassium, and magnesium.',
      whyAvoid: 'None.',
      alternativeName: 'Steamed Edamame',
      alternativeId: `meal-edamame-${r.restaurant_id}`,
      expectedFeeling: 'Energized'
    });
  }

  return list;
};

// Static high-quality local groceries reference dictionary
const LOCAL_GROCERIES = [
  { id: "swiggy-g-1", name: "Fresh Orange (Malta)", category: "Fruits", price: 80, healthScore: 98, recipeSuggestion: "Juiced or eaten fresh as a metabolic snack", nutrients: "Calories: 60kcal, Vitamin C: 110%, Fiber: 3g", imageUrl: "https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60" },
  { id: "swiggy-g-2", name: "Organic Spinach Bundles", category: "Vegetables", price: 30, healthScore: 96, recipeSuggestion: "Sauteed with garlic or blended into smoothies", nutrients: "Calories: 25kcal, Iron: 15%, Calcium: 10%", imageUrl: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=500&auto=format&fit=crop&q=60" },
  { id: "swiggy-g-3", name: "Low-Fat Paneer Block (200g)", category: "Protein", price: 90, healthScore: 94, recipeSuggestion: "Grilled paneer steaks or bhurji wraps", nutrients: "Calories: 180kcal, Protein: 18g, Calcium: 40%", imageUrl: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=500&auto=format&fit=crop&q=60" }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || 'healthy').trim().toLowerCase();
    const vegOnly = searchParams.get('vegOnly') === 'true';
    const highProtein = searchParams.get('highProtein') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    // --- 1. Filter local Swiggy dataset ---
    // Matches: Restaurant names, Cuisines, area_name, address, locality, or dynamically matched items
    let matchedRaw = swiggyDataset.filter((r: any) => {
      const nameMatch = r.name.toLowerCase().includes(query);
      const areaMatch = (r.area_name || '').toLowerCase().includes(query) || (r.locality || '').toLowerCase().includes(query) || (r.address || '').toLowerCase().includes(query);
      const cuisineMatch = (r.cuisine || []).some((c: string) => c.toLowerCase().includes(query));

      // Virtual menu item matches (since dishes are generated by cuisine types)
      const matchesBiryani = query.includes('biryani') && (r.cuisine || []).some((c: string) => c.toLowerCase().includes('biryani'));
      const matchesIndian = (query.includes('paneer') || query.includes('dal') || query.includes('roti') || query.includes('chicken')) && (r.cuisine || []).some((c: string) => c.toLowerCase().includes('indian') || c.toLowerCase().includes('punjabi') || c.toLowerCase().includes('mughlai'));
      const matchesDosa = (query.includes('dosa') || query.includes('idli')) && (r.cuisine || []).some((c: string) => c.toLowerCase().includes('south indian'));
      const matchesChinese = (query.includes('stir') || query.includes('tofu') || query.includes('broccoli')) && (r.cuisine || []).some((c: string) => c.toLowerCase().includes('chinese'));

      // If default "healthy" query, match all open restaurants
      const isDefaultSearch = query === 'healthy' || query === '';

      const filterMatch = nameMatch || areaMatch || cuisineMatch || matchesBiryani || matchesIndian || matchesDosa || matchesChinese || isDefaultSearch;

      if (vegOnly && !r.veg_only) return false;

      return filterMatch;
    });

    // Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedRaw = matchedRaw.slice(startIndex, startIndex + limit);

    // --- 2. Map and Generate GAMA compatible structures ---
    const meals: Meal[] = [];

    const parsedRestaurants: Restaurant[] = paginatedRaw.map((r: any, idx: number) => {
      // Map Swiggy restaurant
      const restaurant: Restaurant = {
        id: r.restaurant_id,
        name: r.name,
        cuisine: r.cuisine?.join(', ') || 'Global Brand',
        platform: 'Swiggy',
        healthRating: r.rating || 4.2,
        trustScore: Math.round(80 + (r.rating ? r.rating * 4 : 5)),
        healthyMenuPercent: r.veg_only ? 90 : 75,
        freshScore: 88,
        lowOilAvailable: true,
        vegScore: r.veg_only ? 100 : 40,
        deliveryReliability: 95,
        distanceKm: r.last_mile_distance_km || 2.5,
        deliveryTimeMins: r.delivery_time_minutes || 30,
        priceForTwo: r.cost_for_two_rupees || 300,
        isBusyNow: !r.is_open,
        offers: r.offers || ['Flat 10% OFF with GAMA'],
        imageUrl: r.image_url || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
        scores: {
          overall: Math.round(75 + (r.rating ? r.rating * 5 : 10)),
          nutrition: 85,
          recovery: 80,
          value: 85
        }
      };

      // Generate healthy meals for this restaurant
      const generated = generateHealthyMeals(r);

      // Filter generated meals if highProtein is requested
      let filteredMeals = generated;
      if (highProtein) {
        filteredMeals = generated.filter(m => m.nutrients.proteinG >= 25);
      }

      meals.push(...filteredMeals);
      return restaurant;
    });

    // --- 3. Filter raw groceries ---
    const groceries = LOCAL_GROCERIES.filter(g =>
      g.name.toLowerCase().includes(query) ||
      g.category.toLowerCase().includes(query) ||
      query === 'healthy' ||
      query === ''
    );

    return NextResponse.json({
      success: true,
      meals,
      groceries,
      restaurants: parsedRestaurants
    });

  } catch (error: any) {
    console.error('[Global Food API Search Error]:', error);
    return NextResponse.json({ success: false, meals: [], groceries: [], restaurants: [] });
  }
}
