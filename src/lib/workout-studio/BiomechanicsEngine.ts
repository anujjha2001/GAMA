// GAMA Workout Studio - Biomechanics Engine

export interface Landmark3D {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

export class BiomechanicsEngine {
  /**
   * Calculates the 3D angle between three joints.
   * Vertex is point 'b'. Returns angle in degrees.
   */
  public static calculateJointAngle(a: Landmark3D, b: Landmark3D, c: Landmark3D): number {
    const v1 = { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
    const v2 = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };

    const dotProduct = v1.x * v2.x + v1.y * v2.y + v1.z * v2.z;
    const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y + v1.z * v1.z);
    const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y + v2.z * v2.z);

    if (mag1 === 0 || mag2 === 0) return 0;

    let cosAngle = dotProduct / (mag1 * mag2);
    // Clamp to avoid float precision out-of-bounds
    cosAngle = Math.max(-1, Math.min(1, cosAngle));

    const angleRad = Math.acos(cosAngle);
    return (angleRad * 180) / Math.PI;
  }

  /**
   * Calculates the Center of Gravity (CoG) coordinate based on shoulders, hips, and knees.
   */
  public static calculateCenterOfGravity(landmarks: Landmark3D[]): Landmark3D {
    // MediaPipe key indices:
    // Left Shoulder: 11, Right Shoulder: 12
    // Left Hip: 23, Right Hip: 24
    // Left Knee: 25, Right Knee: 26
    const indices = [11, 12, 23, 24, 25, 26];
    let sumX = 0, sumY = 0, sumZ = 0, count = 0;

    indices.forEach(idx => {
      const lm = landmarks[idx];
      if (lm && (lm.visibility === undefined || lm.visibility > 0.5)) {
        sumX += lm.x;
        sumY += lm.y;
        sumZ += lm.z;
        count++;
      }
    });

    if (count === 0) return { x: 0.5, y: 0.5, z: 0 };
    return { x: sumX / count, y: sumY / count, z: sumZ / count };
  }

  /**
   * Evaluates the balance vector as the offset difference between left and right shoulders/hips.
   */
  public static calculateBalance(landmarks: Landmark3D[]): number {
    const leftShoulder = landmarks[11];
    const rightShoulder = landmarks[12];
    const leftHip = landmarks[23];
    const rightHip = landmarks[24];

    if (!leftShoulder || !rightShoulder || !leftHip || !rightHip) return 1.0; // Perfect balance default

    const shoulderSlope = Math.abs(leftShoulder.y - rightShoulder.y);
    const hipSlope = Math.abs(leftHip.y - rightHip.y);
    
    // Normalize into a score where 0.0 is perfect balance (0 slope)
    const imbalance = (shoulderSlope + hipSlope) / 2;
    return Math.max(0, 100 - imbalance * 200); // Scale index out of 100
  }

  /**
   * Evaluates stability from variance in joint coordinates.
   */
  public static calculateStability(history: Landmark3D[]): number {
    if (history.length < 5) return 100;
    
    let sumX = 0, sumY = 0;
    history.forEach(p => {
      sumX += p.x;
      sumY += p.y;
    });
    const avgX = sumX / history.length;
    const avgY = sumY / history.length;

    let varianceSum = 0;
    history.forEach(p => {
      varianceSum += Math.pow(p.x - avgX, 2) + Math.pow(p.y - avgY, 2);
    });
    
    const stdDev = Math.sqrt(varianceSum / history.length);
    // Lower standard deviation means higher stability
    return Math.max(0, Math.min(100, 100 - stdDev * 1000));
  }

  /**
   * Calculates velocity (meters/second approximation) based on landmark movement.
   */
  public static calculateVelocity(prev: Landmark3D, current: Landmark3D, dtSeconds: number): number {
    if (dtSeconds <= 0) return 0;
    const dx = current.x - prev.x;
    const dy = current.y - prev.y;
    const dz = current.z - prev.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    return dist / dtSeconds;
  }

  /**
   * Calculates structural symmetry between left and right angles.
   */
  public static calculateSymmetry(leftAngle: number, rightAngle: number): number {
    if (leftAngle === 0 && rightAngle === 0) return 100;
    const diff = Math.abs(leftAngle - rightAngle);
    const max = Math.max(leftAngle, rightAngle);
    if (max === 0) return 100;
    return Math.max(0, 100 - (diff / max) * 100);
  }

  /**
   * Standard Range of Motion (ROM) evaluation relative to baseline.
   */
  public static calculateROM(currentAngle: number, minAngle: number, maxAngle: number): number {
    const range = Math.abs(maxAngle - minAngle);
    if (range === 0) return 0;
    const currentDiff = Math.abs(currentAngle - minAngle);
    return Math.min(100, Math.max(0, (currentDiff / range) * 100));
  }
}
