import { CentralWorldStore } from './world-state';
import { HealthWorldMapper } from './health-world-mapper';
import { EventEngine } from './event-engine';

export class WorldEngine {
  static syncWithHealth(
    recoveryScore: number,
    stressLevel: number,
    hydrationLevel: number,
    sleepHours: number
  ) {
    // 1. Map biometrics to world variables
    const mapped = HealthWorldMapper.mapBiometricsToWorld(
      recoveryScore,
      stressLevel,
      hydrationLevel,
      sleepHours
    );

    // 2. Fetch special events
    const state = CentralWorldStore.getState();
    const activeEvents = EventEngine.getActiveEvents({ ...state, ...mapped });

    // 3. Update central reactive store
    CentralWorldStore.updateState({
      ...mapped,
      activeEvents
    });
  }
}
