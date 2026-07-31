import { prisma } from '@/lib/prisma';
import { PromptGuard } from './prompt-guard';
import { ContextBuilder } from './memory';
import { TokenBudgetManager } from './token-budget';
import { ProviderRouter } from './provider-router';
import { StreamingEngine } from './streaming-engine';
import { Tracing } from './tracing';
import { AIRequest } from '../client';

export class AuraOrchestrator {
  static async execute(params: {
    userId: string;
    conversationId?: string;
    message: string;
    messages: { role: 'user' | 'assistant' | 'system'; content: string | any[] }[];
    contextType: 'medical' | 'summarization' | 'general' | 'vision';
  }): Promise<Response> {
    const traceCtx = Tracing.createTraceContext(params.userId, params.conversationId);
    const startMs = Date.now();

    try {
      // 1. Safety & Validation
      const sanitizedInput = PromptGuard.validate(params.message);

      // 2. Transactional Database Persistence (User Message)
      let convId = params.conversationId;
      if (!convId) {
        const conv = await prisma.aIConversation.create({
          data: {
            profileId: params.userId,
            agentType: 'AURA',
            title: sanitizedInput.slice(0, 30)
          }
        });
        convId = conv.id;
        traceCtx.conversationId = convId;
      }

      await prisma.aIMessage.create({
        data: {
          conversationId: convId,
          role: 'user',
          content: sanitizedInput
        }
      });

      // 3. Token Budgeting & Compression
      const maxBudget = 60000; // Leave room for response and context
      const compressedHistory = TokenBudgetManager.compressHistory(params.messages, maxBudget);

      // 4. Memory & Context Building
      const systemPrompt = await ContextBuilder.buildSystemPrompt(params.userId, sanitizedInput);

      const orchestratorMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...compressedHistory
      ];

      const aiRequest: AIRequest = {
        messages: orchestratorMessages,
        temperature: 0.2,
        stream: true
      };

      // 5. Provider Routing (Circuit Breakers, Retries, Failovers happen here)
      const response = await ProviderRouter.route(aiRequest, params.contextType);
      
      const providerId = response.headers.get('X-Aura-Provider-Id') || 'unknown';
      
      // 6. Streaming Interception & Persistence
      const stream = StreamingEngine.createPersistentStream(response.body, convId, traceCtx, providerId, startMs);
      
      const headers = new Headers(response.headers);
      headers.set('X-Conversation-Id', convId);
      
      return new Response(stream, { headers });

    } catch (error: any) {
      // 7. Graceful Disaster Recovery / Offline Mode
      console.error(`[Orchestrator] ALL CLOUD PROVIDERS FAILED OR PIPELINE BROKE. Entering offline mode.`, error);
      
      Tracing.logMetrics({
        ctx: traceCtx,
        providerId: 'all_failed',
        requestType: 'failover_offline',
        latencyMs: Date.now() - startMs,
        promptTokens: 0,
        completionTokens: 0,
        success: false,
        failureReason: error.message
      });

      const offlineResponse = "Cloud intelligence is temporarily unavailable. I'm still able to help using your saved health data while cloud services recover.";
      
      // Ensure we have a conversationId to send back even if it failed before DB insert
      const fallbackConvId = traceCtx.conversationId || 'offline_fallback';

      const encoder = new TextEncoder();
      const s = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(offlineResponse));
          controller.close();
        }
      });
      return new Response(s, { headers: { 'X-Conversation-Id': fallbackConvId, 'Content-Type': 'text/plain' } });
    }
  }
}
