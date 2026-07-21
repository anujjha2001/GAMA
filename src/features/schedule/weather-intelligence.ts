export interface WeatherContext {
  tempC: number;
  feelsLikeC: number;
  humidity: number;
  windSpeedKph: number;
  rainProb: number;
  uvIndex: number;
  aqi: number;
  pollenLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export class WeatherIntelligenceEngine {
  private static cachedContext: WeatherContext | null = null;

  static async getLiveContext(lat?: number, lon?: number): Promise<WeatherContext> {
    if (this.cachedContext) return this.cachedContext;

    // Simulate weather service integration (or fetch open weather mapping)
    // Return typical hot-humid day context for dynamic optimization demo
    this.cachedContext = {
      tempC: 38,
      feelsLikeC: 41,
      humidity: 82,
      windSpeedKph: 12,
      rainProb: 15,
      uvIndex: 10,
      aqi: 162, // Poor
      pollenLevel: 'HIGH'
    };
    return this.cachedContext;
  }

  static calculateHydrationGoal(baseMl: number, context: WeatherContext, workoutScheduled: boolean): number {
    let target = baseMl;

    // Add extra water for hot temperature (> 30C)
    if (context.tempC > 30) {
      target += 500;
    }
    // High humidity sweat adjustment
    if (context.humidity > 70) {
      target += 400;
    }
    // Add extra for workout
    if (workoutScheduled) {
      target += 800;
    }

    return target;
  }

  static getRecommendations(context: WeatherContext): string[] {
    const recs: string[] = [];

    if (context.aqi > 150) {
      recs.push('Air quality is POOR. Shift outdoor exercises to indoor cardio/treadmills.');
    }
    if (context.uvIndex >= 8) {
      recs.push('UV index is high. Wear sunscreen (SPF 50+) or avoid direct sun exposure between 10am and 4pm.');
    }
    if (context.tempC > 35) {
      recs.push('Extreme heat detected. Increase sodium and potassium intake to prevent dehydration.');
    }
    if (context.pollenLevel === 'HIGH') {
      recs.push('High pollen count. Close windows, use an air purifier, and consider indoor focus blocks.');
    }

    return recs;
  }
}
