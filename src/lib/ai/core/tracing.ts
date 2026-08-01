import { prisma } from '@/lib/prisma';

export class Tracing {
  /**
   * Generates a context object with Trace ID and Correlation ID
   */
  static createTraceContext(userId: string, conversationId?: string) {
    return {
      traceId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      userId,
      conversationId
    };
  }

  /**
   * Logs observability metrics as Structured JSON (for Grafana/Datadog)
   * and optionally persists critical metrics to the Database.
   */
  static async logMetrics(params: {
    ctx: any;
    providerId: string;
    requestType: string;
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    success: boolean;
    failureReason?: string;
  }) {
    
    const logPayload = {
      timestamp: new Date().toISOString(),
      traceId: params.ctx.traceId,
      correlationId: params.ctx.correlationId,
      userId: params.ctx.userId,
      conversationId: params.ctx.conversationId,
      providerId: params.providerId,
      requestType: params.requestType,
      latencyMs: params.latencyMs,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      success: params.success,
      failureReason: params.failureReason
    };

    // Output strictly as JSON for external log aggregators (no console.log string interpolation)
    console.log(JSON.stringify(logPayload));

    // Persist to DB for the internal Admin Console / Live Dashboard
    try {
      await prisma.aIAuditLog.create({
        data: {
          profileId: params.ctx.userId,
          action: params.requestType,
          prompt: `[${params.providerId}] Trace: ${params.ctx.traceId}`,
          model: params.providerId,
          response: params.success ? 'SUCCESS' : `FAILURE: ${params.failureReason}`,
          latencyMs: params.latencyMs,
          tokensUsed: params.promptTokens + params.completionTokens
        }
      });
    } catch (e: any) {
      // Never fail the main request due to observability failure
      console.error(JSON.stringify({
        event: 'observability_persist_error',
        error: e.message
      }));
    }
  }
}
