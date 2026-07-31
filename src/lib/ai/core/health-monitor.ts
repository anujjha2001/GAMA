export interface ProviderHealth {
  id: string;
  isAvailable: boolean;
  successRate: number; // 0 to 1
  latencyAverageMs: number;
  lastPingMs: number;
  totalRequests: number;
  totalFailures: number;
  score: number;
}

export class HealthMonitor {
  private static healthData: Map<string, ProviderHealth> = new Map();

  static initProvider(id: string) {
    if (!this.healthData.has(id)) {
      this.healthData.set(id, {
        id,
        isAvailable: true,
        successRate: 1.0,
        latencyAverageMs: 1500, // starting guess
        lastPingMs: Date.now(),
        totalRequests: 0,
        totalFailures: 0,
        score: 100 // starting score
      });
    }
  }

  static getHealth(id: string): ProviderHealth | undefined {
    return this.healthData.get(id);
  }

  static markUnavailable(id: string, reason: string) {
    const data = this.healthData.get(id);
    if (data) {
      data.isAvailable = false;
      this.recalculateScore(id);
      console.warn(`[HealthMonitor] Provider ${id} marked UNAVAILABLE: ${reason}`);
    }
  }

  static markAvailable(id: string) {
    const data = this.healthData.get(id);
    if (data) {
      data.isAvailable = true;
      this.recalculateScore(id);
      console.log(`[HealthMonitor] Provider ${id} marked AVAILABLE`);
    }
  }

  static recordMetric(id: string, latencyMs: number, success: boolean) {
    const data = this.healthData.get(id);
    if (!data) return;

    data.totalRequests++;
    if (!success) {
      data.totalFailures++;
    } else {
      // Exponential moving average for latency
      data.latencyAverageMs = (data.latencyAverageMs * 0.7) + (latencyMs * 0.3);
    }

    data.successRate = (data.totalRequests - data.totalFailures) / data.totalRequests;
    this.recalculateScore(id);
  }

  /**
   * Generates a composite score. Higher is better.
   * Formula factors:
   * - Success rate (huge weight)
   * - Latency (lower latency = higher score)
   */
  private static recalculateScore(id: string) {
    const data = this.healthData.get(id);
    if (!data) return;

    if (!data.isAvailable) {
      data.score = 0;
      return;
    }

    // Base score 100
    // Penalize for poor success rate heavily (e.g. 0.99 = -10, 0.90 = -100)
    const successPenalty = (1 - data.successRate) * 1000;
    
    // Reward for fast latency (e.g. 500ms -> +50, 2000ms -> -20)
    const latencyBonus = (1500 - data.latencyAverageMs) / 20;

    data.score = Math.max(0, Math.min(100, 100 - successPenalty + latencyBonus));
  }

  // A background job could call this every 60s
  static async pingProviders() {
    // In a real distributed system, we would ping the API endpoint.
    // For this implementation, we will rely on active requests + circuit breaker.
  }
}
