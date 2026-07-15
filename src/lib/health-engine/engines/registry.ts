import { RegisteredHealthEngine } from '../types';
import { StressEngine } from './stress';
import { HeartEngine } from './heart';
import { HrvEngine } from './hrv';
import { SleepEngine } from './sleep';
import { RecoveryEngine } from './recovery';
import { EnergyEngine } from './energy';
import { FocusEngine } from './focus';
import { WellnessEngine } from './wellness';

export class EngineRegistry {
  private static engines: RegisteredHealthEngine[] = [];

  static register(engine: RegisteredHealthEngine) {
    if (!this.engines.some(e => e.id === engine.id)) {
      this.engines.push(engine);
    }
  }

  static getEngines(): RegisteredHealthEngine[] {
    if (this.engines.length === 0) {
      // Default auto-registrations
      this.register(new StressEngine());
      this.register(new HeartEngine());
      this.register(new HrvEngine());
      this.register(new SleepEngine());
      this.register(new RecoveryEngine());
      this.register(new EnergyEngine());
      this.register(new FocusEngine());
      this.register(new WellnessEngine());
    }
    return this.engines;
  }
}
