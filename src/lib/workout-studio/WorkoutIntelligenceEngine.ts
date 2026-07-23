// GAMA Workout Studio - Workout Intelligence Engine

import { BiomechanicsEngine, Landmark3D } from './BiomechanicsEngine';


export interface WorkoutAnalysis {
  exerciseId: string;
  exerciseName: string;
  accuracy: number;        // 0.0 to 1.0 based on form guidelines
  tempo: { eccentric: number; concentric: number; pause: number };
  rangeOfMotion: number;   // ROM Percentage
  symmetryIndex: number;   // Left-right balance score
  fatigueIndex: number;    // Heart rate drift vs speed index
  warnings: string[];
  confidence: number;
  timestamp: number;
}

export class WorkoutIntelligenceEngine {
  private repCount: number = 0;
  private currentPhase: 'ECCENTRIC' | 'CONCENTRIC' | 'PAUSE' = 'PAUSE';
  private phaseStartTime: number = Date.now();
  private repStartTime: number = Date.now();
  private maxFlexionAngle: number = 180;
  private minFlexionAngle: number = 180;
  private exerciseState: 'UP' | 'DOWN' = 'UP';
  private lastLandmarks: Landmark3D[] | null = null;
  private lastTimestamp: number = Date.now();

  private eccentricDuration: number = 0;
  private concentricDuration: number = 0;
  private pauseDuration: number = 0;

  constructor(private exerciseId: string) {}

  public reset() {
    this.repCount = 0;
    this.currentPhase = 'PAUSE';
    this.phaseStartTime = Date.now();
    this.repStartTime = Date.now();
    this.exerciseState = 'UP';
    this.maxFlexionAngle = 180;
    this.minFlexionAngle = 180;
    this.eccentricDuration = 0;
    this.concentricDuration = 0;
    this.pauseDuration = 0;
  }

  /**
   * Classifies the exercise dynamically based on body angles.
   */
  public static classifyExercise(landmarks: Landmark3D[]): string {
    if (landmarks.length < 33) return 'UNKNOWN';

    // Get key joints
    const leftShoulder = landmarks[11];
    const leftElbow = landmarks[13];
    const leftWrist = landmarks[15];
    const leftHip = landmarks[23];
    const leftKnee = landmarks[25];
    const leftAnkle = landmarks[27];

    const kneeAngle = BiomechanicsEngine.calculateJointAngle(leftHip, leftKnee, leftAnkle);
    const elbowAngle = BiomechanicsEngine.calculateJointAngle(leftShoulder, leftElbow, leftWrist);
    const hipAngle = BiomechanicsEngine.calculateJointAngle(leftShoulder, leftHip, leftKnee);

    // Classification heuristics
    if (kneeAngle < 140 && hipAngle < 120) {
      return 'SQUAT';
    }
    if (hipAngle < 90 && kneeAngle > 150) {
      return 'DEADLIFT';
    }
    if (elbowAngle < 100 && leftShoulder.y > leftElbow.y) {
      return 'PRESS'; // Overhead or Bench
    }
    return 'ACTIVE';
  }

  /**
   * Main pipeline processing a new pose frame.
   * Returns a WorkoutAnalysis payload or null if no rep event happened.
   */
  public analyzeFrame(
    landmarks: Landmark3D[],
    currentHeartRate: number,
    onRepCompleted: (analysis: WorkoutAnalysis) => void
  ): WorkoutAnalysis | null {
    if (landmarks.length < 33) return null;

    const now = Date.now();
    const dt = (now - this.lastTimestamp) / 1000;
    this.lastTimestamp = now;

    // Joints needed for Squat & general movement flexion
    const hip = landmarks[23];
    const knee = landmarks[25];
    const ankle = landmarks[27];
    const shoulder = landmarks[11];
    const elbow = landmarks[13];
    const wrist = landmarks[15];

    // Compute primary angles
    const kneeAngle = BiomechanicsEngine.calculateJointAngle(hip, knee, ankle);
    const elbowAngle = BiomechanicsEngine.calculateJointAngle(shoulder, elbow, wrist);
    const backAngle = BiomechanicsEngine.calculateJointAngle(shoulder, hip, knee);

    let activeAngle = kneeAngle; // Default target angle (squat-based)
    let repsBoundaryMin = 100;    // Target min angle for a valid rep (squat depth)
    let repsBoundaryMax = 160;    // Fully extended angle

    if (this.exerciseId.includes('press') || this.exerciseId.includes('pushup')) {
      activeAngle = elbowAngle;
      repsBoundaryMin = 85;
      repsBoundaryMax = 155;
    } else if (this.exerciseId.includes('deadlift') || this.exerciseId.includes('rdl')) {
      activeAngle = backAngle; // Hinge angle
      repsBoundaryMin = 90;
      repsBoundaryMax = 170;
    }

    // Tracking Min/Max angles during the rep
    if (activeAngle < this.minFlexionAngle) this.minFlexionAngle = activeAngle;
    if (activeAngle > this.maxFlexionAngle) this.maxFlexionAngle = activeAngle;

    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];
    const leftKnee = landmarks[25];
    const rightKnee = landmarks[26];

