import { IProvider } from '../client';
import { HealthMonitor } from './health-monitor';
import { CircuitBreaker } from './circuit-breaker';

export class ProviderRegistry {
  private static providers: Map<string, IProvider> = new Map();

  static register(provider: IProvider) {
    this.providers.set(provider.id, provider);
    HealthMonitor.initProvider(provider.id);
  }

  static getProvider(id: string): IProvider | undefined {
    return this.providers.get(id);
  }

  static getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Retrieves all healthy providers, ordered dynamically by their composite score.
   * If a specific context is provided, weights can be adjusted.
   */
  static getHealthyProviders(queryContext: 'medical' | 'summarization' | 'vision' | 'general'): IProvider[] {
    const available = Array.from(this.providers.values()).filter(p => {
      const health = HealthMonitor.getHealth(p.id);
      if (!health || !health.isAvailable) return false;
      if (!CircuitBreaker.isAvailable(p.id)) return false;
      return true;
    });

    return available.sort((a, b) => {
      const scoreA = HealthMonitor.getHealth(a.id)?.score || 0;
      const scoreB = HealthMonitor.getHealth(b.id)?.score || 0;
      
      let weightA = scoreA;
      let weightB = scoreB;

      // Adjust weights based on request classification
      if (queryContext === 'medical') {
        weightA += a.capabilities.isPremium ? 50 : 0;
        weightB += b.capabilities.isPremium ? 50 : 0;
      } else if (queryContext === 'summarization') {
        weightA += (1 / a.capabilities.costPer1kTokens) * 10;
        weightB += (1 / b.capabilities.costPer1kTokens) * 10;
      } else if (queryContext === 'vision') {
        // Mock checking if provider supports vision based on ID for now
        const aVision = ['openai', 'anthropic', 'gemini'].includes(a.id);
        const bVision = ['openai', 'anthropic', 'gemini'].includes(b.id);
        if (aVision && !bVision) return -1;
        if (!aVision && bVision) return 1;
      }

      return weightB - weightA; // Descending (highest score first)
    });
  }
}
