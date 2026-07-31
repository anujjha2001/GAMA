import { AI_CONFIG } from '@/lib/ai/config';
import { HealthMonitor } from './health-monitor';
import { CircuitBreaker } from './circuit-breaker';
import { AIRequest, AIResponse } from '@/lib/ai/client';

export interface ProviderCapabilities {
  name: string;
  isPremium: boolean;
  contextWindow: number;
  costPer1kTokens: number;
  averageLatencyMs: number;
}

export interface IProvider {
  id: string;
  capabilities: ProviderCapabilities;
  generate(request: AIRequest, controller: AbortController): Promise<Response>;
}

export class ProviderRegistry {
  private static providers: IProvider[] = [];

  static register(provider: IProvider) {
    this.providers.push(provider);
    HealthMonitor.initProvider(provider.id);
  }

  static getHealthyProviders(queryContext: 'medical' | 'summarization' | 'general'): IProvider[] {
    const healthy = this.providers.filter(p => 
      HealthMonitor.getHealth(p.id)?.isAvailable !== false &&
      CircuitBreaker.isAvailable(p.id)
    );

    // Cost-aware routing
    if (queryContext === 'medical') {
      // Prioritize premium models first, then fall back to anything else
      return healthy.sort((a, b) => (b.capabilities.isPremium ? 1 : 0) - (a.capabilities.isPremium ? 1 : 0));
    } else if (queryContext === 'summarization') {
      // Prioritize cheapest models first
      return healthy.sort((a, b) => a.capabilities.costPer1kTokens - b.capabilities.costPer1kTokens);
    }
    
    // Default priority: lowest latency
    return healthy.sort((a, b) => a.capabilities.averageLatencyMs - b.capabilities.averageLatencyMs);
  }
}
