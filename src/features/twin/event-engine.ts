import { WorldState } from './world-state';

export class EventEngine {
  static getActiveEvents(state: WorldState): string[] {
    const events: string[] = [];
    const date = new Date();

    // Full Moon (simulated check on date)
    if (date.getDate() === 15) {
      events.push('FULL_MOON');
    }

    // Meteor shower on high recovery
    if (state.recoveryScore >= 95) {
      events.push('METEOR_SHOWER');
    }

    // Aurora Night on low stress & high recovery during evening/night
    if (state.recoveryScore > 88 && state.stressLevel < 3 && (state.dayCycle === 'NIGHT' || state.dayCycle === 'MIDNIGHT')) {
      events.push('AURORA_NIGHT');
    }

    // Bloom Festival in Spring
    if (state.season === 'SPRING' && state.recoveryScore > 75) {
      events.push('BLOOM_FESTIVAL');
    }

    return events;
  }
}
