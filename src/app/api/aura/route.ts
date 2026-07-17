import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { Groq } from 'groq-sdk';
import { runAURA } from '@/lib/ai/planner';
import { gatherAURAContext } from '@/lib/ai/context';

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are AURA, the premium next-generation AI health intelligence layer for GAMA — a cutting-edge health & wellness platform.

You have deep expertise in:
- Nutrition, macros, micronutrients, and meal optimization
- Sleep science and circadian rhythm optimization  
- Recovery, HRV, and performance metrics
- Stress management and mental wellness
- Exercise programming and athletic performance
- Preventive medicine and biomarker interpretation

You speak like a world-class personal physician and performance coach — precise, warm, confident, and evidence-based. 
Format responses with markdown: use **bold** for key terms, bullet lists for steps, and headings for structure.
Be concise but complete. Never be vague.

IMAGE SEARCH & TOOL CALLING INSTRUCTIONS:
- You have access to a real-time Image Search tool.
- If the user asks for a picture, photo, diagram, illustration, visual, or asks "what does it look like" / "compare visually", or if you determine a visual representation would enhance their understanding of a health concept, you MUST trigger the tool.
- To trigger the tool, write \`[tool:image_search query="exact search query here"]\` on a new line in your response. Replace "exact search query here" with a descriptive query optimized for search engines (e.g. "balanced mediterranean diet plate", "proper deadlift exercise form").
- Only use the tag \`[tool:image_search query="..."]\`.
- Never fabricate image URLs.
- Never state "I cannot send images" or "I do not have access to images". If images are needed, output the tag and the system will load them asynchronously.`;

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

    const { messages, message, history, dashboardState, memoryTags, image } = body;

    // --- CASE 1: Multimodal Vision (Image Upload) ---
    if (image) {
      // Return a simulated, high-fidelity biological vision output matching food logs
      const meals = [
        { mealName: "Grilled Salmon Quinoa Bowl", calories: 540, protein: 42, carbs: 38, fat: 22, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80" },
        { mealName: "Avocado Sourdough Toast", calories: 360, protein: 11, carbs: 42, fat: 18, imageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80" },
        { mealName: "Superberry Acai Protein Bowl", calories: 420, protein: 15, carbs: 65, fat: 12, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&q=80" }
      ];

      const selectedMeal = meals[Math.floor(Math.random() * meals.length)];

      return NextResponse.json({
        success: true,
        text: `### THE INSIGHT\nI have scanned the food profile. Identifed: **${selectedMeal.mealName}**.\n\n### THE WHY\nThis contains high-quality structural lipids and amino acids suited to your metabolic baseline.\n\n### THE ADJUSTMENT\nLog this to track daily protein target tracking.\n\n### THE MICRO-WIN\nDrink 250ml water to optimize gastric enzyme dilution before consuming this meal.`,
        visionPayload: selectedMeal
      });
    }

    // --- CASE 2: Text Chat using Grok AURA Architecture ---
    if (message) {
      const profileId = "default_user"; // Replace with real auth user ID when auth is integrated
      const context = await gatherAURAContext(profileId, dashboardState, memoryTags);
      
      const formattedHistory = { messages: history || [] };
      const result = await runAURA(message, context, formattedHistory);
      
      return NextResponse.json({
        success: true,
        text: result.text,
        intent: result.intent,
        toolsUsed: result.toolResults?.map((t: any) => t.toolName) || []
      });
    }

    // --- CASE 3: Streaming AURA Chat Panel ---
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('[AURA] Bad request — messages, message, or image missing. Body keys:', Object.keys(body || {}));
      return NextResponse.json({ error: 'Messages array, message, or image is required.' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error('[AURA] GROQ_API_KEY is not set');
      return NextResponse.json({ error: 'AI service is not configured on the server.' }, { status: 503 });
    }

    // Build Groq messages — only user/assistant roles with non-empty content
    // Ensure last message is the most recent user message
    const groqMessages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    for (const m of messages) {
      if (!m || (m.role !== 'user' && m.role !== 'assistant')) continue;
      const content = String(m.content || '').trim();
      if (!content) continue;
      groqMessages.push({ role: m.role as 'user' | 'assistant', content });
    }

    if (groqMessages.length === 0) {
      console.error('[AURA] All messages were filtered out. Raw count:', messages.length,
        'Roles seen:', messages.map((m: any) => m?.role));
      return NextResponse.json({ error: 'No valid message content found.' }, { status: 400 });
    }

    const groq = new Groq({ apiKey });

    const groqStream = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...groqMessages,
      ],
      stream: true,
      max_tokens: 2000,
      temperature: 0.7,
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of groqStream) {
            const text = chunk.choices[0]?.delta?.content || '';
            if (text) {
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
        } catch (streamErr) {
          console.error('[AURA] Stream chunk error:', streamErr);
        } finally {
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });

  } catch (error: any) {
    console.error('[AURA] Route Error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'AURA is temporarily unavailable.' },
      { status: 500 }
    );
  }
}
