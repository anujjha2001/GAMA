import { ProviderRouter } from './core/provider-router';
import { AIRequest } from './client';

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  provider: string;
  model: string;
}

/**
 * Legacy AI Orchestrator adapter for standard monolithic endpoints.
 * It routes requests through the new Enterprise ProviderRouter, accumulates the
 * stream, and returns a standard AIResponse to maintain backwards compatibility.
 */
export class AIOrchestrator {
  static async generate(request: AIRequest): Promise<AIResponse> {
    const startMs = Date.now();
    
    // We enforce streaming at the router level for consistency,
    // and just accumulate it here for legacy callers.
    request.stream = true;

    try {
      // 1. Send request through the Enterprise Router (Failover, Circuit Breaker, Retries included)
      const response = await ProviderRouter.route(request, 'general');
      
      const providerId = response.headers.get('X-Aura-Provider-Id') || 'unknown';

      // 2. Consume the stream fully
      if (!response.body) throw new Error("No response body from provider");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let content = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        content += decoder.decode(value, { stream: true });
      }

      const latency = Date.now() - startMs;
      
      // We estimate usage for legacy endpoints, as the exact usage requires parsing trailing SSE chunks
      const completionTokens = Math.ceil(content.length / 4);

      // Structured Logging
      console.log(JSON.stringify({
        event: 'legacy_ai_orchestrator_generate',
        provider: providerId,
        latencyMs: latency,
        promptTokens: 0,
        completionTokens,
        fallbackUsed: false, // The router handles this invisibly now
        success: true
      }));

      return {
        content,
        usage: {
          promptTokens: 0,
          completionTokens
        },
        provider: providerId,
        model: request.model || 'dynamic'
      };
      
    } catch (err: any) {
      console.error(`[Legacy AIOrchestrator] Fatal Error:`, err.message);
      throw new Error('AI Provider Temporarily Unavailable: ' + err.message);
    }
  }
}
