import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { AURAOrchestrator } from '@/features/aura/orchestrator';
import { generatePremiumSpeech } from '@/lib/ai/tts-provider';

export const maxDuration = 60;

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

    const { message, history, sessionId } = body;
    if (!message) {
      return NextResponse.json({ error: 'Message transcript is required.' }, { status: 400 });
    }

    // 1. Session Manager - active session tracking
    let session = null;
    if (sessionId) {
      session = await prisma.voiceSession.findUnique({ where: { id: sessionId } });
    }
    if (!session) {
      session = await prisma.voiceSession.create({
        data: {
          profileId: user.id,
          status: 'ACTIVE'
        }
      });
    }

    // 2. Process voice command via Central Orchestrator
    const result = await AURAOrchestrator.processVoiceRequest(user.id, message, history || []);

    // 3. Generate premium audio if speech keys are present
    let premiumAudio = null;
    if (result.message) {
      premiumAudio = await generatePremiumSpeech(result.message);
    }

    // 4. Save Voice transcript & audit logs asynchronously
    const transcript = await prisma.voiceTranscript.create({
      data: {
        sessionId: session.id,
        profileId: user.id,
        queryText: message,
        replyText: result.message || ''
      }
    });

    if (result.explainability) {
      await prisma.aIReasoning.create({
        data: {
          sessionId: session.id,
          profileId: user.id,
          queryText: message,
          recommendation: result.message || '',
          evidence: result.explainability.evidence,
          confidence: result.explainability.confidence,
          reasoning: result.explainability.reasoning,
          sources: result.explainability.sources
        }
      });
    }

    if (result.tool && result.tool.name !== 'none') {
      await prisma.toolInvocation.create({
        data: {
          sessionId: session.id,
          profileId: user.id,
          toolName: result.tool.name,
          actionType: result.tool.actionType,
          parameters: result.tool.parameter || {}
        }
      });
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      message: result.message || 'Processed.',
      caption: result.caption || result.message || 'Processed.',
      tool: result.tool,
      visual: result.visual || { enabled: false },
      premiumAudio: premiumAudio,
      modelUsed: result.modelUsed || 'llama-3.3-70b-versatile',
      explainability: result.explainability
    });

  } catch (error: any) {
    console.error('[AURA v1 Voice API Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
