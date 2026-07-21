import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Upsert test user safely — avoids duplicate create on concurrent requests
    const user = await prisma.userProfile.upsert({
      where: { email: 'test@gama.com' },
      create: {
        userId: 'test-user-id-gama-1',
        email: 'test@gama.com',
        fullName: 'Test User',
        role: 'user'
      },
      update: {}
    });

    // 2. Run all reads in parallel — they are fully independent
    const [
      activeAnomaly,
      telemetry,
      history,
      insights,
      recoveryLogs,
      burnoutLogs,
      memoryNodes
    ] = await Promise.all([
      prisma.alert.findFirst({
        where: { profileId: user.id, isRead: false },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.healthRecord.findFirst({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' }
      }),
      prisma.timelineEvent.findMany({
        where: { profileId: user.id },
        orderBy: { timestamp: 'desc' },
        take: 10
      }),
      prisma.healthInsight.findMany({
        where: { profileId: user.id },
        orderBy: { detectedAt: 'desc' },
        take: 5
      }),
      prisma.recoveryScoreLog.findMany({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' },
        take: 5
      }),
      prisma.burnoutScoreLog.findMany({
        where: { profileId: user.id },
        orderBy: { recordedAt: 'desc' },
        take: 5
      }),
      prisma.memoryNode.findMany({
        where: { profileId: user.id },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const safeTelemetry = telemetry || {
      hrv: 62,
      stressLevel: 2.4,
      oxygenLevel: 98,
      heartRate: 65,
      bloodPressure: '120/80',
      vitalityScore: 95
    };

    return NextResponse.json({
      activeAnomaly,
      telemetry: safeTelemetry,
      history,
      insights,
      recoveryLogs,
      burnoutLogs,
      memoryNodes
    });

  } catch (error: any) {
    console.error('[insights] Error fetching data:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
