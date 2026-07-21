import { NextResponse, type NextRequest } from 'next/server';

const OPENROUTER_KEY = process.env.Google_Places_API || '';
const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const query = searchParams.get('query') || 'healthy restaurants';
    const radius = parseInt(searchParams.get('radius') || '2000', 10);

    if (!lat || !lng) {
      return NextResponse.json({ success: false, error: 'lat and lng are required' }, { status: 400 });
    }

    if (!OPENROUTER_KEY) {
      return NextResponse.json({ success: false, error: 'API key not configured' }, { status: 500 });
    }

    const prompt = `You are a real-time location intelligence system. The user is at latitude ${lat}, longitude ${lng}.

Search for real "${query}" within ${radius / 1000}km radius. Return EXACTLY 8 real restaurants/cafes that would realistically exist near these coordinates.

Determine the city/area from coordinates: lat ${lat}, lng ${lng}.

Return a JSON array with this exact structure, no markdown, no code blocks, just raw JSON:
[
  {
    "id": "place_001",
    "name": "Restaurant Name",
    "address": "Real Street Address, Area, City",
    "cuisine": "Indian/Chinese/Continental/etc",
    "rating": 4.2,
    "totalRatings": 1240,
    "distanceKm": 0.8,
    "isOpen": true,
    "priceLevel": 2,
    "healthScore": 78,
    "phone": "+91-XXXXXXXXXX",
    "website": "",
    "photos": [],
    "types": ["restaurant", "food"],
    "vegOptions": true,
    "deliveryAvailable": true,
    "zomatoUrl": "https://www.zomato.com/search?q=Restaurant+Name",
    "swiggyUrl": "https://www.swiggy.com/search?query=Restaurant+Name",
    "specialties": ["Protein Bowl", "Salad", "Grilled Chicken"],
    "openingHours": "8:00 AM – 10:00 PM",
    "highlights": ["Low calorie options", "Fresh ingredients"]
  }
]

Make sure restaurants are geographically accurate to the coordinates. Vary the distances from 0.3km to 2.5km. Make health scores reflect actual healthy food quality (60-95 range).`;

    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_KEY}`,
        'HTTP-Referer': 'https://gama.health',
        'X-Title': 'GAMA Health OS - Places'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter Places error:', errText);
      return NextResponse.json({ success: false, error: 'AI service error', details: errText }, { status: 502 });
    }

    const data = await response.json();
    const rawContent = data?.choices?.[0]?.message?.content || '[]';

    // Clean up any markdown wrapping
    const jsonStr = rawContent
      .replace(/```json\s*/gi, '')
      .replace(/```\s*/gi, '')
      .trim();

    let places = [];
    try {
      places = JSON.parse(jsonStr);
      if (!Array.isArray(places)) places = [];
    } catch (parseErr) {
      console.error('Failed to parse places JSON:', parseErr);
      places = [];
    }

    return NextResponse.json({
      success: true,
      places,
      meta: {
        lat,
        lng,
        query,
        radius,
        timestamp: new Date().toISOString(),
        count: places.length
      }
    });

  } catch (err: any) {
    console.error('[/api/places] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
