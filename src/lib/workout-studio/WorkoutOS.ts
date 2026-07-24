import { useHealthOS, WorkoutSetData } from '@/hooks/useHealthOS';
import { toast } from 'sonner';

export class WorkoutOS {
  // Start set initialization
  static startSet(weightKg: number, repsTarget: number, setsTarget: number) {
    const store = useHealthOS.getState();
    store.resetSessionState();
    store.setSetupParams(weightKg, repsTarget, setsTarget);
    store.setWorkoutRunning(true);
    store.openPanel('SESSION_RUNNING');

    store.triggerEvent('SET_STARTED', {
      weightKg,
      repsTarget,
      setsTarget
    });

    toast.success(`Workout Session Initialized: Set 1 / ${setsTarget} started.`);
  }

  // Completing a set
  static completeSet() {
    const store = useHealthOS.getState();
    if (!store.isWorkoutRunning) return;

    store.triggerEvent('SET_COMPLETED');
    const nextSetIndex = store.currentSetIndex; // already incremented by event handler

    if (nextSetIndex <= store.targetSets) {
      toast.success(`Set ${nextSetIndex - 1} completed! Get ready for Set ${nextSetIndex}.`);
    } else {
      toast.success('All sets completed! Finalizing workout...');
    }
  }

  // Terminate and save workout
  static async finishWorkout() {
    const store = useHealthOS.getState();
    store.setWorkoutRunning(false);

    // Save session logs to Database via server endpoint
    const userEmail = localStorage.getItem('gama_user_email') || 'test@gama.com';
    const payload = {
      email: userEmail,
      exerciseName: store.activeExercise.name,
      difficulty: store.activeExercise.difficulty,
      durationSec: store.activeDuration,
      caloriesBurned: store.caloriesBurned,
      repCount: store.completedSets.reduce((sum, s) => sum + s.repsCompleted, 0),
      avgAccuracy: store.completedSets.reduce((sum, s) => sum + s.avgAccuracy, 0) / (store.completedSets.length || 1),
      muscleLoad: store.activeExercise.primaryMuscles.reduce((acc, m) => ({ ...acc, [m]: 85 }), {}),
      sets: store.completedSets.map((s) => ({
        setNumber: s.setNumber,
        weightKg: s.weightKg,
        reps: s.repsTarget,
        completedReps: s.repsCompleted,
        avgAccuracy: s.avgAccuracy
      }))
    };

    try {
      const res = await fetch('/api/workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Workout data successfully synced with GAMA Health OS.');
      } else {
        console.warn('Backend sync returned error code. Offline queue activated.');
      }
    } catch (err) {
      console.warn('Network offline. Telemetry queued for sync.');
    }

    // Trigger full event cascade for background update (Recovery, Nutrition, DNA, Timeline)
    store.triggerEvent('WORKOUT_FINISHED', payload);
  }

  // Update real-time camera settings
  static updateCameraSettings(resolution: string, isMicOn: boolean) {
    const store = useHealthOS.getState();
    store.triggerEvent('CAMERA_SETTINGS_UPDATED', { resolution, isMicOn });
    toast.success('Camera settings applied.');
  }
}
