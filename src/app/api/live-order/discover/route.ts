import { NextResponse } from 'next/server';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';
import { FoodProviderManager } from '@/lib/ai/marketplace/food-provider';
import { DevelopmentDataProvider } from '@/lib/ai/marketplace/dev-provider';

if (process.env.NODE_ENV === 'development') {
  FoodProviderManager.setProvider(new DevelopmentDataProvider());
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query') || undefined;

    const meals = await FoodIntelligenceService.discoverMeals(query);
    
    return NextResponse.json({ success: true, data: meals });
  } catch (error: any) {
    console.error('Discover API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to discover meals' },
      { status: 500 }
    );
  }
}
