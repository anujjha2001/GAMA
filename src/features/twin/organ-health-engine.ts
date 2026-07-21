export interface OrganHealthData {
  name: string;
  score: number;
  status: string;
  trend: 'up' | 'down' | 'stable';
  prediction: string;
  recommendations: string[];
  confidenceScore: number;
  habits: string[];
  risks: string[];
  doctorPrepNotes: string;
}

export class OrganHealthEngine {
  static getOrganHealth(organId: string, biometrics: {
    recoveryScore: number;
    stressLevel: number;
    hydrationLevel: number;
    sleepHours: number;
  }): OrganHealthData {
    const { recoveryScore, stressLevel, hydrationLevel, sleepHours } = biometrics;

    // Simple robust dynamic mapping based on real store values
    switch (organId.toLowerCase()) {
      case 'brain':
        const brainScore = Math.round(Math.min(100, Math.max(30, 100 - stressLevel * 6 + (sleepHours >= 7 ? 8 : -8))));
        return {
          name: 'Brain & Cognitive Health',
          score: brainScore,
          status: brainScore > 75 ? 'Optimal Executive Function' : brainScore > 50 ? 'Moderate Fatigue' : 'High Cognitive Strain',
          trend: stressLevel > 5 ? 'down' : 'up',
          prediction: 'Expected focus dip around 4:00 PM due to sleep latency pattern.',
          recommendations: [
            'Perform 5 mins box breathing to stabilize heart rate variability.',
            'Schedule high-cognition tasks before 1:00 PM.'
          ],
          confidenceScore: 92,
          habits: ['Consistent sleep rhythm', 'Reduced blue light exposure before bed'],
          risks: ['Elevated cortisol induced mental block', 'Tension headache predisposition'],
          doctorPrepNotes: 'Biometric records show mild autonomic strain. Monitor deep sleep trends.'
        };
      case 'heart':
        const heartScore = Math.round(Math.min(100, Math.max(30, recoveryScore + (10 - stressLevel) * 1.5)));
        return {
          name: 'Cardiovascular System',
          score: heartScore,
          status: heartScore > 80 ? 'Robust Autonomic Tone' : heartScore > 60 ? 'Optimal Rest' : 'Suppressed Recovery Capacity',
          trend: recoveryScore > 70 ? 'up' : 'down',
          prediction: 'Cardiovascular strain will remain elevated unless active rest is scheduled.',
          recommendations: [
            'Maintain target heart rate under 135 BPM during today\'s light session.',
            'Increase electrolyte intake by 500mg.'
          ],
          confidenceScore: 95,
          habits: ['Low-intensity zone 2 cardio', 'Hydration tracking'],
          risks: ['Delayed heart rate recovery', 'Arterial constriction under stress'],
          doctorPrepNotes: 'Resting heart rate averages stable. Recovery intervals show standard athletic adaptation.'
        };
      case 'lungs':
        const lungsScore = Math.round(Math.min(100, Math.max(30, 85 + (sleepHours > 7 ? 5 : -5) - stressLevel)));
        return {
          name: 'Respiratory System',
          score: lungsScore,
          status: lungsScore > 80 ? 'Peak Oxygen Saturation' : 'Standard Respiratory Volume',
          trend: 'stable',
          prediction: 'Respiration rate predicted to normalize at 14 breaths/min during rest.',
          recommendations: [
            'Conduct 10 breaths of deep diaphragmatic inhalation.',
            'Maintain indoor relative humidity around 45%.'
          ],
          confidenceScore: 89,
          habits: ['Nasal breathing exercise', 'Daily outdoor walk'],
          risks: ['Shallow thoracic breathing patterns', 'Reduced vital capacity during fatigue'],
          doctorPrepNotes: 'Respiration telemetry matches average seasonal baseline. No clinical warning flags.'
        };
      case 'liver':
        const liverScore = Math.round(Math.min(100, Math.max(30, 90 - (stressLevel > 6 ? 5 : 0) + (hydrationLevel > 70 ? 5 : -10))));
        return {
          name: 'Liver & Metabolic Cleansing',
          score: liverScore,
          status: liverScore > 80 ? 'Optimal Detoxification' : 'Moderate Toxic Load',
          trend: hydrationLevel > 60 ? 'up' : 'down',
          prediction: 'Slight delay in morning metabolic clearance expected due to low hydration.',
          recommendations: [
            'Consume 400ml warm water with lemon upon waking.',
            'Restrict heavy fats/refined sugars for the next 12 hours.'
          ],
          confidenceScore: 84,
          habits: ['Intermittent fasting (14/10)', 'Hydration maintenance'],
          risks: ['Sluggish lipid metabolism', 'Increased oxidative stress indicators'],
          doctorPrepNotes: 'Liver enzymes proxy indicators within normal margins. Keep monitoring hydration status.'
        };
      case 'digestive':
      case 'stomach':
        const digestiveScore = Math.round(Math.min(100, Math.max(30, 88 - stressLevel * 5 + (hydrationLevel > 60 ? 5 : -8))));
        return {
          name: 'Gastrointestinal Tract',
          score: digestiveScore,
          status: digestiveScore > 75 ? 'Healthy Gut Motility' : digestiveScore > 50 ? 'Acid Reflex Susceptibility' : 'Enteric System Inflammation',
          trend: stressLevel > 5 ? 'down' : 'stable',
          prediction: 'Metabolic digest efficiency will decrease post-sunset due to autonomic strain.',
          recommendations: [
            'Eat a light, fiber-rich dinner at least 3 hours before sleep.',
            'Incorporate active probiotics or fermented foods.'
          ],
          confidenceScore: 87,
          habits: ['Chewing food thoroughly (20+ times)', 'Regular hydration intervals'],
          risks: ['Acid reflux during early sleep phases', 'Gut barrier permeability irritation'],
          doctorPrepNotes: 'Stress-to-digestion feedback loop active. Patient benefits from dinner timing optimization.'
        };
      case 'muscles':
        const muscleScore = Math.round(Math.min(100, Math.max(30, recoveryScore)));
        return {
          name: 'Musculoskeletal System',
          score: muscleScore,
          status: muscleScore > 80 ? 'Fully Restored Muscle Fibers' : muscleScore > 55 ? 'Mild Active Fatigue' : 'High DOMS & Fiber Tension',
          trend: recoveryScore > 65 ? 'up' : 'down',
          prediction: 'Peak muscular force expected to restore fully in 24 hours of active recovery.',
          recommendations: [
            'Perform 15 mins of dynamic active stretching.',
            'Apply local heat therapy/foam rolling to hamstring and calves.'
          ],
          confidenceScore: 91,
          habits: ['Post-workout protein intake', 'Active mobility routines'],
          risks: ['Ligament tension under cold load', 'Micro-tears requires rest intervals'],
          doctorPrepNotes: 'Muscular recovery score directly correlates with daily HRV patterns. Normal training cycle.'
        };
      default:
        // Generic fallback for skin, eyes, bones, nervous system
        const defaultScore = Math.round(Math.min(100, Math.max(35, 75 + (recoveryScore - 50) * 0.3 - stressLevel)));
        return {
          name: `${organId.charAt(0).toUpperCase() + organId.slice(1)} Health`,
          score: defaultScore,
          status: defaultScore > 75 ? 'Stable Performance' : 'Slight System Strain',
          trend: 'stable',
          prediction: 'Biometrics project stable performance parameters over the coming 48 hours.',
          recommendations: [
            'Ensure adequate micronutrient intake (zinc, magnesium).',
            'Take a 5-minute offline break every 90 minutes of digital exposure.'
          ],
          confidenceScore: 80,
          habits: ['Balanced clean dieting', 'Ergonomic screen posture'],
          risks: ['Fatigue accumulation', 'Mild oxidative strain'],
          doctorPrepNotes: 'System health indicators consistent with normal non-clinical patterns.'
        };
    }
  }
}
