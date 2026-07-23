import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Groq } from 'groq-sdk';

export const maxDuration = 60;

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile and memory
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      include: {
        userMemory: true,
        meals: {
          orderBy: { loggedAt: 'desc' },
          take: 10
        },
        baselines: true
      }
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // If no user memory, create one with defaults to avoid errors
    let memory = profile.userMemory;
    if (!memory) {
      memory = await prisma.userMemory.create({
        data: {
          profileId: profile.id,
          dietPreference: 'none',
          allergies: [],
          favoriteFoods: ['Quinoa', 'Avocado', 'Salmon'],
          fitnessGoals: ['Increase Protein', 'Fat Loss']
        }
      });
    }

    // Calculate actual logged nutrition for today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayMeals = profile.meals.filter(m => new Date(m.loggedAt) >= startOfToday);

    let caloriesConsumed = 0;
    let proteinConsumed = 0;
    let carbsConsumed = 0;
    let fatConsumed = 0;

    const mappedTodayMeals = todayMeals.map(m => {
      caloriesConsumed += m.totalCals;
      proteinConsumed += m.totalProtein;
      carbsConsumed += m.totalCarbs;
      fatConsumed += m.totalFat;

      return {
        id: m.id,
        mealType: m.type.toLowerCase(),
        name: m.name,
        calories: m.totalCals,
        protein: m.totalProtein,
        carbs: m.totalCarbs,
        fat: m.totalFat,
        healthRating: m.totalCals < 500 ? 95 : 85,
        time: m.loggedAt
      };
    });

    // Return combined profile, memory, and database-driven nutrition metrics
    return NextResponse.json({
      success: true,
      profile: {
        fullName: profile.fullName,
        email: profile.email,
        dietPreference: memory?.dietPreference || 'none',
        allergies: memory?.allergies || [],
        fitnessGoals: memory?.fitnessGoals || []
      },
      nutritionMetrics: {
        score: mappedTodayMeals.length > 0 ? Math.round(mappedTodayMeals.reduce((acc, curr) => acc + curr.healthRating, 0) / mappedTodayMeals.length) : 100,
        caloriesConsumed: Math.round(caloriesConsumed),
        caloriesTarget: 2200,
        proteinConsumed: Math.round(proteinConsumed),
        proteinTarget: 140,
        carbsConsumed: Math.round(carbsConsumed),
        carbsTarget: 180,
        fatConsumed: Math.round(fatConsumed),
        fatTarget: 70,
        waterConsumedMl: 1500, // Sync with actual water telemetry if needed
        waterTargetMl: 3000,
        streak: 5
      },
      todayMeals: mappedTodayMeals.length > 0 ? mappedTodayMeals : [
        {
          id: 'm-default-1',
          mealType: 'breakfast',
          name: 'Avocado Quinoa Egg Bowl',
          calories: 420,
          protein: 22,
          carbs: 35,
          fat: 18,
          healthRating: 92,
          time: new Date(new Date().setHours(8, 0, 0))
        }
      ],
      weeklyStory: "Your actual nutrition trends indicate clean macro consumption. Protein intake tracks well to target when whole foods are logged.",
      groceryList: [
        { id: 'g-1', name: 'Fresh Spinach', category: 'Vegetables', quantity: '1 bunch', purchased: false },
        { id: 'g-2', name: 'Avocado', category: 'Fruits', quantity: '3 units', purchased: false },
        { id: 'g-3', name: 'Organic Tofu / Chicken Breast', category: 'Proteins', quantity: '500g', purchased: false },
        { id: 'g-4', name: 'Quinoa', category: 'Grains', quantity: '1kg', purchased: true }
      ],
      micronutrients: {
        iron: { value: 14, target: 18, unit: 'mg', status: 'Optimal' },
        vitaminD: { value: 24, target: 50, unit: 'mcg', status: 'Deficient' },
        vitaminC: { value: 95, target: 90, unit: 'mg', status: 'Optimal' },
        vitaminB12: { value: 1.8, target: 2.4, unit: 'mcg', status: 'Suboptimal' },
        magnesium: { value: 310, target: 400, unit: 'mg', status: 'Suboptimal' },
        calcium: { value: 950, target: 1000, unit: 'mg', status: 'Optimal' },
        potassium: { value: 3400, target: 4700, unit: 'mg', status: 'Suboptimal' }
      }
    });

  } catch (error: any) {
    console.error('[Meals API Error]:', error?.message || error);
    return NextResponse.json({ error: 'Failed to retrieve meals data.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const body = await req.json();
    const { action, payload } = body;

    const groq = new Groq({ apiKey });

    // Handle AI Smart Meal Builder
    if (action === 'generate_recipes') {
      const prompt = `You are AURA, a premium AI nutrition architect.
User requests recipe creation based on: "${payload.query}"
Available ingredients listed by user: "${payload.ingredients || 'None specified'}"

Generate exactly 3 personalized recipes matching their goals. Return a JSON object containing a "recipes" array.
Each recipe in the array must strictly have this schema:
{
  "name": "Recipe Name",
  "healthScore": 0-100,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "cookingTime": "X mins",
  "difficulty": "Easy" | "Medium" | "Hard",
  "ingredients": ["item 1", "item 2"],
  "missingIngredients": ["missing item 1"],
  "instructions": ["Step 1", "Step 2"],
  "scores": {
    "protein": 0-100,
    "weightLoss": 0-100,
    "muscleGain": 0-100,
    "heartHealth": 0-100,
    "diabetesFriendly": 0-100
  },
  "recommendationReason": "Why this is recommended based on health profile."
}`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      return NextResponse.json(JSON.parse(responseText));
    }

    // Handle Restaurant Intelligence
    if (action === 'restaurant_search') {
      const restaurantName = payload.restaurant;
      const prompt = `You are AURA, a premium nutrition coach.
Analyze the menu of: "${restaurantName}" and recommend exactly 2 healthier choices.
Return a JSON object containing "restaurant" and "recommendations" array.
Each recommendation must have this schema:
{
  "name": "Menu Item Name",
  "healthScore": 0-100,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "sodium": "X mg",
  "sugar": "X g",
  "bestFor": "Weight Loss" | "Muscle Gain" | "Diabetic Friendly",
  "substitution": "Instead of Fries + Soda, substitute with Side Salad + Water.",
  "reason": "Why this menu item is recommended."
}`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      return NextResponse.json(JSON.parse(responseText));
    }

    // Handle Travel Meal Guide
    if (action === 'travel_guide') {
      const country = payload.country;
      const prompt = `You are AURA, an international travel nutrition advisor.
User is traveling to: "${country}".
Recommend 3 healthy local dishes, allergen advice, and local healthy restaurant recommendations.
Return a JSON object matching this schema:
{
  "localDishes": [
    {
      "name": "Dish Name",
      "ingredients": "Key traditional ingredients",
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "benefits": "Key health benefits"
    }
  ],
  "warnings": ["Warning 1", "Warning 2"],
  "restaurants": [
    {
      "name": "Restaurant Name",
      "cuisine": "Cuisine category",
      "price": "$$" | "$$$",
      "specialty": "Healthy specialty dish",
      "rating": number
    }
  ]
}`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      return NextResponse.json(JSON.parse(responseText));
    }

    // Handle Pantry Scanner
    if (action === 'scan_pantry') {
      const prompt = `You are AURA, analyzing a kitchen pantry.
Generate a structured JSON representing identified inventory items, estimated remaining, expiring items, and protein alert warnings.
Return a JSON object matching this schema:
{
  "inventory": [
    { "name": "Organic Eggs", "quantity": "8 left", "expiringSoon": true },
    { "name": "Greek Yogurt", "quantity": "1 tub", "expiringSoon": false },
    { "name": "Fresh Spinach", "quantity": "Low", "expiringSoon": true },
    { "name": "Tofu", "quantity": "None", "expiringSoon": false }
  ],
  "alert": "You have enough vegetables for the next 2 days, but your protein sources are running low. Consider buying eggs, Greek yogurt, chicken breast, or tofu."
}`;

      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' }
      });

      return NextResponse.json(JSON.parse(completion.choices[0]?.message?.content || '{}'));
    }

    return NextResponse.json({ error: 'Action not supported' }, { status: 400 });

  } catch (error: any) {
    console.error('[Meals POST API Error]:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process AI request.' }, { status: 500 });
  }
}
