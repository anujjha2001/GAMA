import { ProviderRegistry } from './provider-registry';
import { CircuitBreaker } from './circuit-breaker';
import { HealthMonitor } from './health-monitor';
import { RetryEngine } from './retry';
import { AIRequest } from '@/lib/ai/client';
import { AI_CONFIG } from '../config';

export class ProviderRouter {
  static async route(request: AIRequest, queryContext: 'medical' | 'summarization' | 'vision' | 'general' = 'general'): Promise<Response> {
    // Dynamically initialize providers to support paths (like voice API) that bypass the main gateway
    try {
      const { AIGateway } = await import('./gateway');
      await AIGateway.initProviders();
    } catch (e) {
      console.error('[ProviderRouter] Dynamic provider initialization failed:', e);
    }

    const providers = ProviderRegistry.getHealthyProviders(queryContext);
    
    if (providers.length === 0) {
      console.error('[ProviderRouter] No healthy providers found. Check API keys and health monitoring.');
      // Return a generic error response instead of throwing to avoid crashing the routing pool
      return new Response(JSON.stringify({ success: false, error: 'No AI providers are currently available. Please check configuration.' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const errors: string[] = [];

    for (const provider of providers) {
      try {
        // Validate request payload before attempting generation
        if (!request || !Array.isArray(request.messages) || request.messages.length === 0) {
          console.warn('[ProviderRouter] Invalid request payload, missing messages.');
          return new Response(JSON.stringify({ success: false, error: 'Invalid request payload: messages required.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const response = await RetryEngine.execute(async () => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs); 

          const startMs = Date.now();
          try {
            const res = await provider.generate(request, controller);
            clearTimeout(timeoutId);
            
            CircuitBreaker.recordSuccess(provider.id);
            HealthMonitor.recordMetric(provider.id, Date.now() - startMs, true);
            
            // Inject the provider ID in headers for the Streaming Engine and Observability
            res.headers.set('X-Aura-Provider-Id', provider.id);
            return res;

          } catch (err: any) {
            // Log detailed error including provider ID and message
            console.error(`[ProviderRouter] Provider ${provider.id} failed:`, err);
            
            clearTimeout(timeoutId);
            const isTimeout = err.name === 'AbortError' || err.message.includes('timeout');
            
            // Record failure (this helps CircuitBreaker and HealthMonitor degrade the score)
            CircuitBreaker.recordFailure(provider.id);
            HealthMonitor.recordMetric(provider.id, Date.now() - startMs, false);
            
            // Throw so RetryEngine handles it
            throw new Error(`[${provider.id}] ${isTimeout ? 'Timeout' : err.message}`);
          }
        }, AI_CONFIG.maxRetries);

        // If RetryEngine succeeds, we return immediately
        return response;
        
      } catch (err: any) {
        // RetryEngine exhausted for this specific provider, or it threw a non-retryable error
        errors.push(err.message);
        console.warn(`[ProviderRouter] ${provider.id} exhausted. Falling back to next... Reason:`, err.message);
        // Continue to the next provider in the `providers` array
      }
    }

    // All registered providers failed this request
    throw new Error(`All providers failed: ${errors.join(' | ')}`);
  }
}
