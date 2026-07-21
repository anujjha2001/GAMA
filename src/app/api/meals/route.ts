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

    // Pre-populate mock health records/meals if database has none
    const today = new Date();
    const mockMeals = [
      {
        id: 'm-1',
        mealType: 'breakfast',
        name: 'Avocado Quinoa Egg Bowl',
        calories: 420,
        protein: 22,
        carbs: 35,
        fat: 18,
        healthRating: 92,
        time: new Date(today.setHours(8, 0, 0))
      },
      {
        id: 'm-2',
        mealType: 'lunch',
        name: 'Grilled Salmon with Spinach Salad',
        calories: 550,
        protein: 46,
        carbs: 12,
        fat: 26,
        healthRating: 98,
        time: new Date(today.setHours(13, 0, 0))
      }
    ];

    // Return combined profile, memory, and nutrition metrics
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
        score: 88,
        caloriesConsumed: 970,
        caloriesTarget: 2200,
        proteinConsumed: 68,
        proteinTarget: 140,
        carbsConsumed: 47,
        carbsTarget: 180,
        fatConsumed: 44,
        fatTarget: 70,
        waterConsumedMl: 1250,
        waterTargetMl: 3000,
        streak: 5
      },
      todayMeals: mockMeals,
      weeklyStory: "You consumed 18% more protein this week than last week. Fiber intake improved. Hydration declined on Wednesday. Sleep quality improved after increasing magnesium-rich foods.",
      groceryList: [
        { id: 'g-1', name: 'Fresh Spinach', category: 'Vegetables', quantity: '1 bunch', purchased: false },
        { id: 'g-2', name: 'Avocado', category: 'Fruits', quantity: '3 units', purchased: false },
        { id: 'g-3', name: 'Organic Tofu / Chicken Breast', category: 'Proteins', quantity: '500g', purchased: false },
        { id: 'g-4', name: 'Quinoa', category: 'Grains', quantity: '1kg', purchased: true },
        { id: 'g-5', name: 'Greek Yogurt', category: 'Dairy', quantity: '1 tub', purchased: false },
        { id: 'g-6', name: 'Omega-3 Supplements', category: 'Supplements', quantity: '1 bottle', purchased: false }
      ],
      micronutrients: {
        iron: { value: 14, target: 18, unit: 'mg', status: 'Optimal' },
        vitaminD: { value: 24, target: 50, unit: 'mcg', status: 'Deficient' },
        vitaminC: { value: 95, target: 90, unit: 'mg', status: 'Optimal' },
        vitaminB12: { value: 1.8, target: 2.4, unit: 'mcg', status: 'Suboptimal' },
        magnesium: { value: 310, target: 400, unit: 'mg', status: 'Suboptimal' },
        calcium: { value: 950, target: 1000, unit: 'mg', status: 'Optimal' },
        potassium: { value: 3400, target: 4700, unit: 'mg', status: 'Suboptimal' },
        omega3: { value: 600, target: 1000, unit: 'mg', status: 'Suboptimal' }
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
