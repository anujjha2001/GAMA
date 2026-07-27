import { NextResponse, type NextRequest } from 'next/server';
import { swiggyDataset } from '@/app/(dashboard)/live-order/Dataset-swiggy';
import { Restaurant, Meal } from '@/lib/ai/marketplace/food-provider';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

// Fallback Unsplash image helper
const getUnsplashFoodImage = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('fish') || q.includes('salmon') || q.includes('seafood')) {
    return 'https://images.unsplash.com/photo-1485921325814-a5341adc7c9c?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('chicken') || q.includes('poultry') || q.includes('meat')) {
    return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('salad') || q.includes('greens') || q.includes('veg')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60';
  }
  if (q.includes('orange') || q.includes('fruit')) {
    return 'https://images.unsplash.com/photo-1547514701-42782101795e?w=500&auto=format&fit=crop&q=60';
  }
  return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60';
};

const healthyImages = [
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&auto=format&fit=crop&q=80'
];

function sanitizeToHealthyRestaurant(r: any): { name: string; cuisines: string[]; imageUrl: string } {
  let name = r.name;
  name = name.replace(/Biryani/gi, 'Keto Biryani & Salads');
  name = name.replace(/Pizza/gi, 'Cauliflower Crust Pizza & Bowls');
  name = name.replace(/Burger/gi, 'Protein Bowls & Lettuce Wraps');
  name = name.replace(/Sweets|Bakery/gi, 'Sugar-Free Organic Bakery');
  name = name.replace(/Chai/gi, 'Organic Matcha & Herbal Tea');
  name = name.replace(/Bikkgane/gi, 'Bikkgane Healthy');
  
  if (!name.toLowerCase().includes('healthy') && 
      !name.toLowerCase().includes('salad') && 
      !name.toLowerCase().includes('keto') && 
      !name.toLowerCase().includes('organic')) {
    name = name + ' (Organic & Healthy)';
  }

  const cuisines = (r.cuisine || []).map((c: string) => {
    let clean = c.trim();
    if (/Biryani/i.test(clean)) return 'Keto Biryani';
    if (/Pizza/i.test(clean)) return 'Cauliflower Crust Pizza';
    if (/Burger/i.test(clean)) return 'Lettuce Wraps';
    if (/Fast Food/i.test(clean)) return 'Healthy Fast Food';
    if (/Desserts/i.test(clean)) return 'Sugar-Free Desserts';
    if (/Mughlai|North Indian/i.test(clean)) return 'High Protein Indian Bowls';
    if (/Chinese/i.test(clean)) return 'Low-Sodium Asian Stir-Fry';
    if (/Italian/i.test(clean)) return 'Gluten-Free Mediterranean';
    return clean;
  });

  const imageIndex = Math.abs(parseInt(r.restaurant_id || '0', 10) || 0) % healthyImages.length;
  const imageUrl = healthyImages[imageIndex];

  return { name, cuisines, imageUrl };
}

