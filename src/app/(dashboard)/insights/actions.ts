'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function simulateAnomaly() {
  const user = await prisma.userProfile.findUnique({
    where: { email: 'test@gama.com' }
  });

  if (!user) throw new Error("Test user not found");

  // Create an Alert
  const alert = await prisma.alert.create({
    data: {
      profileId: user.id,
      title: "Dehydration Wave Detected",
      message: "Your heart rate average rose to 76 BPM during passive sitting intervals. Combined with current weather conditions, AURA identifies a moderate cellular dehydration risk.",
      severity: "critical",
      metricSource: "heartRate"
    }
  });

  // Create a Timeline Event to log this
  await prisma.timelineEvent.create({
    data: {
      profileId: user.id,
      type: "anomaly",
      title: "Dehydration Wave",
      description: "Triggered a critical cardiovascular alert.",
      metadata: { impactValue: "+12 BPM Rest", impactType: "negative" }
    }
  });

  revalidatePath('/insights');
  return { success: true, alert };
}

export async function resolveAnomaly(alertId: string) {
  const user = await prisma.userProfile.findUnique({
    where: { email: 'test@gama.com' }
  });

  if (!user) throw new Error("Test user not found");

  await prisma.alert.update({
    where: { id: alertId },
    data: { isRead: true } // resolved
  });

  // Log resolution in timeline
  await prisma.timelineEvent.create({
    data: {
      profileId: user.id,
      type: "resolution",
      title: "Anomaly Resolved",
      description: "Dehydration wave mitigated via user action.",
      metadata: { impactValue: "Stabilized", impactType: "positive" }
    }
  });

  revalidatePath('/insights');
  return { success: true };
}
