export interface ProviderHealth {
  isAvailable: boolean;
  averageLatencyMs: number;
  successRate: number;
  totalRequests: number;
  failedRequests: number;
  lastSuccessfulRequest?: number;
}

export class HealthMonitor {
  private static metrics: Record<string, ProviderHealth> = {};

  static initProvider(providerId: string) {
    if (!this.metrics[providerId]) {
      this.metrics[providerId] = {
        isAvailable: true,
        averageLatencyMs: 0,
        successRate: 1.0,
        totalRequests: 0,
        failedRequests: 0,
      };
    }
  }

  static recordMetric(providerId: string, latencyMs: number, success: boolean) {
    this.initProvider(providerId);
    const m = this.metrics[providerId];
    
    m.totalRequests++;
    if (!success) {
      m.failedRequests++;
    } else {
      m.lastSuccessfulRequest = Date.now();
      // Moving average for latency (last 10% weight)
      m.averageLatencyMs = m.averageLatencyMs === 0 
        ? latencyMs 
        : (m.averageLatencyMs * 0.9) + (latencyMs * 0.1);
    }

    m.successRate = (m.totalRequests - m.failedRequests) / m.totalRequests;
    
    // Automatically mark unhealthy if success rate drops below 50% after at least 5 requests
    if (m.totalRequests > 5 && m.successRate < 0.5) {
      m.isAvailable = false;
      console.warn(`[HealthMonitor] ${providerId} success rate dropped to ${(m.successRate*100).toFixed(1)}%. Marking unhealthy.`);
    } else {
      m.isAvailable = true;
    }
  }

  static getHealth(providerId: string): ProviderHealth | null {
    return this.metrics[providerId] || null;
  }
}
