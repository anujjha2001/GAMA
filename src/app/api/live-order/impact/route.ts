import { NextResponse } from 'next/server';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealId = searchParams.get('mealId');
    const profileId = searchParams.get('profileId') || 'demo-profile';

    if (!mealId) {
      return NextResponse.json({ success: false, error: 'mealId is required' }, { status: 400 });
    }

    const impact = await FoodIntelligenceService.predictHealthImpact(mealId, profileId);
    
    return NextResponse.json({ success: true, data: impact });
  } catch (error: any) {
    console.error('Impact API Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to predict health impact' },
      { status: 500 }
    );
  }
}
