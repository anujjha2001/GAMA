import { WorldState } from './world-state';
import { HealthWorldMapper } from './health-world-mapper';

export class WorldTimeline {
  static getHistoricalState(dateString: string): Partial<WorldState> {
    // Reconstruct world factors matching biometric logs on specific date
    const d = new Date(dateString);
    const daySeed = d.getDate() + d.getMonth();

    // Deterministic simulation properties derived from date seed
    const recovery = 45 + (daySeed % 50); // range 45-95
    const stress = 1 + (daySeed % 8); // range 1-8
    const hydration = 50 + (daySeed % 45); // range 50-95
    const sleep = 5.5 + (daySeed % 4); // range 5.5-9.5

    return HealthWorldMapper.mapBiometricsToWorld(recovery, stress, hydration, sleep);
  }
}
