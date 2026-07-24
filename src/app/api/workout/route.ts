import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';
import crypto from 'crypto';

// Helper to get or create default user in dev/demo mode
async function getOrInitUser(userId: string | undefined, email: string | undefined) {
  if (userId) {
    const user = await prisma.userProfile.findUnique({ where: { id: userId } });
    if (user) return user;
  }
  
  // Fallback to default user
  let defaultUser = await prisma.userProfile.findFirst({
    where: { email: email || 'test@gama.com' }
  });
  
  if (!defaultUser) {
    defaultUser = await prisma.userProfile.create({
      data: {
        userId: crypto.randomUUID(),
        email: email || 'test@gama.com',
        fullName: 'Test User',
        role: 'user',
        settings: {
          create: {
            theme: 'dark'
          }
        }
      }
    });
  }
  return defaultUser;
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req).catch(() => null);
    const body = await req.json().catch(() => ({}));
    
    // Auto-authenticate default if not signed in (for easy development/testing)
    const user = await getOrInitUser(decoded?.id, body.email);

    const {
      exerciseName,
      difficulty,
      durationSec,
      caloriesBurned,
      repCount,
      avgAccuracy,
      muscleLoad = {},
      sets = []
    } = body;

    if (!exerciseName) {
      return NextResponse.json({ success: false, error: 'Exercise name is required.' }, { status: 400 });
    }

    // 1. Create WorkoutSession
    const session = await prisma.workoutSession.create({
      data: {
        profileId: user.id,
        exerciseName,
        difficulty: difficulty || 'BEGINNER',
        durationSec: durationSec || 0,
        caloriesBurned: caloriesBurned || 0,
        repCount: repCount || 0,
        avgAccuracy: avgAccuracy || 1.0,
        muscleLoad: muscleLoad || {},
        safetyFlags: [],
        jointAngleLogs: {},
        sets: {
          create: sets.map((s: any) => ({
            setNumber: s.setNumber,
            weightKg: parseFloat(s.weightKg) || 0,
            reps: s.reps || 0,
            completedReps: s.completedReps || 0,
            avgAccuracy: s.avgAccuracy || 1.0
          }))
        }
      },
      include: {
        sets: true
      }
    });

    // 2. Log Calorie Expenditure
    if (caloriesBurned > 0) {
      await prisma.calorieLog.create({
        data: {
          profileId: user.id,
          type: 'BURNED',
          amount: caloriesBurned,
          source: `Workout: ${exerciseName}`
        }
      });
    }

    // 3. Update Muscle Recovery & Fatigue Level
    const muscles = Object.keys(muscleLoad).length > 0
      ? Object.keys(muscleLoad)
      : ['Quadriceps', 'Glutes'];

    for (const m of muscles) {
      const currentFatigue = 60; // Initial simulated post-workout fatigue
      const recoveryHours = 24; // 24 hours to recover
      
      await prisma.muscleRecovery.upsert({
        where: {
          profileId_muscleGroup: {
            profileId: user.id,
            muscleGroup: m
          }
        },
        update: {
          fatigueLevel: 0.6,
          recoveryRatePercent: 40.0,
          lastWorkedAt: new Date(),
          estimatedReadyAt: new Date(Date.now() + recoveryHours * 60 * 60 * 1000)
        },
        create: {
          profileId: user.id,
          muscleGroup: m,
          fatigueLevel: 0.6,
          recoveryRatePercent: 40.0,
          lastWorkedAt: new Date(),
          estimatedReadyAt: new Date(Date.now() + recoveryHours * 60 * 60 * 1000)
        }
      });
    }

    // 4. Check & Log Personal Records (PR)
    const maxWeightInSets = sets.length > 0
      ? Math.max(...sets.map((s: any) => parseFloat(s.weightKg) || 0))
      : 0;

    if (maxWeightInSets > 0) {
      const existingPR = await prisma.personalRecord.findFirst({
        where: {
          profileId: user.id,
          exerciseName,
          metricType: 'MAX_WEIGHT'
        }
      });

      if (!existingPR || maxWeightInSets > existingPR.value) {
        await prisma.personalRecord.create({
          data: {
            profileId: user.id,
            exerciseName,
            metricType: 'MAX_WEIGHT',
            value: maxWeightInSets
          }
        });
      }
    }

    // 5. Update AURA Workout Memory
    const currentMemory = await prisma.auraWorkoutMemory.findUnique({
      where: { profileId: user.id }
    });

    const preferredList = currentMemory
      ? Array.from(new Set([...currentMemory.preferredExercises, exerciseName]))
      : [exerciseName];

    await prisma.auraWorkoutMemory.upsert({
      where: { profileId: user.id },
      update: {
        preferredExercises: preferredList,
        trainingFrequency: (currentMemory?.trainingFrequency || 0) + 1,
        updatedAt: new Date()
      },
      create: {
        profileId: user.id,
        preferredExercises: preferredList,
        trainingFrequency: 1,
        strengthProgression: {},
        weakMuscles: [],
        goals: ['Strength Build'],
        recoveryNotes: ['Initial Recovery Tracking'],
        injuryNotes: []
      }
    });

    // 6. Generate Nutrition Post-Workout recommendation log
    const proteinG = Math.round(25 + durationSec * 0.005);
    const carbsG = Math.round(40 + caloriesBurned * 0.1);
    
    await prisma.nutritionRecommendation.create({
      data: {
        profileId: user.id,
        proteinGrams: proteinG,
        carbsGrams: carbsG,
        fatGrams: 15,
        waterMl: 1000,
        mealSuggestions: [
          `Post-workout Quinoa Bowl with grilled chicken (${proteinG}g Protein, ${carbsG}g Carbs)`,
          'Greek Yogurt with wild berries & raw honey'
        ],
        recoveryFoods: ['Quinoa', 'Greek Yogurt', 'Avocados', 'Bananas'],
        shoppingList: ['Kale', 'Quinoa', 'Lean chicken breast', 'Greek yogurt']
      }
    });

    // 7. Push a new timeline event
    await prisma.timelineEvent.create({
      data: {
        profileId: user.id,
        type: 'WORKOUT',
        title: `Completed ${exerciseName}`,
        description: `Logged ${sets.length} sets. Form accuracy averaged ${Math.round(avgAccuracy * 100)}%. Expended ${caloriesBurned} kcal.`,
        metadata: {
          sessionId: session.id,
          avgAccuracy,
          repCount
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Workout session registered successfully.',
      session
    });
  } catch (error: any) {
    console.error('[Workout OS API Endpoint Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req).catch(() => null);
    const user = await getOrInitUser(decoded?.id, undefined);

    const history = await prisma.workoutSession.findMany({
      where: { profileId: user.id },
      orderBy: { recordedAt: 'desc' },
      take: 20,
      include: { sets: true }
    });

    const prs = await prisma.personalRecord.findMany({
      where: { profileId: user.id }
    });

    const recovery = await prisma.muscleRecovery.findMany({
      where: { profileId: user.id }
    });

    const nutrition = await prisma.nutritionRecommendation.findMany({
      where: { profileId: user.id },
      orderBy: { generatedAt: 'desc' },
      take: 1
    });

    const timeline = await prisma.timelineEvent.findMany({
      where: { profileId: user.id },
      orderBy: { timestamp: 'desc' },
      take: 5
    });

    return NextResponse.json({
      success: true,
      data: {
        history,
        prs,
        recovery,
        latestNutrition: nutrition[0] || null,
        timeline
      }
    });
  } catch (error: any) {
    console.error('[Workout OS GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
