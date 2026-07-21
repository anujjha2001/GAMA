import { CentralWorldStore, WorldState } from './world-state';
import { toast } from 'sonner';

export class InteractionEngine {
  static handleHotspotClick(hotspotId: string, state: WorldState): { title: string; message: string; badge: string } {
    let title = '';
    let message = '';
    let badge = '';

    switch (hotspotId) {
      case 'CAMPFIRE':
        title = 'Recovery Fire';
        message = `Recovery Score is ${state.recoveryScore}%. Your campfire strength is ${state.fireStrength}. Sleep cycles and low resting heart rate are keeping your metabolic fire burning bright.`;
        badge = 'METABOLIC CORE';
        break;

      case 'TREE':
        title = 'Ecosystem Oak (Stress)';
        message = `Autonomic Stress Index is ${state.stressLevel}/10. The tree leaves rustle at ${5 + state.stressLevel * 4}km/h. Box breathing and target recovery blocks will restore tranquility.`;
        badge = 'AUTONOMIC SHIELD';
        break;

      case 'LAKE':
        title = 'Reflection Lake (Hydration)';
        message = `Hydration Level is ${state.hydrationLevel}%. The water flow is running at optimal cellular speed. Drink an additional 500ml post-exercise to maintain clarity.`;
        badge = 'FLUID SYNC';
        break;

      case 'STARS':
        title = 'Sleep Constellations';
        message = `Slept ${state.sleepHours} hours last night. Deep and REM sleep periods have successfully processed mental loads and cleared cognitive fatigue.`;
        badge = 'COGNITIVE SLEEP';
        break;

      case 'CHARACTER':
        title = 'Digital Twin Companion';
        message = `Your twin feels ${state.mood.replace('_', ' ')}. They respond directly to HRV, sleep quality, and daily focus targets. Keep up healthy behaviors to see them smile.`;
        badge = 'BIOMETRIC EQUILIBRIUM';
        break;

      case 'SKY':
      default:
        title = 'Ecosystem Atmosphere';
        message = `Atmospheric weather state is ${state.weather.replace('_', ' ')}. Current location indicates ${state.season} seasonal cycle active.`;
        badge = 'CIRCADIAN ENVELOPE';
        break;
    }

    return { title, message, badge };
  }
}
