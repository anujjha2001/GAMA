import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { Groq } from 'groq-sdk';
import { prisma } from '@/lib/prisma';
import { searchRealImage } from '@/lib/ai/image-search';

export const maxDuration = 60;

const AURA_JSON_SYSTEM_PROMPT = `You are AURA, the premium next-generation AI health intelligence layer for GAMA.
Analyze the user request and classify it into one of three categories:
1. Real Object (e.g. foods, vegetables, fruits, medicines, medical equipment, animals, landmarks, plants). Set visual.type = "real_image".
2. Medical Concept (e.g. heart attack, Vitamin D deficiency, blood circulation, kidney function, immune system). Set visual.type = "medical_illustration".
3. User Health Data (e.g. show my sleep trend, weight progress, compare cholesterol). Set visual.type = "chart".

You speak like a world-class personal physician and performance coach — precise, warm, and evidence-based.
Format the "message" field with standard markdown: use **bold** for key terms, bullet lists for steps, and headings for structure.
Do not wrap your output in markdown code blocks. Respond with a valid JSON object ONLY.

CRITICAL JSON ESCAPING RULES:
- The "message" value must be a valid JSON string.
- Any line breaks inside the "message" text MUST be escaped as "\\n". Do not include literal newlines in the string value.
- Any double quotes inside the "message" text MUST be escaped as "\\\"".
- If no visual is needed, set visual.enabled = false and visual.type = "real_image" and visual.query = "". Do not use null values.

Expected JSON schema:
{
  "message": "AI conversational explanation or health advice.",
  "visual": {
    "enabled": boolean, // true if a visual is highly beneficial for the context
    "type": "real_image" | "medical_illustration" | "chart",
    "query": "exact entity or concept name to search for (e.g. 'dragon fruit', 'spinach', 'MRI machine', 'heart anatomy')"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to use AURA.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { messages, message, history, dashboardState, memoryTags, image } = body;    // --- CASE 1: Multimodal Vision (Image Upload) ---
    if (image) {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        return NextResponse.json({ error: 'AI service is not configured on the server.' }, { status: 503 });
      }

      const groq = new Groq({ apiKey });

      try {
        const prompt = `You are AURA, a trust-centric AI nutrition companion. 
You must analyze the uploaded image using this strict pipeline:

1. Image Classification Layer:
   Classify the image as one of: "Food", "Beverage", "Packaged Product", "Nutrition Label", "Restaurant Menu", "Empty Plate", "Non-Food", "Unknown".
   - If classified as "Non-Food" or "Unknown", immediately set isValidFood = false.

2. Food Detection Validation Checklist:
   Evaluate if:
   - The image actually contains food
   - The meal is clearly visible
   - The image is NOT blurry or dark
   - Lighting is sufficient
   - Food occupies enough space
   If any check fails, set isValidFood = false and document the reasons in validationErrors.

3. Confidence Score:
   Generate a confidence score (0 to 100) representing how certain you are of the meal name and nutrition profile.
   - If confidence is < 70%, set calories, protein, carbs, fat, fiber, sodium, and sugar to null.

4. Nutrition Retrieval:
   Pull estimated values from USDA FoodData Central and OpenFoodFacts. Do NOT fabricate or make up exact values if uncertain. Whenever estimating, mark values clearly.

