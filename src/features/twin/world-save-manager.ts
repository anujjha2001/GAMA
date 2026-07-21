import { WorldState } from './world-state';

export class WorldSaveManager {
  static saveDailyState(state: WorldState) {
    if (typeof window === 'undefined') return;
    const dateStr = new Date().toISOString().split('T')[0];
    localStorage.setItem(`gama_world_state_${dateStr}`, JSON.stringify(state));
  }

  static getSavedState(dateStr: string): WorldState | null {
    if (typeof window === 'undefined') return null;
    const val = localStorage.getItem(`gama_world_state_${dateStr}`);
    return val ? JSON.parse(val) : null;
  }
}
