import { WorldState, TwinMood, WorldWeather, DayCycle, Season } from './world-state';

export class HealthWorldMapper {
  static mapBiometricsToWorld(
    recoveryScore: number,
    stressLevel: number,
    hydrationLevel: number,
    sleepHours: number,
    tempC: number = 24
  ): Partial<WorldState> {
    
    // 1. Recovery -> Campfire strength
    let fireStrength: WorldState['fireStrength'] = 'NORMAL';
    if (recoveryScore >= 90) {
      fireStrength = 'HIGH';
    } else if (recoveryScore >= 70) {
      fireStrength = 'NORMAL';
    } else if (recoveryScore >= 50) {
      fireStrength = 'LOW';
    } else {
      fireStrength = 'OFF';
    }

    // 2. Recovery & Stress -> Weather
    let weather: WorldWeather = 'SUNNY';
    if (recoveryScore < 30) {
      weather = 'STORMY';
    } else if (recoveryScore < 50) {
      weather = 'RAINY';
    } else if (stressLevel > 7) {
      weather = 'FOGGY';
    } else if (recoveryScore < 70) {
      weather = 'CLOUDY';
    } else if (recoveryScore < 90) {
      weather = 'PARTLY_CLOUDY';
    }

    // 3. Biometrics -> Character Mood
    let mood: TwinMood = 'RELAXED';
    if (recoveryScore < 30) {
      mood = 'BURNED_OUT';
    } else if (recoveryScore < 50) {
      mood = 'TIRED';
    } else if (sleepHours < 6) {
      mood = 'SLEEPY';
    } else if (stressLevel > 6) {
      mood = 'SICK';
    } else if (recoveryScore >= 90) {
      mood = 'MOTIVATED';
    } else if (stressLevel < 3) {
      mood = 'HAPPY';
    }

    // 4. Time based DayCycle mapping
    const currentHour = new Date().getHours();
    let dayCycle: DayCycle = 'AFTERNOON';
    if (currentHour >= 5 && currentHour < 8) {
      dayCycle = 'MORNING';
    } else if (currentHour >= 8 && currentHour < 17) {
      dayCycle = 'AFTERNOON';
    } else if (currentHour >= 17 && currentHour < 20) {
      dayCycle = 'EVENING';
    } else if (currentHour >= 20 || currentHour < 1) {
      dayCycle = 'NIGHT';
    } else {
      dayCycle = 'MIDNIGHT';
    }

    // 5. Month based Season mapping
    const currentMonth = new Date().getMonth(); // 0-11
    let season: Season = 'SPRING';
    if (currentMonth >= 2 && currentMonth <= 4) {
      season = 'SPRING';
    } else if (currentMonth >= 5 && currentMonth <= 7) {
      season = 'SUMMER';
    } else if (currentMonth >= 8 && currentMonth <= 10) {
      season = 'AUTUMN';
    } else {
      season = 'WINTER';
    }

    // Dynamic unlocked features progression
    const unlockedFeatures = ['CAMPFIRE', 'TREE', 'LAKE'];
    if (recoveryScore > 60) unlockedFeatures.push('BRIDGE');
    if (recoveryScore > 75) unlockedFeatures.push('LANTERNS');
    if (recoveryScore > 85) unlockedFeatures.push('CABIN');
    if (recoveryScore > 92) unlockedFeatures.push('PET_COMPANION');

    return {
      recoveryScore,
      stressLevel,
      hydrationLevel,
      sleepHours,
      fireStrength,
      weather,
      mood,
      dayCycle,
      season,
      unlockedFeatures
    };
  }
}
