// GAMA Workout Studio - Safety Engine

import { Landmark3D } from './BiomechanicsEngine';

export interface SafetyStatus {
  isSafe: boolean;
  triggerPause: boolean;
  warnings: string[];
  explanation: string | null;
  riskScore: number; // 0 to 100
}

export class SafetyEngine {
  /**
   * Main evaluation method running on telemetry frames.
   */
  public static evaluateFrame(
    landmarks: Landmark3D[],
    currentHeartRate: number,
    isCameraLost: boolean,
    poseConfidence: number,
    reportedPain: boolean
  ): SafetyStatus {
    const warnings: string[] = [];
    let isSafe = true;
    let triggerPause = false;
    let explanation: string | null = null;
    let riskScore = 0;

    // 1. Critical Hard-Stops
    if (isCameraLost) {
      return {
        isSafe: false,
        triggerPause: true,
        warnings: ['CAMERA_DISCONNECTED'],
        explanation: 'Camera feed lost. Pausing to preserve tracking integrity.',
        riskScore: 100,
      };
    }

    if (poseConfidence < 0.60) {
      return {
        isSafe: false,
        triggerPause: true,
        warnings: ['POSE_CONFIDENCE_LOW'],
        explanation: 'Low tracking confidence. Please step back and move fully into frame.',
        riskScore: 80,
      };
    }

    if (reportedPain) {
      return {
        isSafe: false,
        triggerPause: true,
        warnings: ['USER_PAIN_REPORTED'],
        explanation: 'User indicated pain. Pausing workout immediately. Take a moment to recover.',
        riskScore: 100,
      };
    }

    // 2. Telemetry and Biometric Limits
    if (currentHeartRate > 185) {
      isSafe = false;
      triggerPause = true;
      warnings.push('CRITICAL_HEART_RATE');
      explanation = 'Unsafe cardiac threshold exceeded. Pausing workout to prevent cardiovascular strain.';
      riskScore = 95;
      return { isSafe, triggerPause, warnings, explanation, riskScore };
    }

    // 3. Movement Safety (Biomechanics check)
    if (landmarks.length >= 33) {
      const leftShoulder = landmarks[11];
      const leftHip = landmarks[23];
      const leftKnee = landmarks[25];

      // Hip-back flexion validation
      if (leftShoulder && leftHip && leftKnee) {
        const dx = leftShoulder.x - leftHip.x;
        const dy = leftShoulder.y - leftHip.y;
        // Approximation of torso lean angle
        const torsoLean = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI);
        
        // If back lean is extremely flat/horizontal under squat load (e.g. leaning parallel to floor)
        if (torsoLean < 40) {
          warnings.push('DANGEROUS_LUMBAR_SHEAR');
          riskScore = Math.max(riskScore, 65);
          explanation = 'Excessive torso forward lean. Realign your spine to Goblet position to protect your lower back.';
        }
      }
    }

    return {
      isSafe,
      triggerPause,
      warnings,
      explanation,
      riskScore,
    };
  }
}
