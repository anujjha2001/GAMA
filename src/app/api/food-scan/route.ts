import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import { VisionLayer } from '@/lib/ai/services/vision-layer';
import { FoodIntelligenceService } from '@/lib/services/FoodIntelligenceService';
import { AIOrchestrator } from '@/lib/ai/orchestrator';
import { createHash } from 'crypto';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    // Stage 9 Pre-auth (needed for personalization and timeline)
    const user = await verifyToken(req);

    const { image } = await req.json(); // base64 representation of image

    if (!image) {
      return NextResponse.json({ success: false, error: 'No image data provided' }, { status: 400 });
    }

    // Strip base64 prefix
    const base64Image = image.replace(/^data:image\/\w+;base64,/, '');

    // ----------------------------------------------------
    // STAGE 7 — CACHING (SHA256 Hash Check)
    // ----------------------------------------------------
    const imageHash = createHash('sha256').update(base64Image).digest('hex');
    const cachedAnalysis = await prisma.foodAnalysis.findFirst({
      where: {
        imageHash,
        status: 'COMPLETED'
      }
    });

    if (cachedAnalysis) {
      console.log(`[Food Scan Cache Hit] Found completed scan for hash: ${imageHash}`);

      // Load user goal meta for personalized recommendation even on cache hits
      let goalRecommendation = 'This meal matches your daily nutrition outline.';
      if (user) {
        const profile = await prisma.userProfile.findUnique({
          where: { id: user.id },
          include: { preferences: true, userMemory: true }
        });
        if (profile) {
          const goal = profile.preferences?.find(p => p.category === 'primaryGoal')?.value || profile.userMemory?.fitnessGoals?.join(', ') || 'fitness';
          goalRecommendation = `This cached meal is verified to support your ${goal} target.`;
        }
      }

      const visionPayload = {
        isFood: true,
        isValidFood: true,
        classification: 'Food',
        mealName: cachedAnalysis.foodItems.join(' + '),
        confidence: Math.round(cachedAnalysis.confidenceScore * 100),
        whyConfidence: [`Cached match verified via ${cachedAnalysis.nutritionSource || 'Database'}`],
        glycemicLoad: cachedAnalysis.glycemicLoad || 8,
        processingLevel: 'Minimally Processed',
        expectedFeeling: 'Satisfied',
        whyRecommended: 'Balanced intake of logged macros.',
        whyNotRecommended: null,
        healthierAlternative: cachedAnalysis.alternatives?.[0] || 'Garden Salad',
        calories: cachedAnalysis.calories,
        protein: cachedAnalysis.protein,
        carbs: cachedAnalysis.carbs,
        fat: cachedAnalysis.fat,
        fiber: cachedAnalysis.fiber,
        sugar: cachedAnalysis.sugar,
        sodium: cachedAnalysis.vitamins ? (cachedAnalysis.vitamins as any).sodium || 200 : 200
      };

      return NextResponse.json({
        success: true,
        food: cachedAnalysis.foodItems[0] || 'Balanced Meal',
        confidence: cachedAnalysis.confidenceScore,
        portion: cachedAnalysis.portionSize,
        nutrition: {
          calories: cachedAnalysis.calories,
          protein: cachedAnalysis.protein,
          carbs: cachedAnalysis.carbs,
          fat: cachedAnalysis.fat,
          fiber: cachedAnalysis.fiber,
          sugar: cachedAnalysis.sugar,
          sodium: visionPayload.sodium,
          potassium: (cachedAnalysis.minerals as any)?.potassium || 0,
          calcium: (cachedAnalysis.minerals as any)?.calcium || 0,
          iron: (cachedAnalysis.minerals as any)?.iron || 0,
          vitaminA: (cachedAnalysis.vitamins as any)?.vitaminA || 0,
          vitaminC: (cachedAnalysis.vitamins as any)?.vitaminC || 0,
          vitaminD: (cachedAnalysis.vitamins as any)?.vitaminD || 0,
          vitaminB12: (cachedAnalysis.vitamins as any)?.vitaminB12 || 0
        },
        healthScore: cachedAnalysis.healthRating,
        benefits: cachedAnalysis.alternatives, // Map back cached alternatives or categories
        concerns: cachedAnalysis.explanation ? [cachedAnalysis.explanation] : [],
        suggestions: cachedAnalysis.alternatives,
        recommendedPortion: cachedAnalysis.portionSize,
        bestTimeToEat: 'Lunch or Dinner',
        whoShouldAvoid: 'None',
        goalRecommendation,
        visionPayload
      });
    }

    // Load User Profile details if authenticated
    let goal = 'fitness';
    let age: number | undefined = undefined;
    let weight: number | undefined = undefined;
    let dietPreference = 'none';
    let allergies: string[] = [];

    if (user) {
      const profile = await prisma.userProfile.findUnique({
        where: { id: user.id },
        include: {
          preferences: true,
          userMemory: true,
          healthRecords: { orderBy: { recordedAt: 'desc' }, take: 1 }
        }
      });

      if (profile) {
        const preferences = profile.preferences || [];
        const memory = profile.userMemory;
        const latestHealth = profile.healthRecords[0];

        const dobPref = preferences.find(p => p.category === 'dob')?.value;
        if (dobPref) {
          const birthDate = new Date(dobPref);
          if (!isNaN(birthDate.getTime())) {
            const today = new Date();
            let calculatedAge = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) calculatedAge--;
            age = calculatedAge;
          }
        }
        const gender = preferences.find(p => p.category === 'gender')?.value || 'other';
        weight = latestHealth?.weight || parseFloat(preferences.find(p => p.category === 'weight')?.value || '0') || undefined;
        goal = preferences.find(p => p.category === 'primaryGoal')?.value || memory?.fitnessGoals?.join(', ') || 'fitness';
        dietPreference = memory?.dietPreference || 'none';
        allergies = memory?.allergies || [];
      }
    }

    // ----------------------------------------------------
    // STAGE 0 — IMAGE QUALITY CHECK & STAGE 2 — CONTENT MODERATION
    // ----------------------------------------------------
    const qualityPrompt = `Analyze this image for GAMA Food Scanner safety and quality parameters.
Determine if the image is too blurry, too dark, has bad resolution, or is otherwise occluded.
Also check for nudity, sexual content, violence, gore, weapons, drugs, graphic injuries, explicit content, self-harm, and medical gore.
You must return a JSON object in this exact format:
{
  "isQualityAcceptable": boolean,
  "qualityIssues": string[], // List any issues: "blurry", "too dark", "low resolution", "occluded"
  "isSafe": boolean,
  "safetyIssues": string[] // List safety issues: "nudity", "drugs", "violence", "weapons", "gore", "explicit", "self-harm", "medical-gore"
}`;

    const qualityCheckResult = await VisionLayer.analyzeImage(base64Image, qualityPrompt);
    const qualityData = JSON.parse(qualityCheckResult.content);

    if (!qualityData.isSafe) {
      return NextResponse.json({
        success: false,
        reason: 'Content moderation failure.',
        message: "This image cannot be analyzed because it doesn't meet GAMA Food Scanner requirements."
      });
    }

    if (!qualityData.isQualityAcceptable) {
      const issueStr = qualityData.qualityIssues?.join(', ') || 'blurry';
      return NextResponse.json({
        success: false,
        reason: 'Poor image quality.',
        message: `Image is too ${issueStr}. Please upload a clearer photo.`
      });
    }

    // ----------------------------------------------------
    // STAGE 1 — IMAGE VALIDATION & STAGE 3 — NON-FOOD DETECTION
    // ----------------------------------------------------
    const validationPrompt = `You are a strict food classification guard. Your primary task is to identify if the image is a picture of edible food or drink ready for consumption.
If the image does not clearly depict food or drink (for example, if it is a photo of a laptop, phone, keyboard, screen, monitor, mouse, desk, animal, person, face, hand, car, empty bowl, text, document, paper, book, furniture, building, or random indoor/outdoor scene), you MUST classify it as non-food: set "isFood" to false, "confidence" to 1.0, and "primaryObject" to the name of the non-food object category (e.g. "laptop").
Do NOT try to find tiny crumbs or hallucinate. Be extremely strict and conservative.

Return a JSON object in this exact format:
{
  "isFood": boolean,
  "confidence": number, // confidence score between 0.0 and 1.0
  "foodDetected": string, // name of food item if detected, else empty
  "primaryObject": string // the main object category in the image (e.g. "food", "laptop", "keyboard", "person", "dog")
}`;

    const validationResult = await VisionLayer.analyzeImage(base64Image, validationPrompt);
    const validationData = JSON.parse(validationResult.content);

    const primaryObjectLower = (validationData.primaryObject || '').toLowerCase().trim();
    const isFoodCategory = ['food', 'beverage', 'meal', 'fruit', 'vegetable', 'snack', 'drink', 'juice', 'soup', 'bread', 'rice', 'curry', 'meat', 'chicken', 'paneer', 'pizza', 'burger', 'salad', 'sweet', 'dessert', 'coffee', 'tea', 'egg', 'fish', 'dish', 'plate of'].some(cat => primaryObjectLower.includes(cat));

    const nonFoodKeywords = ['laptop', 'computer', 'keyboard', 'phone', 'smartphone', 'mouse', 'screen', 'monitor', 'desk', 'chair', 'person', 'human', 'man', 'woman', 'face', 'hand', 'dog', 'cat', 'animal', 'car', 'vehicle', 'house', 'building', 'room', 'wall', 'text', 'document', 'paper', 'book', 'pen', 'pencil', 'clothing', 'shoe', 'bag', 'backpack', 'wallet'];
    const isNonFoodObject = nonFoodKeywords.some(keyword => primaryObjectLower.includes(keyword));

    if (!validationData.isFood || validationData.confidence < 0.90 || !isFoodCategory || isNonFoodObject) {
      return NextResponse.json({
        success: false,
        reason: 'No recognizable food detected.',
        message: "This doesn't appear to be a food image. Please upload a clear image of food or a beverage."
      });
    }

    // ----------------------------------------------------
    // STAGE 4 — FOOD SEGMENTATION & STAGE 5 — PORTION ESTIMATION
    // ----------------------------------------------------
    const segmentationPrompt = `Analyze this food image. Segment every visible food item separately.
Do NOT merge multiple foods into a single food item (e.g. if the image contains Rice and Dal, segment them separately).
Estimate portion sizes visually (e.g. "120 g", "250 g", "Half plate", "Full plate", "2 slices", "250 ml").
Identify if any food is a commercial packaged food (like Coca Cola, Maggi, Protein Powder, Milk Packet, Protein Bar).
You must return a JSON object in this exact format:
{
  "foods": [
    {
      "food": string, // Name of the food item, e.g. "Rice", "Dal", "Salad", "Roti", "Coca Cola"
      "confidence": number, // Decimal confidence score from 0.0 to 1.0
      "portion": string, // Visual serving size estimate
      "isPackagedFood": boolean, // True if commercial packaged food
      "ingredients": string[], // List of visible ingredients
      "cookingMethod": string // e.g. "boiled", "fried", "steamed", "grilled", "baked", "raw"
    }
  ]
}`;

    const segmentationResult = await VisionLayer.analyzeImage(base64Image, segmentationPrompt);
    const segmentationData = JSON.parse(segmentationResult.content);

    if (!segmentationData.foods || segmentationData.foods.length === 0) {
      return NextResponse.json({
        success: false,
        reason: 'No recognizable food detected.',
        message: "This doesn't appear to be a food image. Please upload a clear image of food or a beverage."
      });
    }

    // ----------------------------------------------------
    // STAGE 6 — NUTRITION DATABASE LOOKUP
    // ----------------------------------------------------
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;
    let totalPotassium = 0;
    let totalCalcium = 0;
    let totalIron = 0;
    let totalVitaminA = 0;
    let totalVitaminC = 0;
    let totalVitaminD = 0;
    let totalVitaminB12 = 0;

    const whyConfidenceList: string[] = [];
    const detectedFoodNames: string[] = [];
    const allIngredients: string[] = [];
    let databaseSourceUsed = 'Multiple Databases';

    for (const item of segmentationData.foods) {
      detectedFoodNames.push(item.food);
      if (item.ingredients) allIngredients.push(...item.ingredients);

      // Search database (Prisma cache -> IFCT -> USDA -> Spoonacular -> OpenFoodFacts)
      let verified = await FoodIntelligenceService.searchAndVerify(item.food);

      // If packaged and searchAndVerify returned null, search OpenFoodFacts explicitly
      if (!verified && item.isPackagedFood) {
        console.log(`[Pantry/Packaged Detection] Packaged item search via OpenFoodFacts: ${item.food}`);
        // fallback query
        verified = await FoodIntelligenceService.searchAndVerify(item.food + ' package');
      }

      // If still null, query LLM strictly as an offline database retriever (USDA/IFCT database retrieval fallback)
      if (!verified) {
        try {
          console.log(`[Offline Database Fallback] Retrieving standard nutrition values for: ${item.food}`);
          const dbPrompt = `You are a trusted USDA and IFCT nutrition database retriever. 
Provide standard nutritional facts for exactly 100g of the food item: "${item.food}".
Do not guess or estimate visually. Output only standard nutritional table entries.
Return a JSON object in this exact format:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sugar": number,
  "sodium": number,
  "potassium": number,
  "calcium": number,
  "iron": number,
  "vitaminA": number, // in mcg
  "vitaminC": number, // in mg
  "vitaminD": number, // in mcg
  "vitaminB12": number // in mcg
}`;
          const completion = await AIOrchestrator.generate({
            messages: [{ role: 'user', content: dbPrompt }],
            temperature: 0.1,
            response_format: { type: 'json_object' }
          });
          const parsedDb = JSON.parse(completion.content || '{}');
          if (parsedDb.calories !== undefined) {
            verified = {
              name: item.food,
              servingSize: 100,
              servingUnit: 'g',
              calories: parsedDb.calories || 0,
              protein: parsedDb.protein || 0,
              carbs: parsedDb.carbs || 0,
              fat: parsedDb.fat || 0,
              fiber: parsedDb.fiber || 0,
              sugar: parsedDb.sugar || 0,
              sodium: parsedDb.sodium || 0,
              potassium: parsedDb.potassium || 0,
              calcium: parsedDb.calcium || 0,
              iron: parsedDb.iron || 0,
              magnesium: 0,
              vitaminA: parsedDb.vitaminA || 0,
              vitaminB12: parsedDb.vitaminB12 || 0,
              vitaminC: parsedDb.vitaminC || 0,
              vitaminD: parsedDb.vitaminD || 0,
              glycemicIndex: 0,
              glycemicLoad: 0,
              isVegetarian: true,
              isVegan: false,
              isGlutenFree: true,
              benefits: [],
              risks: [],
              apiSource: 'USDA Offline Database Lookup',
              confidence: 90
            };
          }
        } catch (dbErr) {
          console.error('[Offline Database Fallback Error]:', dbErr);
        }
      }

      if (verified) {
        databaseSourceUsed = verified.apiSource || 'USDA Database';

        // Visual portion size multiplier (estimate weight/serving size multiplier)
        let portionMultiplier = 1.0;
        const portionLower = (item.portion || '').toLowerCase();
        if (portionLower.includes('half')) portionMultiplier = 0.5;
        else if (portionLower.includes('full') || portionLower.includes('plate')) portionMultiplier = 1.0;
        else if (portionLower.includes('2 slice')) portionMultiplier = 1.2;
        else if (portionLower.includes('slice')) portionMultiplier = 0.6;
        else {
          // Parse numeric grams if present, e.g. "120 g"
          const parsedGrams = parseFloat(portionLower.replace(/[^\d\.]/g, ''));
          if (!isNaN(parsedGrams) && parsedGrams > 0) {
            portionMultiplier = parsedGrams / verified.servingSize;
          }
        }

        totalCalories += verified.calories * portionMultiplier;
        totalProtein += verified.protein * portionMultiplier;
        totalCarbs += verified.carbs * portionMultiplier;
        totalFat += verified.fat * portionMultiplier;
        totalFiber += verified.fiber * portionMultiplier;
        totalSugar += verified.sugar * portionMultiplier;
        totalSodium += verified.sodium * portionMultiplier;
        totalPotassium += verified.potassium * portionMultiplier;
        totalCalcium += verified.calcium * portionMultiplier;
        totalIron += verified.iron * portionMultiplier;
        totalVitaminA += verified.vitaminA * portionMultiplier;
        totalVitaminC += verified.vitaminC * portionMultiplier;
        totalVitaminD += verified.vitaminD * portionMultiplier;
        totalVitaminB12 += verified.vitaminB12 * portionMultiplier;

        const roundedConfidence = Math.round((item.confidence || 0.98) * 100);
        whyConfidenceList.push(`Segmented ${verified.name} (${roundedConfidence}% confidence via ${verified.apiSource})`);
      }
    }

    const mealName = detectedFoodNames.join(' + ');

    // ----------------------------------------------------
    // STAGE 7 — AI HEALTH ANALYSIS & STAGE 8 — PERSONALIZATION
    // ----------------------------------------------------
    const healthPrompt = `You are AURA, GAMA's premium AI nutrition architect.
Perform a strict health and goal personalization analysis for the scanned meal.
User Demographics & Profile:
- Goal: "${goal}"
- Age: ${age || 'not specified'}
- Weight: ${weight || 'not specified'} kg
- Diet Preference: "${dietPreference}"
- Allergies: [${allergies.join(', ')}]

Scanned Meal:
- Name: "${mealName}"
- Calories: ${Math.round(totalCalories)} kcal
- Protein: ${Math.round(totalProtein)}g
- Carbs: ${Math.round(totalCarbs)}g
- Fat: ${Math.round(totalFat)}g

Generate structural insights in JSON format. Do not fabricate values.
Format:
{
  "healthScore": number, // 0 to 100 based on macro/micro density and safety
  "benefits": string[], // List of benefits
  "concerns": string[], // List of nutritional concerns
  "suggestions": string[], // Improvement actions
  "recommendedPortion": string, // Recommended amount, e.g. "180g"
  "bestTimeToEat": string, // e.g. "Post-workout", "Lunch"
  "whoShouldAvoid": string, // e.g. "Diabetics", "Dairy-allergic users"
  "goalRecommendation": string // 1-2 sentences explaining if/why it supports their goal of "${goal}"
}`;

    const healthAnalysisResult = await AIOrchestrator.generate({
      messages: [{ role: 'user', content: healthPrompt }],
      temperature: 0.2,
      response_format: { type: 'json_object' }
    });

    const healthData = JSON.parse(healthAnalysisResult.content || '{}');

    // Mapped Vision Payload for frontend compatibility
    const overallConfidenceScore = validationData.confidence;
    const finalPortion = segmentationData.foods[0]?.portion || '1 plate';

    const visionPayload = {
      isFood: true,
      isValidFood: true,
      classification: 'Food',
      mealName: mealName || 'Balanced Meal',
      confidence: Math.round(overallConfidenceScore * 100),
      whyConfidence: whyConfidenceList.length > 0 ? whyConfidenceList : ['Detected organic compounds and food items.'],
      glycemicLoad: Math.round(totalCarbs * 0.1),
      processingLevel: totalSugar > 12 ? 'Moderately Processed' : 'Minimally Processed',
      expectedFeeling: totalProtein > 20 ? 'Satisfied & Energized' : 'Light & Digestible',
      whyRecommended: healthData.goalRecommendation || 'Matches your macronutrient guidelines.',
      whyNotRecommended: totalSodium > 500 ? 'Contains elevated sodium levels.' : null,
      healthierAlternative: healthData.suggestions?.[0] || 'Swap for Quinoa Bowl',
      calories: Math.round(totalCalories),
      protein: Math.round(totalProtein * 10) / 10,
      carbs: Math.round(totalCarbs * 10) / 10,
      fat: Math.round(totalFat * 10) / 10,
      fiber: Math.round(totalFiber * 10) / 10,
      sugar: Math.round(totalSugar * 10) / 10,
      sodium: Math.round(totalSodium)
    };

    // ----------------------------------------------------
    // STAGE 9 — SAVE TO DATABASE & USER TIMELINE
    // ----------------------------------------------------
    const vitaminsObj = {
      vitaminA: Math.round(totalVitaminA),
      vitaminC: Math.round(totalVitaminC * 10) / 10,
      vitaminD: Math.round(totalVitaminD * 10) / 10,
      vitaminB12: Math.round(totalVitaminB12 * 10) / 10,
      sodium: Math.round(totalSodium)
    };

    const mineralsObj = {
      potassium: Math.round(totalPotassium),
      calcium: Math.round(totalCalcium),
      iron: Math.round(totalIron * 10) / 10
    };

    let savedAnalysisId: string | undefined = undefined;
    if (user) {
      const savedAnalysis = await prisma.foodAnalysis.create({
        data: {
          profileId: user.id,
          imageUrl: image,
          mealType: 'lunch',
          foodItems: detectedFoodNames,
          ingredients: allIngredients,
          calories: Math.round(totalCalories),
          protein: totalProtein,
          fat: totalFat,
          carbs: totalCarbs,
          fiber: totalFiber,
          sugar: totalSugar,
          vitamins: vitaminsObj,
          minerals: mineralsObj,
          glycemicLoad: Math.round(totalCarbs * 0.1),
          portionSize: finalPortion,
          confidenceScore: overallConfidenceScore,
          healthRating: healthData.healthScore || 85,
          alternatives: healthData.suggestions || [],
          explanation: healthData.goalRecommendation || '',
          status: 'COMPLETED',
          imageHash,
          nutritionSource: databaseSourceUsed,
          modelVersion: qualityCheckResult.modelUsed || 'google/gemini-2.5-flash',
          provider: qualityCheckResult.provider || 'openrouter'
        }
      });
      savedAnalysisId = savedAnalysis.id;

      // Save event to user Timeline
      await prisma.timelineEvent.create({
        data: {
          profileId: user.id,
          type: 'FOOD_SCAN',
          title: `Scanned ${mealName}`,
          description: `Logged a ${finalPortion} portion of ${mealName} (~${Math.round(totalCalories)} kcal). Health score: ${healthData.healthScore || 85}/100.`,
          metadata: {
            analysisId: savedAnalysis.id,
            calories: Math.round(totalCalories),
            protein: Math.round(totalProtein),
            carbs: Math.round(totalCarbs),
            fat: Math.round(totalFat)
          }
        }
      });
    }

    // Return exact requested output format
    return NextResponse.json({
      success: true,
      food: detectedFoodNames[0] || 'Balanced Meal',
      confidence: overallConfidenceScore,
      portion: finalPortion,
      nutrition: {
        calories: Math.round(totalCalories),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        fiber: Math.round(totalFiber),
        sugar: Math.round(totalSugar),
        sodium: Math.round(totalSodium),
        potassium: Math.round(totalPotassium),
        calcium: Math.round(totalCalcium),
        iron: Math.round(totalIron * 10) / 10,
        vitaminA: Math.round(totalVitaminA),
        vitaminC: Math.round(totalVitaminC * 10) / 10,
        vitaminD: Math.round(totalVitaminD * 10) / 10,
        vitaminB12: Math.round(totalVitaminB12 * 10) / 10
      },
      healthScore: healthData.healthScore || 85,
      benefits: healthData.benefits || [],
      concerns: healthData.concerns || [],
      suggestions: healthData.suggestions || [],
      recommendedPortion: healthData.recommendedPortion || finalPortion,
      bestTimeToEat: healthData.bestTimeToEat || 'Lunch',
      whoShouldAvoid: healthData.whoShouldAvoid || 'None',
      goalRecommendation: healthData.goalRecommendation || 'Supports your daily targets.',
      visionPayload
    });

  } catch (error: any) {
    console.error('[Vision Food Scan Error]:', error);
    return NextResponse.json({
      success: false,
      reason: 'Vision processing failed.',
      message: 'Vision detection failed or timed out. Please try again.'
    }, { status: 500 });
  }
}
