import { prisma } from '@/lib/prisma';
import { SecurityPipeline } from './security';
import { EnterpriseMemory } from './memory';
import { CacheLayer } from './cache';
import { ProviderRouter } from './provider-router';
import { Tracing } from './tracing';
import { AIRequest } from '@/lib/ai/client';

export class AuraOrchestrator {
  /**
   * Main entrypoint for a fully validated request.
   */
  static async execute(params: {
    userId: string;
    conversationId?: string;
    message: string;
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
    contextType: 'medical' | 'summarization' | 'general';
  }): Promise<Response> {
    const traceCtx = Tracing.createTraceContext(params.userId, params.conversationId);
    
    // 1. Security Check
    if (!SecurityPipeline.validateInput(params.message)) {
      throw new Error("Security check failed on input.");
    }
    const sanitizedInput = SecurityPipeline.sanitizePII(params.message);

    // 2. Guaranteed DB Persistence (User Message)
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

    // 3. Cache Layer Check
    const cachedResponse = await CacheLayer.getResponse(sanitizedInput);
    if (cachedResponse) {
      console.log(`[Orchestrator] Cache hit for trace ${traceCtx.traceId}`);
      Tracing.logMetrics({
        ctx: traceCtx,
        providerId: 'cache',
        requestType: 'semantic_hit',
        latencyMs: 0,
        promptTokens: 0,
        completionTokens: 0,
        success: true
      });
      
      // Simulate streaming the cached response
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(cachedResponse));
          controller.close();
        }
      });
      return new Response(stream, { headers: { 'X-Conversation-Id': convId } });
    }

    // 4. Memory Context Injection
    const memoryContext = await EnterpriseMemory.getContextForPrompt(params.userId, sanitizedInput);
    const systemPrompt = `You are Aura, GAMA's elite health intelligence layer. 
${memoryContext}
Always respond thoughtfully, accurately, and safely.`;

    const orchestratorMessages = [
      { role: 'system', content: systemPrompt },
      ...params.messages,
      { role: 'user', content: sanitizedInput }
    ];

    const aiRequest: AIRequest = {
      messages: orchestratorMessages,
      temperature: 0.2
    };

    // 5. Provider Router execution
    const startMs = Date.now();
    try {
      const response = await ProviderRouter.route(aiRequest, params.contextType);
      
      const providerId = response.headers.get('X-Aura-Provider-Id') || 'unknown';
      
      // 6. Streaming Interception & Persistence
      const stream = this.createPersistentStream(response.body, convId, traceCtx, providerId, startMs);
      
      const headers = new Headers(response.headers);
      headers.set('X-Conversation-Id', convId);
      
      return new Response(stream, { headers });

    } catch (error: any) {
      // 7. Offline / Complete Failure Mode
      console.error(`[Orchestrator] ALL CLOUD PROVIDERS FAILED. Entering offline mode.`, error);
      
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

      const offlineResponse = "I'm currently unable to access cloud reasoning. However, based on your local history, I am still here to assist you with previous recommendations.";
      const encoder = new TextEncoder();
      const s = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(offlineResponse));
          controller.close();
        }
      });
      return new Response(s, { headers: { 'X-Conversation-Id': convId } });
    }
  }

  /**
   * Intercepts the ReadableStream, chunks it to the client in real-time, 
   * and saves the final accumulated string to the DB.
   */
  private static createPersistentStream(
    body: ReadableStream<Uint8Array> | null, 
    conversationId: string, 
    traceCtx: any,
    providerId: string,
    startMs: number
  ): ReadableStream {
    if (!body) throw new Error("No body to stream");
    
    let accumulatedResponse = '';
    const reader = body.getReader();
    const encoder = new TextEncoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // We pass the raw chunks straight back to the client
            controller.enqueue(value);
            
            // We also decode to accumulate the full string for DB saving
            const chunkText = new TextDecoder().decode(value, { stream: true });
            accumulatedResponse += chunkText;
          }
          controller.close();

          // Stream finished: persist to DB
          await prisma.aIMessage.create({
            data: {
              conversationId,
              role: 'assistant',
              content: SecurityPipeline.validateOutput(accumulatedResponse)
            }
          });

          // Log Success Metric
          Tracing.logMetrics({
            ctx: traceCtx,
            providerId,
            requestType: 'stream_success',
            latencyMs: Date.now() - startMs,
            promptTokens: 0, // In production, count tokens via tokenizer
            completionTokens: Math.ceil(accumulatedResponse.length / 4), 
            success: true
          });

        } catch (err: any) {
          console.error('[Orchestrator] Stream interrupted:', err);
          
          // Even if stream breaks, save what we successfully generated so far
          if (accumulatedResponse.length > 0) {
            await prisma.aIMessage.create({
              data: {
                conversationId,
                role: 'assistant',
                content: accumulatedResponse + "\n\n*[Connection Interrupted]*"
              }
            });
          }
          controller.error(err);
        }
      }
    });
  }
}
