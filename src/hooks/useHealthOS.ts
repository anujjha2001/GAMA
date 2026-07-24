import { create } from 'zustand';
import { WORKOUT_CATALOG, ExerciseDefinition } from '@/lib/workout-studio/workouts-data';

export type ActivePanel =
  | 'DETAIL'
  | 'BIOMECHANICS'
  | 'SESSION_SETUP'
  | 'SESSION_RUNNING'
  | 'SUMMARY'
  | 'HISTORY'
  | 'COACH'
  | 'ANALYTICS'
  | 'ANATOMY'
  | 'NUTRITION'
  | 'INJURY'
  | 'ACHIEVEMENTS'
  | 'SETTINGS'
  | null;

export interface WorkoutSetData {
  setNumber: number;
  weightKg: number;
  repsTarget: number;
  repsCompleted: number;
  avgAccuracy: number;
}

export interface HealthOSState {
  // Global Navigation / UI Glass Sheets
  activePanel: ActivePanel;
  openPanel: (panel: ActivePanel) => void;
  closePanel: () => void;

  // Active Context
  activeExercise: ExerciseDefinition;
  currentStep: number;
  setActiveExercise: (exercise: ExerciseDefinition) => void;
  setCurrentStep: (step: number) => void;

  // Live Workout OS State
  isWorkoutRunning: boolean;
  isCameraActive: boolean;
  isMuted: boolean;
  setWorkoutRunning: (running: boolean) => void;
  setCameraActive: (active: boolean) => void;
  setMuted: (muted: boolean) => void;

  // Live Telemetry Stream
  reps: number;
  caloriesBurned: number;
  activeDuration: number;
  heartRate: number;
  accuracy: number;
  symmetry: number;
  stability: number;
  balance: number;
  poseConfidence: number;
  jointAngleText: string;
  auraCue: string;
  isAuraTalking: boolean;

  setTelemetry: (telemetry: Partial<{
    reps: number;
    caloriesBurned: number;
    activeDuration: number;
    heartRate: number;
    accuracy: number;
    symmetry: number;
    stability: number;
    balance: number;
    poseConfidence: number;
    jointAngleText: string;
    auraCue: string;
    isAuraTalking: boolean;
  }>) => void;

  // Session Setup Settings
  selectedWeight: number;
  targetReps: number;
  targetSets: number;
  currentSetIndex: number;
  completedSets: WorkoutSetData[];
  setSetupParams: (weight: number, reps: number, sets: number) => void;
  addCompletedSet: (set: WorkoutSetData) => void;
  resetSessionState: () => void;

  // Daily Readiness & Engine States
  dailyReadiness: number;
  fatigueScore: number; // 0 to 100
  muscleFatigue: Record<string, number>; // muscle group -> fatigue percent
  injuryRiskScore: number;
  injuryRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestions: string[];
  setReadiness: (score: number) => void;
  updateMuscleFatigue: (muscle: string, increment: number) => void;
  setInjuryRisk: (score: number, level: 'LOW' | 'MEDIUM' | 'HIGH') => void;

  // DNA & Memory Tags
  workoutDNA: {
    coachingStyle: 'ATHLETE' | 'MINDFUL' | 'STRICT';
    tempoPreference: string; // e.g. "2-0-2-0"
    weakMuscles: string[];
    favoriteExercises: string[];
    averageSessionMinutes: number;
    injuryTendencies: string[];
  };
  setCoachingStyle: (style: 'ATHLETE' | 'MINDFUL' | 'STRICT') => void;
  addWeakMuscle: (muscle: string) => void;

  // Event System Trigger
  triggerEvent: (event: string, payload?: any) => void;
}

