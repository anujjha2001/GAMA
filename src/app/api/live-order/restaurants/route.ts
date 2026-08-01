import { NextResponse } from 'next/server';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';
import { FoodProviderManager } from '@/lib/ai/marketplace/food-provider';
import { DevelopmentDataProvider } from '@/lib/ai/marketplace/dev-provider';

// Setup provider for API context
if (process.env.NODE_ENV === 'development') {
  FoodProviderManager.setProvider(new DevelopmentDataProvider());
}

export async function GET(request: Request) {
  console.log("=== API ROUTE HIT: /api/live-order/restaurants ===");
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const query = searchParams.get('query') || undefined;

    const restaurants = await FoodIntelligenceService.getNearbyRestaurants(lat, lng, query);
    
    return NextResponse.json({ success: true, data: restaurants });
  } catch (error: any) {
    console.error('Restaurants API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch restaurants' },
      { status: 500 }
    );
  }
}
