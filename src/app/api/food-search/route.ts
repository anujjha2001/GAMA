import { NextResponse, type NextRequest } from 'next/server';
import { swiggyDataset } from '@/app/(dashboard)/live-order/Dataset-swiggy';
import { Restaurant, Meal } from '@/lib/ai/marketplace/food-provider';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';

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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();
    const vegOnly = searchParams.get('vegOnly') === 'true';
    const highProtein = searchParams.get('highProtein') === 'true';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '4', 10);

    if (!query) {
      return NextResponse.json({ success: true, meals: [], groceries: [], restaurants: [] });
    }

    // 1. Fetch verified nutrition facts from FoodIntelligenceService
    const verified = await FoodIntelligenceService.searchAndVerify(query);
    let nutritionPayload = null;
    let explanationPayload = null;
    let scoresPayload = null;

    if (verified) {
      nutritionPayload = verified;
      scoresPayload = FoodIntelligenceService.calculateScores(verified);
      explanationPayload = await FoodIntelligenceService.explainFacts(verified);
    }

    // 2. Filter matching restaurants from the Swiggy dataset
    let matchedRaw = swiggyDataset.filter((r: any) => {
      const nameMatch = r.name.toLowerCase().includes(query.toLowerCase());
      const cuisineMatch = (r.cuisine || []).some((c: string) => c.toLowerCase().includes(query.toLowerCase()));
      const isVegMatch = vegOnly ? r.veg_only : true;
      return (nameMatch || cuisineMatch) && isVegMatch;
    });

    // Pagination slice
    const startIndex = (page - 1) * limit;
    const paginatedRaw = matchedRaw.slice(startIndex, startIndex + limit);

    // 3. Map and enrich meal items with verified nutrition if available
    const meals: Meal[] = [];
    const parsedRestaurants: Restaurant[] = paginatedRaw.map((r: any) => {
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

      // Add actual dish powered by verified nutrition
      if (verified) {
        meals.push({
          id: `meal-${query}-${r.restaurant_id}`,
          name: `${verified.name} (Verified Nutrients)`,
          restaurantId: r.restaurant_id,
          restaurantName: r.name,
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
          whyRecommend: 'Factual source verification: rich in minerals and verified macros.',
          whyAvoid: verified.sugar > 10 ? 'Contains sugar.' : 'None.',
          alternativeName: 'Healthy Veg Salad',
          alternativeId: `meal-veg-salad-${r.restaurant_id}`,
          expectedFeeling: 'Energized'
        });
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
