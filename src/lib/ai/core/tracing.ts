import { prisma } from '@/lib/prisma';

export interface TraceContext {
  traceId: string;
  correlationId: string;
  conversationId?: string;
  userId?: string;
}

export class Tracing {
  static createTraceContext(userId?: string, conversationId?: string): TraceContext {
    return {
      traceId: crypto.randomUUID(),
      correlationId: crypto.randomUUID(),
      conversationId,
      userId
    };
  }

  static async logMetrics(params: {
    ctx: TraceContext;
    providerId: string;
    requestType: string;
    latencyMs: number;
    promptTokens: number;
    completionTokens: number;
    cost?: number;
    success: boolean;
    failureReason?: string;
  }) {
    // 1. Structured log for Datadog / Logstash
    console.log(JSON.stringify({
      event: 'aura_request',
      ...params.ctx,
      providerId: params.providerId,
      requestType: params.requestType,
      latencyMs: params.latencyMs,
      promptTokens: params.promptTokens,
      completionTokens: params.completionTokens,
      cost: params.cost,
      success: params.success,
      failureReason: params.failureReason
    }));

    // 2. Persist in Database (fire and forget)
    if (params.ctx.userId) {
      prisma.observabilityLog.create({
        data: {
          profileId: params.ctx.userId,
          traceId: params.ctx.traceId,
          correlationId: params.ctx.correlationId,
          conversationId: params.ctx.conversationId,
          providerId: params.providerId,
          requestType: params.requestType,
          latencyMs: params.latencyMs,
          promptTokens: params.promptTokens,
          completionTokens: params.completionTokens,
          cost: params.cost,
          success: params.success,
          failureReason: params.failureReason
        }
      }).catch((err: any) => {
        console.error('[Tracing] Failed to persist ObservabilityLog:', err);
      });
    }
  }
}