    const leftKneeAngle = BiomechanicsEngine.calculateJointAngle(landmarks[23], leftKnee, landmarks[27]);
    const rightKneeAngle = BiomechanicsEngine.calculateJointAngle(landmarks[24], rightKnee, landmarks[28]);
    const symmetry = BiomechanicsEngine.calculateSymmetry(leftKneeAngle, rightKneeAngle);
    const balance = BiomechanicsEngine.calculateBalance(landmarks);

    let analysis: WorkoutAnalysis | null = null;

    // State Machine logic for rep detection & tempo tracking
    if (this.exerciseState === 'UP' && activeAngle < repsBoundaryMax - 15) {
      // Transitioning down: Eccentric phase starts
      this.exerciseState = 'DOWN';
      this.phaseStartTime = now;
      this.repStartTime = now;
      this.currentPhase = 'ECCENTRIC';
      this.minFlexionAngle = activeAngle;
    } else if (this.exerciseState === 'DOWN') {
      if (activeAngle < repsBoundaryMin + 10) {
        if (this.currentPhase === 'ECCENTRIC') {
          this.eccentricDuration = (now - this.phaseStartTime) / 1000;
          this.currentPhase = 'PAUSE';
          this.phaseStartTime = now;
        }
      } else if (activeAngle > repsBoundaryMax - 10) {
        // Transitioning back to UP: Concentric phase finished, rep completed!
        this.exerciseState = 'UP';
        this.concentricDuration = (now - this.phaseStartTime) / 1000;
        this.repCount++;

        // Range of motion calculation
        const rom = BiomechanicsEngine.calculateROM(this.minFlexionAngle, repsBoundaryMin, repsBoundaryMax);

        // Simple accuracy logic based on ROM, balance, and back alignment
        const accuracy = Math.round((rom * 0.5 + balance * 0.3 + symmetry * 0.2));

        // Evaluate simple warnings
        const warnings: string[] = [];
        if (rom < 75) warnings.push('INCOMPLETE_ROM');
        if (balance < 80) warnings.push('IMBALANCED_LOADING');
        if (this.exerciseId.includes('squat') && backAngle < 65) warnings.push('EXCESSIVE_FORWARD_LEAN');

        // Simple fatigue index using heart rate relative to baseline
        const hrFactor = currentHeartRate > 150 ? (currentHeartRate - 150) / 50 : 0;
        const fatigue = Math.min(100, Math.round(hrFactor * 100));

        analysis = {
          exerciseId: this.exerciseId,
          exerciseName: this.exerciseId.replace('ex-', '').replace('-', ' ').toUpperCase(),
          accuracy: accuracy / 100,
          tempo: {
            eccentric: parseFloat(this.eccentricDuration.toFixed(1)),
            concentric: parseFloat(this.concentricDuration.toFixed(1)),
            pause: parseFloat(((now - this.phaseStartTime) / 1000).toFixed(1))
          },
          rangeOfMotion: Math.round(rom),
          symmetryIndex: Math.round(symmetry),
          fatigueIndex: fatigue,
          warnings,
          confidence: 0.96, // High MediaPipe capture visibility confidence
          timestamp: now
        };

        // Fire callback
        onRepCompleted(analysis);
        
        // Reset min/max limits for next rep
        this.minFlexionAngle = 180;
        this.maxFlexionAngle = 0;
      } else if (activeAngle > this.minFlexionAngle + 10 && this.currentPhase === 'PAUSE') {
        // Transitioning up: Concentric phase starts
        this.pauseDuration = (now - this.phaseStartTime) / 1000;
        this.currentPhase = 'CONCENTRIC';
        this.phaseStartTime = now;
      }
    }

    this.lastLandmarks = landmarks;
    return analysis;
  }

  public getRepCount(): number {
    return this.repCount;
  }
}
