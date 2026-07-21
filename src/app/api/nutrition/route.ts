import { NextResponse, type NextRequest } from 'next/server';

const OPENROUTER_KEY = process.env.Edamam_API || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = (searchParams.get('query') || '').trim();
    const type = searchParams.get('type') || 'nutrition'; // 'nutrition' | 'recipes'

    if (!query) {
      return NextResponse.json({ success: false, error: 'query is required' }, { status: 400 });
    }

    if (!OPENROUTER_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    let prompt = '';

    if (type === 'recipes') {
      prompt = `You are Edamam Recipe Intelligence. Search for real healthy recipes for "${query}".

Return EXACTLY 6 healthy recipe results as raw JSON array (no markdown, no code blocks):
[
  {
    "id": "recipe_001",
    "label": "Recipe Name",
    "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop",
    "source": "Healthy Kitchen",
    "url": "https://www.allrecipes.com",
    "yield": 2,
    "calories": 320,
    "totalTime": 25,
    "cuisineType": ["indian"],
    "mealType": ["lunch"],
    "dishType": ["main course"],
    "dietLabels": ["Low-Fat", "High-Fiber"],
    "healthLabels": ["Vegetarian", "Gluten-Free"],
    "cautions": [],
    "totalNutrients": {
      "ENERC_KCAL": { "label": "Energy", "quantity": 320, "unit": "kcal" },
      "PROCNT": { "label": "Protein", "quantity": 28, "unit": "g" },
      "FAT": { "label": "Total lipid (fat)", "quantity": 8, "unit": "g" },
      "CHOCDF": { "label": "Carbohydrate, by difference", "quantity": 35, "unit": "g" },
      "FIBTG": { "label": "Fiber, total dietary", "quantity": 6, "unit": "g" }
    },
    "auraScore": 82,
    "difficulty": "Easy",
    "ingredients": ["chicken breast", "quinoa", "spinach", "lemon"]
  }
]`;
    } else {
      prompt = `You are Edamam Nutrition Analysis. Analyze the complete nutrition facts for "${query}".

Return a single nutrition object as raw JSON (no markdown, no code blocks):
{
  "food": "${query}",
  "servingSize": "100g",
  "calories": 250,
  "protein": 22,
  "carbs": 18,
  "fat": 8,
  "fiber": 3,
  "sugar": 4,
  "sodium": 380,
  "cholesterol": 45,
  "saturatedFat": 2.1,
  "potassium": 320,
  "vitaminA": 12,
  "vitaminC": 8,
  "vitaminB12": 1.2,
  "calcium": 85,
  "iron": 2.4,
  "magnesium": 38,
  "glycemicIndex": 42,
  "glycemicLoad": 9,
  "processingLevel": "Minimally Processed",
  "allergens": ["dairy"],
  "dietCompatibility": {
    "keto": true,
    "vegan": false,
    "diabeticFriendly": true,
    "glutenFree": true
  },
  "healthHighlights": ["High protein", "Low glycemic index", "Rich in B12"],
  "warnings": [],
  "auraScore": 78,
  "confidence": 95
}`;
    }

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://gama.health',
        'X-Title': 'GAMA Health OS - Nutrition'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ success: false, error: 'AI service error' }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || '{}';

    const jsonStr = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    let result: any = null;
    try {
      result = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ success: false, error: 'Failed to parse nutrition data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      type,
      data: result,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (err: any) {
    console.error('[/api/nutrition] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