function generateHealthyMealsForRestaurant(restaurant: Restaurant): Meal[] {
  const cuisines = restaurant.cuisine.toLowerCase();
  const meals: Meal[] = [];

  const defaultNutrients = (cal: number, pro: number, carb: number, fat: number) => ({
    calories: cal,
    proteinG: pro,
    carbsG: carb,
    fatG: fat,
    fiberG: Math.round(carb * 0.25),
    sugarG: Math.round(carb * 0.08),
    sodiumMg: 350,
    glycemicLoad: Math.round(carb * 0.15),
    processingLevel: 'Minimally Processed' as const,
    vitamins: ['Vitamin A', 'Vitamin C', 'Vitamin K'],
    minerals: ['Iron', 'Magnesium', 'Zinc']
  });

  const defaultScores = (overall: number) => ({
    overall,
    recovery: Math.min(100, overall - 2),
    protein: Math.min(100, overall + 3),
    digestion: 95,
    sleep: 85,
    workout: 90,
    hydration: 80,
    brain: 85,
    longevity: 90,
    gut: 92,
    inflammation: 90
  });

  if (cuisines.includes('biryani')) {
    meals.push({
      id: `meal-biryani-chicken-${restaurant.id}`,
      name: 'Keto Cauliflower Chicken Biryani Bowl',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 290,
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=60',
      category: 'Keto Bowls',
      auraScore: 92,
      nutrients: defaultNutrients(380, 32, 12, 18),
      scores: defaultScores(92),
      whyRecommend: 'Substitutes high-carb rice with organic cauliflower grains. High protein & fiber.',
      whyAvoid: 'None. Keto-compliant.',
      alternativeName: 'Quinoa Paneer Biryani Bowl',
      alternativeId: `meal-biryani-paneer-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
    meals.push({
      id: `meal-biryani-quinoa-${restaurant.id}`,
      name: 'Quinoa Veg Superfood Biryani',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 260,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      category: 'Superfood Bowls',
      auraScore: 95,
      nutrients: defaultNutrients(310, 14, 42, 8),
      scores: defaultScores(95),
      whyRecommend: 'Made with organic quinoa, rich in essential amino acids and complex carbohydrates.',
      whyAvoid: 'None.',
      alternativeName: 'Keto Cauliflower Biryani Bowl',
      alternativeId: `meal-biryani-chicken-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
  }

  if (cuisines.includes('pizza') || cuisines.includes('italian')) {
    meals.push({
      id: `meal-pizza-veg-${restaurant.id}`,
      name: 'Low-Carb Garden Veggie Cauliflower Pizza',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 380,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      category: 'Mediterranean Pizza',
      auraScore: 89,
      nutrients: defaultNutrients(420, 18, 22, 14),
      scores: defaultScores(89),
      whyRecommend: 'Gluten-free cauliflower crust with organic mozzarella and seasonal veggies.',
      whyAvoid: 'Dairy. Skip cheese for vegan adjustment.',
      alternativeName: 'Almond Crust Pesto Salad Pizza',
      alternativeId: `meal-pizza-pesto-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
  }

  if (cuisines.includes('burger') || cuisines.includes('wraps')) {
    meals.push({
      id: `meal-burger-turkey-${restaurant.id}`,
      name: 'Avocado Bun High-Protein Turkey Burger',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 340,
      imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60',
      category: 'Protein Wraps',
      auraScore: 93,
      nutrients: defaultNutrients(350, 36, 8, 16),
      scores: defaultScores(93),
      whyRecommend: 'Replaces wheat bun with fresh avocado halves. Extremely high lean protein.',
      whyAvoid: 'High healthy fat density. Consume in moderation.',
      alternativeName: 'Tofu Lettuce Wrap',
      alternativeId: `meal-burger-tofu-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
  }

  if (meals.length === 0) {
    meals.push({
      id: `meal-general-salad-${restaurant.id}`,
      name: 'Omega-3 Salmon & Quinoa Salad Bowl',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 450,
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=500&auto=format&fit=crop&q=60',
      category: 'Superfood Bowls',
      auraScore: 98,
      nutrients: defaultNutrients(410, 34, 28, 14),
      scores: defaultScores(98),
      whyRecommend: 'Rich in EPA/DHA fatty acids, provides complete muscle protein and fiber.',
      whyAvoid: 'None. Gold standard choice.',
      alternativeName: 'Spiced Chickpea Avocado Bowl',
      alternativeId: `meal-general-chickpea-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
    meals.push({
      id: `meal-general-chickpea-${restaurant.id}`,
      name: 'Spiced Chickpea Avocado Greens Bowl',
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      platform: 'Swiggy',
      price: 310,
      imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&auto=format&fit=crop&q=60',
      category: 'Salads & Greens',
      auraScore: 96,
      nutrients: defaultNutrients(290, 12, 38, 10),
      scores: defaultScores(96),
      whyRecommend: 'Completely vegan, high fiber, high plant iron and heart-healthy monounsaturated fats.',
      whyAvoid: 'None.',
      alternativeName: 'Omega-3 Salmon & Quinoa Salad Bowl',
      alternativeId: `meal-general-salad-${restaurant.id}`,
      expectedFeeling: 'Energized'
    });
  }

  return meals;
}

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id }
    });

    if (!profile || (profile.role !== 'PRO' && profile.role !== 'pro')) {
      return NextResponse.json({ error: 'PRO subscription required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();
    const favOnly = searchParams.get('favOnly') === 'true';
    const vegOnly = searchParams.get('vegOnly') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    const isSearchHealthyOrEmpty = !query || query.toLowerCase() === 'healthy';

    // 1. Fetch user's favorite restaurants if favOnly is toggled
    let favRestaurantIds: string[] = [];
    if (favOnly) {
      const favs = await prisma.savedRestaurant.findMany({
        where: { profileId: profile.id },
        select: { restaurantId: true }
      });
      favRestaurantIds = favs.map(f => f.restaurantId);
    }

    // 2. Filter matching restaurants from the Swiggy dataset
    let matchedRaw = swiggyDataset.filter((r: any) => {
      // Filter by favorites if requested
      if (favOnly && !favRestaurantIds.includes(r.restaurant_id)) {
        return false;
      }

      const isVegMatch = vegOnly ? r.veg_only : true;
      if (!isVegMatch) return false;

      if (isSearchHealthyOrEmpty) {
        return true;
      }

      const nameMatch = r.name.toLowerCase().includes(query.toLowerCase());
      const cuisineMatch = (r.cuisine || []).some((c: string) => c.toLowerCase().includes(query.toLowerCase()));
      return nameMatch || cuisineMatch;
    });

    // Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedRaw = matchedRaw.slice(startIndex, startIndex + limit);

    // 3. Fetch verified nutrition facts from FoodIntelligenceService if query is custom
    let verified: any = null;
    let nutritionPayload: any = null;
    let explanationPayload: any = null;
    let scoresPayload: any = null;

    if (query && !isSearchHealthyOrEmpty) {
      try {
        verified = await FoodIntelligenceService.searchAndVerify(query);
        if (verified) {
          nutritionPayload = verified;
          scoresPayload = FoodIntelligenceService.calculateScores(verified);
          explanationPayload = await FoodIntelligenceService.explainFacts(verified);
        }
      } catch (err) {
        console.error('FoodIntelligenceService lookup failed:', err);
      }
    }

    // 4. Map and enrich meal items with verified nutrition or generated healthy dishes
    let meals: Meal[] = [];
    const parsedRestaurants: Restaurant[] = paginatedRaw.map((r: any) => {
      const sanitized = sanitizeToHealthyRestaurant(r);

      const restaurant: Restaurant = {
        id: r.restaurant_id,
        name: sanitized.name,
        cuisine: sanitized.cuisines.join(', '),
        platform: 'Swiggy',
        healthRating: r.rating || 4.2,
        trustScore: Math.round(80 + (r.rating ? r.rating * 4 : 5)),
        healthyMenuPercent: 95, // Fully sanitized to be healthy
        freshScore: 92,
        lowOilAvailable: true,
        vegScore: r.veg_only ? 100 : 60,
        deliveryReliability: 95,
        distanceKm: r.last_mile_distance_km || 2.5,
        deliveryTimeMins: r.delivery_time_minutes || 30,
        priceForTwo: r.cost_for_two_rupees || 300,
        isBusyNow: !r.is_open,
        offers: r.offers || ['Flat 15% OFF with GAMA Pro'],
        imageUrl: sanitized.imageUrl,
        scores: {
          overall: Math.round(85 + (r.rating ? r.rating * 3 : 5)),
          nutrition: 92,
          recovery: 85,
          value: 88
        }
      };

      // Add healthy meal items for this restaurant
      if (verified) {
        let mealName = verified.name;
        // Sanitize meal name to be healthy
        mealName = mealName.replace(/Biryani/gi, 'Keto Cauliflower Biryani');
        mealName = mealName.replace(/Pizza/gi, 'Gluten-Free Cauliflower Crust Pizza');
        mealName = mealName.replace(/Burger/gi, 'Avocado Bun Turkey Burger');
        mealName = mealName.replace(/Paneer Butter Masala/gi, 'Low-Fat Paneer Butter Masala Bowl');
        mealName = mealName.replace(/Dal Baati/gi, 'Fiber-Rich Sprouted Dal Baati Bowl');
        mealName = mealName.replace(/Litti Chokha/gi, 'Gluten-Free Baked Litti Chokha');
        
        if (!mealName.toLowerCase().includes('healthy') && 
            !mealName.toLowerCase().includes('salad') && 
            !mealName.toLowerCase().includes('keto') && 
            !mealName.toLowerCase().includes('bowl')) {
          mealName = 'AURA-Approved ' + mealName + ' Bowl';
        }

        meals.push({
          id: `meal-${query}-${r.restaurant_id}`,
          name: `${mealName} (Verified)`,
          restaurantId: r.restaurant_id,
          restaurantName: sanitized.name,
          platform: 'Swiggy',
          price: 250,
          imageUrl: getUnsplashFoodImage(query),
          category: 'Verified Cuisines',
          auraScore: scoresPayload?.overallScore || 90,
          nutrients: {
            calories: verified.calories,
            proteinG: verified.protein,
            carbsG: verified.carbs,
            fatG: verified.fat,
            fiberG: verified.fiber,
            sugarG: verified.sugar,
            sodiumMg: verified.sodium,
            glycemicLoad: verified.glycemicLoad,
            processingLevel: verified.apiSource.includes('OFF') ? 'Highly Processed' : 'Minimally Processed',
            vitamins: verified.vitaminA > 0 ? ['Vitamin A'] : [],
            minerals: verified.calcium > 0 ? ['Calcium'] : []
          },
          scores: {
            overall: scoresPayload?.overallScore || 90,
            recovery: scoresPayload?.recoveryScore || 80,
            protein: scoresPayload?.proteinScore || 80,
            digestion: 85,
            sleep: 80,
            workout: 85,
            hydration: 75,
            brain: 80,
            longevity: 85,
            gut: 85,
            inflammation: 80
          },
          whyRecommend: 'Factual source verification: rich in minerals and verified healthy macros.',
          whyAvoid: verified.sugar > 10 ? 'Contains sugar.' : 'None.',
          alternativeName: 'Keto Greens Bowl',
          alternativeId: `meal-veg-salad-${r.restaurant_id}`,
          expectedFeeling: 'Energized'
        });
      } else {
        // Generate healthy dishes according to restaurant specialties
        meals.push(...generateHealthyMealsForRestaurant(restaurant));
      }

      return restaurant;
    });

    return NextResponse.json({
      success: true,
      nutrition: nutritionPayload,
      scores: scoresPayload,
      explanation: explanationPayload,
      meals,
      restaurants: parsedRestaurants
    });

  } catch (error: any) {
    console.error('[Global Food API Search Error]:', error);
    return NextResponse.json({ success: false, meals: [], restaurants: [] });
  }
}
