import { ProviderRegistry } from './provider-registry';
import { CircuitBreaker } from './circuit-breaker';
import { HealthMonitor } from './health-monitor';
import { AIRequest } from '@/lib/ai/client';

export class ProviderRouter {
  static async route(request: AIRequest, queryContext: 'medical' | 'summarization' | 'general' = 'general'): Promise<Response> {
    const providers = ProviderRegistry.getHealthyProviders(queryContext);
    
    if (providers.length === 0) {
      throw new Error("No healthy cloud providers available");
    }

    const errors: string[] = [];

    for (const provider of providers) {
      const controller = new AbortController();
      // Enforce 8-second provider connection/TTFB timeout
      const timeoutId = setTimeout(() => controller.abort(), 8000); 

      const startMs = Date.now();
      try {
        const response = await provider.generate(request, controller);
        
        // If HTTP 5xx or 429, throw so we circuit break and retry next
        if (!response.ok) {
          throw new Error(`Provider HTTP ${response.status}`);
        }

        clearTimeout(timeoutId);
        CircuitBreaker.recordSuccess(provider.id);
        HealthMonitor.recordMetric(provider.id, Date.now() - startMs, true);
        
        // We inject the provider ID in headers to let the Orchestrator know who won
        response.headers.set('X-Aura-Provider-Id', provider.id);
        return response;

      } catch (err: any) {
        clearTimeout(timeoutId);
        
        // Record failure against this provider
        CircuitBreaker.recordFailure(provider.id);
        HealthMonitor.recordMetric(provider.id, Date.now() - startMs, false);
        
        errors.push(`[${provider.id}] ${err.name === 'AbortError' ? 'Timeout (8s)' : err.message}`);
        console.warn(`[ProviderRouter] ${provider.id} failed. Attempting next... Reason:`, err.message);
      }
    }

    // All registered providers failed this request
    throw new Error(`All providers failed: ${errors.join(' | ')}`);
  }
}
