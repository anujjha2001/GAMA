import { WorldState } from './world-state';

export interface CameraProperties {
  zoom: number;
  offsetX: number;
  offsetY: number;
  breathingRate: number;
}

export class AnimationDirector {
  static getCameraParams(state: WorldState): CameraProperties {
    // Dynamic camera coordinates depending on state and time
    let zoom = 1.0;
    let offsetX = 0;
    let offsetY = 0;
    let breathingRate = 1.5; // low frequency camera breathing in seconds

    if (state.cameraZoom === 'CLOSE') {
      zoom = 1.4;
      offsetY = 15;
    } else if (state.cameraZoom === 'WIDE') {
      zoom = 0.8;
      offsetY = -20;
    } else if (state.cameraZoom === 'SKY') {
      zoom = 0.7;
      offsetY = 40;
    }

    // Zoom camera on campfire when recovery is critical
    if (state.recoveryScore < 40) {
      zoom = 1.25;
      offsetY = 10;
    }

    return {
      zoom,
      offsetX,
      offsetY,
      breathingRate
    };
  }
}
