export type TwinMood = 'HAPPY' | 'FOCUSED' | 'RELAXED' | 'CURIOUS' | 'TIRED' | 'SLEEPY' | 'BURNED_OUT' | 'SICK' | 'RECOVERING' | 'MOTIVATED';
export type WorldWeather = 'SUNNY' | 'PARTLY_CLOUDY' | 'CLOUDY' | 'RAINY' | 'FOGGY' | 'STORMY' | 'SNOWY';
export type DayCycle = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT' | 'MIDNIGHT';
export type Season = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';

export interface WorldState {
  mood: TwinMood;
  weather: WorldWeather;
  dayCycle: DayCycle;
  season: Season;
  recoveryScore: number;
  stressLevel: number;
  hydrationLevel: number;
  sleepHours: number;
  fireStrength: 'OFF' | 'LOW' | 'NORMAL' | 'HIGH';
  worldLevel: number;
  activeEvents: string[];
  ambientVolume: number;
  isMuted: boolean;
  unlockedFeatures: string[];
  cameraZoom: 'DEFAULT' | 'CLOSE' | 'WIDE' | 'SKY';
}

export class CentralWorldStore {
  private static state: WorldState = {
    mood: 'RELAXED',
    weather: 'SUNNY',
    dayCycle: 'AFTERNOON',
    season: 'SPRING',
    recoveryScore: 85,
    stressLevel: 2,
    hydrationLevel: 75,
    sleepHours: 7.5,
    fireStrength: 'NORMAL',
    worldLevel: 1,
    activeEvents: [],
    ambientVolume: 0.5,
    isMuted: false,
    unlockedFeatures: ['CAMPFIRE', 'TREE', 'LAKE'],
    cameraZoom: 'DEFAULT'
  };

  private static listeners: Set<(state: WorldState) => void> = new Set();

  static getState(): WorldState {
    return { ...this.state };
  }

  static updateState(newState: Partial<WorldState>) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  static subscribe(listener: (state: WorldState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notifyListeners() {
    const currentState = this.getState();
    this.listeners.forEach(listener => listener(currentState));
  }
}