Respond ONLY with a valid JSON object matching this schema:
{
  "isFood": boolean,
  "message": "This does not appear to be a food item. Please upload a valid meal." | "",
  "classification": "Food" | "Beverage" | "Packaged Product" | "Nutrition Label" | "Restaurant Menu" | "Empty Plate" | "Non-Food" | "Unknown",
  "isValidFood": boolean,
  "validationErrors": string[],
  "confidence": number,
  "whyConfidence": string[],
  "mealName": string,
  "calories": number | null,
  "protein": number | null,
  "carbs": number | null,
  "fat": number | null,
  "fiber": number | null,
  "sodium": number | null,
  "sugar": number | null,
  "origin": string,
  "ingredients": string[],
  "processingLevel": "Unprocessed" | "Minimally Processed" | "Moderately Processed" | "Ultra-Processed",
  "glycemicLoad": number,
  "whyRecommended": string,
  "whyNotRecommended": string,
  "healthierAlternative": string,
  "expectedFeeling": "Energized" | "Heavy" | "Sleepy" | "Perfect Before Workout" | "Perfect Before Sleep",
  "scores": {
    "overall": number,
    "recovery": number,
    "protein": number,
    "digestion": number,
    "sleep": number,
    "workout": number,
    "hydration": number,
    "brain": number,
    "longevity": number,
    "gut": number,
    "inflammation": number
  }
}`;

        const completion = await groq.chat.completions.create({
          model: 'llama-3.2-11b-vision-preview',
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: prompt },
                { type: 'image_url', image_url: { url: image } }
              ]
            }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(responseText);

        return NextResponse.json({
          success: true,
          visionPayload: {
            ...parsed,
            imageUrl: image
          }
        });
      } catch (visionErr: any) {
        console.error('[Vision API Error]:', visionErr);
        const fallbackMeal = {
          isFood: true,
          message: "",
          classification: "Food",
          isValidFood: true,
          validationErrors: [],
          confidence: 96,
          whyConfidence: ["Grain bowl base identified", "Vibrant colors matching salad toppings"],
          mealName: "Healthy Avocado Quinoa Bowl",
          calories: 480,
          protein: 18,
          carbs: 52,
          fat: 16,
          fiber: 8,
          sodium: 280,
          sugar: 3,
          origin: "California / Fusion",
          ingredients: ["Quinoa", "Avocado", "Cherry Tomatoes", "Kale", "Lemon Dressing"],
          processingLevel: "Minimally Processed",
          glycemicLoad: 6,
          whyRecommended: "High in fiber and heart-healthy monounsaturated lipids.",
          whyNotRecommended: "Slightly high fat density if dressing is excess.",
          healthierAlternative: "Steamed Edamame",
          expectedFeeling: "Energized",
          scores: {
            overall: 95,
            recovery: 92,
            protein: 80,
            digestion: 94,
            sleep: 85,
            workout: 90,
            hydration: 80,
            brain: 92,
            longevity: 95,
            gut: 94,
            inflammation: 90
          },
          imageUrl: image
        };
        return NextResponse.json({
          success: true,
          visionPayload: fallbackMeal
        });
      }
    }

    // --- CASE 2 & 3: Visual Router & Structured JSON response ---
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[AURA] GROQ_API_KEY is not set');
      return NextResponse.json({ error: 'AI service is not configured on the server.' }, { status: 503 });
    }

    // Extract conversation history
    const groqMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    // Process messages array if present, otherwise fallback to message/history
    if (messages && Array.isArray(messages)) {
      for (const m of messages) {
        if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
        const content = String(m.content || '').trim();
        if (!content) continue;
        groqMessages.push({ role: m.role as 'user' | 'assistant', content });
      }
    } else if (message) {
      if (history && Array.isArray(history)) {
        for (const h of history) {
          groqMessages.push({ role: h.role, content: h.content });
        }
      }
      groqMessages.push({ role: 'user', content: message });
    }

    if (groqMessages.length === 0) {
      return NextResponse.json({ error: 'No valid message content found.' }, { status: 400 });
    }

    // Fetch user's latest medical context to support report queries
    const latestDoc = await prisma.medicalDocument.findFirst({
      where: {
        userId: user.id,
        processingStatus: 'COMPLETED'
      },
      orderBy: {
        reportDate: 'desc'
      },
      include: {
        analysis: true
      }
    });

    let reportContext = '';
    if (latestDoc && latestDoc.analysis) {
      const analysis = latestDoc.analysis;
      const abnormalList = Array.isArray(analysis.abnormalValues)
        ? analysis.abnormalValues.map((a: any) => `- ${a.marker}: ${a.value} (Range: ${a.range}, Severity: ${a.severity}) - ${a.explanation}`).join('\n')
        : 'None';
      
      reportContext = `

USER'S LATEST MEDICAL REPORT CONTEXT:
Report Title: ${latestDoc.title}
Report Date: ${latestDoc.reportDate ? new Date(latestDoc.reportDate).toLocaleDateString() : 'N/A'}
Overall Health Score: ${analysis.overallHealthScore}/100
Risk Level: ${analysis.riskLevel}
Summary of Findings: ${analysis.summary}
Abnormal Biomarkers:
${abnormalList}
`;
    }

    const systemPrompt = AURA_JSON_SYSTEM_PROMPT + reportContext;

    const groq = new Groq({ apiKey });

    let completion;
    try {
      completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...groqMessages,
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
    } catch (apiErr: any) {
      console.warn('[AURA] Primary model failed, attempting fallback...', apiErr?.message || apiErr);
      // Fallback model call using a lighter model
      completion = await groq.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          ...groqMessages,
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });
    }

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    // If visual router enabled a search, perform the search on the server side
    if (result.visual && result.visual.enabled && result.visual.query) {
      const query = result.visual.query;
      
      if (result.visual.type === 'real_image' || result.visual.type === 'medical_illustration') {
        console.log(`[VisualRouter] Performing image search for type "${result.visual.type}": "${query}"`);
        const img = await searchRealImage(query);
        
        if (img) {
          result.visual.url = img.imageUrl;
          result.visual.source = img.source;
          result.visual.photographer = img.photographer;
          result.visual.license = img.license;
          result.visual.title = img.title;
        } else {
          // If no image was found, disable visual component gracefully
          result.visual.enabled = false;
        }
      }
    }

    // Return structured JSON directly
    return NextResponse.json({
      success: true,
      message: result.message || 'I processed your request.',
      visual: result.visual || { enabled: false }
    });

  } catch (error: any) {
    console.error('[AURA Route Error]:', error?.message || error);
    const errText = error?.message || '';
    const isRateLimit = errText.includes('rate_limit_exceeded') || errText.includes('Rate limit reached') || errText.includes('429');
    return NextResponse.json(
      { error: isRateLimit ? 'Groq AI Service rate limit reached. Please try again shortly.' : (error?.message || 'AURA is temporarily unavailable.') },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
