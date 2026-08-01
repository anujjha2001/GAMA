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
    const profileId = searchParams.get('profileId') || 'demo-profile';

    const recommendations = await FoodIntelligenceService.getRecommendations(profileId);
    
    return NextResponse.json({ success: true, data: recommendations });
  } catch (error: any) {
    console.error('Recommend API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}
