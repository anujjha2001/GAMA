import { NextResponse, type NextRequest } from 'next/server';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json(); // base64 representation of image

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
    }

    // Strip base64 prefix if present
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // Call Unified AI Orchestrator
    const { AIOrchestrator } = await import('@/lib/ai/orchestrator');
    const analysis = await AIOrchestrator.scanFoodImage(base64Image);

    // Strict validation check
    if (!analysis.isFood || analysis.confidence < 95) {
      return NextResponse.json({
        success: true,
        visionPayload: {
          isFood: false,
          isValidFood: false,
          classification: 'Non-Food',
          confidence: analysis.confidence || 0,
          message: 'This image does not appear to contain food.'
        }
      });
    }

    // Process detected foods
    const detectedItems = [];
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    const whyConfidenceList: string[] = [];

    for (const foodName of analysis.foods) {
      const verified = await FoodIntelligenceService.searchAndVerify(foodName);
      if (verified) {
        detectedItems.push(verified);
        totalCalories += verified.calories;
        totalProtein += verified.protein;
        totalCarbs += verified.carbs;
        totalFat += verified.fat;
        totalFiber += verified.fiber;
        totalSugar += verified.sugar;
        totalSodium += verified.sodium;
        whyConfidenceList.push(`Identified ${verified.name} (${verified.confidence}% verified via ${verified.apiSource})`);
      }
    }

    const mealName = analysis.foods.join(' + ');

    return NextResponse.json({
      success: true,
      visionPayload: {
        isFood: true,
        isValidFood: true,
        classification: 'Food',
        mealName: mealName || 'Balanced Meal',
        confidence: analysis.confidence,
        whyConfidence: whyConfidenceList.length > 0 ? whyConfidenceList : ['Detected organic compounds and food items.'],
        glycemicLoad: 8,
        processingLevel: 'Minimally Processed',
        expectedFeeling: 'Energized & Full',
        whyRecommended: 'Balanced intake of clean proteins, dietary fibers, and essential complex carbohydrates.',
        whyNotRecommended: totalSugar > 15 ? 'Contains elevated sugars.' : null,
        healthierAlternative: 'Swap for Quinoa Protein Bowl',
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein * 10) / 10,
        carbs: Math.round(totalCarbs * 10) / 10,
        fat: Math.round(totalFat * 10) / 10,
        fiber: Math.round(totalFiber * 10) / 10,
        sugar: Math.round(totalSugar * 10) / 10,
        sodium: Math.round(totalSodium)
      }
    });

  } catch (error: any) {
    console.error('[Vision Food Scan Error]:', error);
    return NextResponse.json({
      success: false,
      error: 'Vision detection failed or timed out. Please try again.'
    }, { status: 500 });
  }
}
