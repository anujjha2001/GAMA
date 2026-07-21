import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Groq } from 'groq-sdk';
import { searchRealImage } from '@/lib/ai/image-search';
import { generatePremiumSpeech } from '@/lib/ai/tts-provider';
import crypto from 'crypto';

export const maxDuration = 60;

const AURA_VOICE_SYSTEM_PROMPT = `You are AURA, the central AI health intelligence layer for GAMA.
You are communicating via a live hands-free voice interface. 

RESPONSE CONSTRAINTS:
1. Speak like a premium personal physician and coach — warm, professional, encouraging, and evidence-based.
2. Keep your spoken response ("message") short and natural — typically 1 to 3 sentences maximum. Avoid long bullet lists, complex markdown, or nested headings in the speech text.
3. You have access to user-specific biological logs, settings, preferences, and memory nodes. Always use this context first.
4. If the user asks you to open a page, view reports, look at their twin, or scan food, you MUST trigger the corresponding tool in the "tool" JSON field.
5. Respond with a valid JSON object matching the schema below. Do not wrap in markdown code blocks.

Available Tools to Trigger:
- "meal_guide": Use if the user wants to check recipes, planning, or is hungry.
- "food_scanner": Use if they want to scan a plate, fridge, take a picture of food, or start the scanner.
- "digital_twin": Use if they ask to see their body, muscles, avatar, or digital twin.
- "health_vault": Use if they want to view medical reports, upload files, or view lab documents.
- "insights": Use if they ask for trends, recovery logs, burnout warnings, or suggestions.
- "schedule": Use if they ask for their calendar, reminders, circadian rhythm, or workout schedules.
- "settings": Use if they want system settings or settings customization.
- "dashboard": Use if they want to go home, overview, or main dashboard.

JSON SCHEMA:
{
  "message": "Friendly, short speech response under 3 sentences.",
  "caption": "Subtitles caption (can match message exactly, stripped of markdown symbols).",
  "tool": {
    "name": "meal_guide" | "digital_twin" | "food_scanner" | "health_vault" | "insights" | "schedule" | "settings" | "dashboard" | "none",
    "actionType": "NAVIGATE" | "TRIGGER_SCANNER" | "NONE",
    "parameter": "route path or target payload"
  },
  "visual": {
    "enabled": boolean,
    "type": "real_image" | "medical_illustration" | "chart",
    "query": "search query for visual display (e.g. 'spinach', 'blood pressure chart')"
  }
}`;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { message, history, modelOverride } = body;
    if (!message) {
      return NextResponse.json({ error: 'Message transcript is required.' }, { status: 400 });
    }

    const emailNormalized = user.email.toLowerCase().trim();

    // 1. Fetch User Profile & Context (Memory Injection)
    const profile = await prisma.userProfile.findUnique({
      where: { id: user.id },
      include: {
        settings: true,
        preferences: true
      }
    });

    const latestDoc = await prisma.medicalDocument.findFirst({
      where: { userId: user.id, processingStatus: 'COMPLETED' },
      orderBy: { reportDate: 'desc' },
      include: { analysis: true }
    });

    const latestHealthRecord = await prisma.healthRecord.findFirst({
      where: { profileId: user.id },
      orderBy: { recordedAt: 'desc' }
    });

    const latestSleepLog = await prisma.sleepLog.findFirst({
      where: { profileId: user.id },
      orderBy: { recordedAt: 'desc' }
    });

    const todayMeals = await prisma.meal.findMany({
      where: {
        profileId: user.id,
        loggedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    });

    const longTermMemories = await prisma.longTermMemory.findMany({
      where: { profileId: user.id },
      take: 5
    });

    // 2. Format Context Payload
    let contextBlock = '\n\nUSER HEALTH CONTEXT:\n';
    contextBlock += `Name: ${profile?.fullName || user.fullName}\n`;
    if (latestHealthRecord) {
      contextBlock += `- Vitality Score: ${latestHealthRecord.vitalityScore}/100\n`;
      contextBlock += `- Heart Rate: ${latestHealthRecord.heartRate || 'N/A'} bpm, HRV: ${latestHealthRecord.hrv || 'N/A'} ms\n`;
      contextBlock += `- Stress Level: ${latestHealthRecord.stressLevel || 'N/A'}\n`;
      contextBlock += `- Water Intake: ${latestHealthRecord.waterIntakeMl || 0} ml\n`;
    }
    if (latestSleepLog) {
      contextBlock += `- Sleep Duration: ${latestSleepLog.durationHours} hrs, Quality Score: ${latestSleepLog.qualityScore}/100\n`;
    }
    if (todayMeals.length > 0) {
      const cals = todayMeals.reduce((acc, m) => acc + m.totalCals, 0);
      contextBlock += `- Today's Logged Meals: ${todayMeals.map(m => m.name).join(', ')} (Total: ${cals} kcal)\n`;
    }
    if (latestDoc && latestDoc.analysis) {
      contextBlock += `- Latest Medical Report: ${latestDoc.title} (Overall Score: ${latestDoc.analysis.overallHealthScore}/100, Risk: ${latestDoc.analysis.riskLevel})\n`;
    }
    if (longTermMemories.length > 0) {
      contextBlock += `- Key Biological Facts: ${longTermMemories.map(m => m.fact).join('; ')}\n`;
    }

    const systemPrompt = AURA_VOICE_SYSTEM_PROMPT + contextBlock;

    // 3. Model Router
    // Determine user intent complexity to route to best LLM
    let model = 'llama-3.1-8b-instant'; // Default fast model (AURA-v1)
    const complexKeywords = ['analyze', 'report', 'compare', 'prediction', 'why', 'explain', 'scientific', 'disease', 'symptom'];
    const isComplex = complexKeywords.some(kw => message.toLowerCase().includes(kw));

    if (modelOverride) {
      model = modelOverride;
    } else if (isComplex) {
      model = 'llama-3.3-70b-versatile'; // Deeper model (AURA-v2 / Thinking Bit fallback)
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI service not configured.' }, { status: 503 });
    }

    const groq = new Groq({ apiKey });

    // Process history context
    const groqMessages: any[] = [{ role: 'system', content: systemPrompt }];
    if (history && Array.isArray(history)) {
      for (const h of history.slice(-6)) { // Take last 6 turns
        groqMessages.push({ role: h.role, content: h.content });
      }
    }
    groqMessages.push({ role: 'user', content: message });

    // 4. Execute LLM Router
    const completion = await groq.chat.completions.create({
      model: model,
      messages: groqMessages,
      response_format: { type: 'json_object' },
      temperature: 0.3
    });

    const responseText = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(responseText);

    // Default tool structure if missing
    if (!result.tool) {
      result.tool = { name: 'none', actionType: 'NONE', parameter: '' };
    }

    // 5. Image search if visual is requested
    if (result.visual && result.visual.enabled && result.visual.query) {
      const img = await searchRealImage(result.visual.query);
      if (img) {
        result.visual.url = img.imageUrl;
      } else {
        result.visual.enabled = false;
      }
    }

    // 6. Generate premium audio if voice keys available (falls back to browser client-side if null)
    let premiumAudio = null;
    if (result.message) {
      premiumAudio = await generatePremiumSpeech(result.message);
    }

    // Log the transaction to AI history for audit
    try {
      await prisma.aIAuditLog.create({
        data: {
          profileId: user.id,
          action: `VoiceAssistant-${model}`,
          prompt: message,
          model: model,
          response: result.message || '',
          latencyMs: 100 // dummy
        }
      });
    } catch (auditErr) {
      console.warn('Failed to write audit log:', auditErr);
    }

    return NextResponse.json({
      success: true,
      message: result.message || 'I processed your request.',
      caption: result.caption || result.message || 'I processed your request.',
      tool: result.tool,
      visual: result.visual || { enabled: false },
      premiumAudio: premiumAudio, // Contains Base64 data URI if generated
      modelUsed: model
    });

  } catch (error: any) {
    console.error('[AURA Voice API Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
