import { WorldState } from './world-state';

export class AudioEngine {
  private static tracks: Record<string, string> = {
    CAMPFIRE: 'https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav', // fire crackle
    BIRDS: 'https://assets.mixkit.co/active_storage/sfx/2438/2438-84.wav', // bird chirp
    RAIN: 'https://assets.mixkit.co/active_storage/sfx/2439/2439-84.wav', // soft rain
    CRICKETS: 'https://assets.mixkit.co/active_storage/sfx/2440/2440-84.wav' // night insect loop
  };

  static getAmbientTracks(state: WorldState): string[] {
    const list: string[] = [];

    if (state.isMuted) return list;

    if (state.fireStrength !== 'OFF') {
      list.push(this.tracks.CAMPFIRE);
    }

    if (state.weather === 'RAINY' || state.weather === 'STORMY') {
      list.push(this.tracks.RAIN);
    } else if (state.dayCycle === 'MORNING' || state.dayCycle === 'AFTERNOON') {
      list.push(this.tracks.BIRDS);
    } else {
      list.push(this.tracks.CRICKETS);
    }

    return list;
  }
}
