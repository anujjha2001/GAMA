import { HealthData, HealthEvent } from '../types';

export class TimelineEngine {
  static getTimelineEvents(data: HealthData): HealthEvent[] {
    const events: HealthEvent[] = [];

    // Formulate a dynamic list of timeline logs matching the time of day and inputs
    const baseDate = new Date();
    
    events.push({
      id: "ev1",
      type: "sleep",
      title: "Sleep Session Logged",
      timestamp: new Date(baseDate.setHours(7, 30, 0, 0)).toISOString(),
      value: `${data.sleepHours} hrs (${data.sleepEfficiency}% efficiency)`
    });

    events.push({
      id: "ev2",
      type: "hydration",
      title: "Morning Hydration Target",
      timestamp: new Date(baseDate.setHours(8, 15, 0, 0)).toISOString(),
      value: "350 ml"
    });

    if (data.steps > 10000) {
      events.push({
        id: "ev3",
        type: "workout",
        title: "Zone 2 Cardio Workout",
        timestamp: new Date(baseDate.setHours(11, 0, 0, 0)).toISOString(),
        value: "45 min (320 kcal)"
      });
    }

    if (data.currentHeartRate > 110) {
      events.push({
        id: "ev4",
        type: "hr_peak",
        title: "Max Cardiovascular HR Spike",
        timestamp: new Date(baseDate.setHours(11, 20, 0, 0)).toISOString(),
        value: `${data.currentHeartRate} BPM`
      });
    }

    if (data.hrv < 60) {
      events.push({
        id: "ev5",
        type: "stress_spike",
        title: "Autonomic Stress Spike Detected",
        timestamp: new Date(baseDate.setHours(14, 15, 0, 0)).toISOString(),
        value: "Nervous strain indicated"
      });
    }

    events.push({
      id: "ev6",
      type: "meditation",
      title: "Coherence Meditation",
      timestamp: new Date(baseDate.setHours(18, 30, 0, 0)).toISOString(),
      value: "10 min box breathing"
    });

    return events;
  }
}