export const useHealthOS = create<HealthOSState>((set, get) => ({
  // Global Navigation / UI Glass Sheets
  activePanel: null,
  openPanel: (panel) => set({ activePanel: panel }),
  closePanel: () => set({ activePanel: null }),

  // Active Context
  activeExercise: WORKOUT_CATALOG[0],
  currentStep: 0,
  setActiveExercise: (exercise) => set({ activeExercise: exercise, currentStep: 0 }),
  setCurrentStep: (step) => set({ currentStep: step }),

  // Live Workout OS State
  isWorkoutRunning: false,
  isCameraActive: false,
  isMuted: false,
  setWorkoutRunning: (running) => set({ isWorkoutRunning: running }),
  setCameraActive: (active) => set({ isCameraActive: active }),
  setMuted: (muted) => set({ isMuted: muted }),

  // Live Telemetry Stream
  reps: 0,
  caloriesBurned: 0,
  activeDuration: 0,
  heartRate: 74,
  accuracy: 1.0,
  symmetry: 100,
  stability: 100,
  balance: 100,
  poseConfidence: 0,
  jointAngleText: 'Left Knee: --° | Right Hip: --°',
  auraCue: 'Place your camera at hip-level, then click Start when ready.',
  isAuraTalking: false,

  setTelemetry: (telemetry) => set((state) => ({ ...state, ...telemetry })),

  // Session Setup Settings
  selectedWeight: 10,
  targetReps: 10,
  targetSets: 3,
  currentSetIndex: 1,
  completedSets: [],
  setSetupParams: (weight, reps, sets) => set({ selectedWeight: weight, targetReps: reps, targetSets: sets }),
  addCompletedSet: (setData) => set((state) => ({
    completedSets: [...state.completedSets, setData],
    currentSetIndex: state.currentSetIndex + 1
  })),
  resetSessionState: () => set({
    reps: 0,
    caloriesBurned: 0,
    activeDuration: 0,
    currentSetIndex: 1,
    completedSets: [],
    accuracy: 1.0,
    symmetry: 100,
    stability: 100,
    balance: 100
  }),

  // Daily Readiness & Engine States
  dailyReadiness: 85,
  fatigueScore: 20,
  muscleFatigue: {
    Quadriceps: 15,
    Glutes: 10,
    Hamstrings: 5,
    Core: 8,
    Chest: 12,
    Triceps: 5,
    Back: 18,
    Shoulders: 7
  },
  injuryRiskScore: 12,
  injuryRiskLevel: 'LOW',
  suggestions: ['Maintain smooth tempo', 'Focus on breathing rhythm'],
  setReadiness: (score) => set({ dailyReadiness: score }),
  updateMuscleFatigue: (muscle, increment) => set((state) => {
    const prev = state.muscleFatigue[muscle] || 0;
    const nextVal = Math.min(100, Math.max(0, prev + increment));
    const nextFatigue = { ...state.muscleFatigue, [muscle]: nextVal };
    const avgFatigue = Math.round(Object.values(nextFatigue).reduce((a, b) => a + b, 0) / Object.keys(nextFatigue).length);
    return {
      muscleFatigue: nextFatigue,
      fatigueScore: avgFatigue
    };
  }),
  setInjuryRisk: (score, level) => set({ injuryRiskScore: score, injuryRiskLevel: level }),

  // DNA & Memory Tags
  workoutDNA: {
    coachingStyle: 'ATHLETE',
    tempoPreference: '2-0-2-0',
    weakMuscles: ['Lower Back', 'Left Knee'],
    favoriteExercises: ['Dumbbell Goblet Squat'],
    averageSessionMinutes: 45,
    injuryTendencies: ['Patellar stress']
  },
  setCoachingStyle: (style) => set((state) => ({
    workoutDNA: { ...state.workoutDNA, coachingStyle: style }
  })),
  addWeakMuscle: (muscle) => set((state) => ({
    workoutDNA: { ...state.workoutDNA, weakMuscles: Array.from(new Set([...state.workoutDNA.weakMuscles, muscle])) }
  })),

  // Event System Trigger
  triggerEvent: (event, payload) => {
    console.log(`[HealthOS Event System] Dispatching: ${event}`, payload);
    const store = get();

    // Side-effects execution chain
    if (event === 'REP_COMPLETED') {
      const accuracy = payload?.accuracy || 0.95;
      const symmetry = payload?.symmetry || 98;
      const stability = payload?.stability || 95;
      const balance = payload?.balance || 96;

      // Incremental updates
      const updatedReps = store.reps + 1;
      const durationMin = store.activeDuration / 60;
      const dynamicCalorie = store.activeExercise.caloriesFormula(80, durationMin + 0.1);
      
      // Update store telemetry
      set({
        reps: updatedReps,
        caloriesBurned: Math.round(dynamicCalorie),
        accuracy,
        symmetry,
        stability,
        balance,
        heartRate: Math.min(180, Math.max(70, store.heartRate + (Math.random() > 0.5 ? 2 : -1)))
      });

      // Update Muscle Fatigue in background based on target exercise muscles
      store.activeExercise.primaryMuscles.forEach((muscle) => {
        store.updateMuscleFatigue(muscle, 1.2);
      });
      store.activeExercise.secondaryMuscles.forEach((muscle) => {
        store.updateMuscleFatigue(muscle, 0.4);
      });

      // Dynamic AURA coach live observation alerts (No button required)
      if (updatedReps === 5 && accuracy < 0.8) {
        set({
          auraCue: 'AURA: Your hip stability is dropping. Push your knees out to reinforce alignment.',
          isAuraTalking: true
        });
        setTimeout(() => set({ isAuraTalking: false }), 4000);
      } else if (updatedReps === 8) {
        set({
          auraCue: 'AURA: Excellent form accuracy maintained. Finish this set strong!',
          isAuraTalking: true
        });
        setTimeout(() => set({ isAuraTalking: false }), 4000);
      }
    }

    if (event === 'SET_COMPLETED') {
      const currentSet: WorkoutSetData = {
        setNumber: store.currentSetIndex,
        weightKg: store.selectedWeight,
        repsTarget: store.targetReps,
        repsCompleted: store.reps,
        avgAccuracy: store.accuracy
      };
      
      store.addCompletedSet(currentSet);
      set({ reps: 0 }); // reset reps for next set

      if (store.currentSetIndex > store.targetSets) {
        // Workout finished automatically!
        store.triggerEvent('WORKOUT_FINISHED');
      }
    }

    if (event === 'WORKOUT_FINISHED') {
      set({ isWorkoutRunning: false });
      store.openPanel('SUMMARY');
    }
  }
}));
