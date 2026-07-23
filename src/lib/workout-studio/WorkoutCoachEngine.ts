// GAMA Workout Studio - Workout Coach State Machine

import { WorkoutAnalysis } from './WorkoutIntelligenceEngine';

export type CoachState =
  | 'IDLE'
  | 'CAMERA_PERMISSION'
  | 'CALIBRATION'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'REST'
  | 'COMPLETED'
  | 'SAVED'
  | 'RECOVERY_ANALYSIS';

export type CoachingStyle =
  | 'BEGINNER'
  | 'ATHLETE'
  | 'POWERLIFTING'
  | 'BODYBUILDING'
  | 'FAT_LOSS'
  | 'REHABILITATION'
  | 'SENIOR'
  | 'SPORTS_PERFORMANCE';

export class WorkoutCoachEngine {
  private currentState: CoachState = 'IDLE';
  private coachingStyle: CoachingStyle = 'ATHLETE';
  private lastCueTime: number = 0;
  private minCueIntervalMs: number = 4000; // 4s cooldown between cues
  private history: WorkoutAnalysis[] = [];

  constructor(style: CoachingStyle = 'ATHLETE') {
    this.coachingStyle = style;
  }

  public transitionTo(newState: CoachState) {
    console.log(`[CoachState] Transitioning from ${this.currentState} to ${newState}`);
    this.currentState = newState;
  }

  public getState(): CoachState {
    return this.currentState;
  }

  public getStyle(): CoachingStyle {
    return this.coachingStyle;
  }

  public setStyle(style: CoachingStyle) {
    this.coachingStyle = style;
  }

  /**
   * Generates custom adaptive coaching suggestions based on current biometrics and posture warnings.
   */
  public generateCoachingCue(
    warnings: string[],
    accuracy: number,
    heartRate: number,
    stressLevel: number
  ): string | null {
    const now = Date.now();
    if (now - this.lastCueTime < this.minCueIntervalMs) {
      return null; // Throttle to prevent overlap
    }

    if (this.currentState !== 'RUNNING') return null;

    // Safety cues first
    if (heartRate > 175) {
      this.lastCueTime = now;
      return "Heart rate is too high. Drop the intensity and take slow, deep breaths.";
    }

    if (warnings.includes('EXCESSIVE_FORWARD_LEAN')) {
      this.lastCueTime = now;
      return this.coachingStyle === 'REHABILITATION' 
        ? "Keep your back upright. Avoid bending too far forward to protect your back."
        : "Keep your chest up and slide your hips down, not forward.";
    }

    if (warnings.includes('INCOMPLETE_ROM')) {
      this.lastCueTime = now;
      return this.coachingStyle === 'BEGINNER' 
        ? "Good try. Focus on dropping a bit lower if comfortable."
        : "Work on getting full depth. Push for full range of motion.";
    }

    if (warnings.includes('IMBALANCED_LOADING')) {
      this.lastCueTime = now;
      return "Distribute your weight evenly. Do not lean toward one side.";
    }

    // Positive reinforcement cues
    if (accuracy > 0.90 && Math.random() > 0.7) {
      this.lastCueTime = now;
      return this.coachingStyle === 'ATHLETE'
        ? "Excellent control. Flawless tempo."
        : "Great alignment. Keep that exact pace.";
    }

    return null;
  }
}
