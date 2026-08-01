import { prisma } from '@/lib/prisma';
import { Tracing } from './tracing';

export class StreamingEngine {
  /**
   * Intercepts the Provider stream, chunks it to the client,
   * handles disconnects gracefully, and saves to the DB.
   */
  static createPersistentStream(
    body: ReadableStream<Uint8Array> | null, 
    conversationId: string, 
    traceCtx: any,
    providerId: string,
    startMs: number
  ): ReadableStream {
    if (!body) throw new Error("No body to stream");
    
    let accumulatedResponse = '';
    const reader = body.getReader();
    const decoder = new TextDecoder();

    return new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            controller.enqueue(value);
            accumulatedResponse += decoder.decode(value, { stream: true });
          }
          controller.close();

          // Fully successful stream
          await prisma.aIMessage.create({
            data: {
              conversationId,
              role: 'assistant',
              content: accumulatedResponse,
              provider: providerId
            }
          });

          Tracing.logMetrics({
            ctx: traceCtx,
            providerId,
            requestType: 'stream_success',
            latencyMs: Date.now() - startMs,
            promptTokens: 0, 
            completionTokens: Math.ceil(accumulatedResponse.length / 4), 
            success: true
          });

        } catch (err: any) {
          console.error('[StreamingEngine] Stream interrupted:', err);
          
          // Stream interrupted gracefully
          const errorMessage = "\n\n*[Connection interrupted. Please hit 'Continue Generation' to resume.]*";
          accumulatedResponse += errorMessage;
          
          controller.enqueue(new TextEncoder().encode(errorMessage));
          controller.close();

          await prisma.aIMessage.create({
            data: {
              conversationId,
              role: 'assistant',
              content: accumulatedResponse,
              provider: providerId
            }
          });

          Tracing.logMetrics({
            ctx: traceCtx,
            providerId,
            requestType: 'stream_interrupted',
            latencyMs: Date.now() - startMs,
            promptTokens: 0,
            completionTokens: Math.ceil(accumulatedResponse.length / 4), 
            success: false,
            failureReason: err.message
          });
        }
      }
    });
  }
}
