import { WorldWeather, WorldState } from './world-state';

export interface EnvironmentalFactor {
  rainIntensity: number; // 0 to 1
  fogDensity: number; // 0 to 1
  windSpeed: number; // km/h
  particleType: 'LEAVES' | 'SNOW' | 'BUTTERFLIES' | 'FIREFLIES' | 'NONE';
  riverSpeedMultiplier: number;
}

export class EnvironmentEngine {
  static getFactors(state: WorldState): EnvironmentalFactor {
    let rainIntensity = 0;
    let fogDensity = 0;
    let windSpeed = 10;
    let particleType: EnvironmentalFactor['particleType'] = 'NONE';
    let riverSpeedMultiplier = 1.0;

    // Wind derived from stress
    windSpeed = 5 + state.stressLevel * 4;

    // Fog derived from stress and sleep
    if (state.stressLevel > 6) {
      fogDensity = 0.6;
    }

    // Rain intensity
    if (state.weather === 'RAINY') {
      rainIntensity = 0.5;
      riverSpeedMultiplier = 1.4;
    } else if (state.weather === 'STORMY') {
      rainIntensity = 1.0;
      riverSpeedMultiplier = 1.8;
      windSpeed += 15;
    }

    // Particle selection based on recovery and day/night cycle
    if (state.weather === 'SNOWY' || state.season === 'WINTER') {
      particleType = 'SNOW';
    } else if (state.dayCycle === 'NIGHT' || state.dayCycle === 'MIDNIGHT') {
      particleType = 'FIREFLIES';
    } else if (state.recoveryScore >= 90) {
      particleType = 'BUTTERFLIES';
    } else {
      particleType = 'LEAVES';
    }

    // Adjust river speed depending on hydration
    riverSpeedMultiplier = riverSpeedMultiplier * (state.hydrationLevel / 100);

    return {
      rainIntensity,
      fogDensity,
      windSpeed,
      particleType,
      riverSpeedMultiplier
    };
  }
}
