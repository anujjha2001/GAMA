import { prisma } from '@/lib/prisma';

export class MemoryEngine {
  static async getContextPayload(profileId: string): Promise<string> {
    try {
      const profile = await prisma.userProfile.findUnique({
        where: { id: profileId },
        include: { preferences: true }
      });

      const today = new Date();
      today.setHours(0,0,0,0);

      const latestSleep = await prisma.sleepLog.findFirst({
        where: { profileId },
        orderBy: { recordedAt: 'desc' }
      });

      const todayMeals = await prisma.meal.findMany({
        where: {
          profileId,
          loggedAt: { gte: today }
        }
      });

      let block = `User Name: ${profile?.fullName || 'User'}\n`;
      if (latestSleep) {
        block += `- Last Sleep: ${latestSleep.durationHours} hours (Score: ${latestSleep.qualityScore})\n`;
      }
      if (todayMeals.length > 0) {
        block += `- Today's Meals: ${todayMeals.map(m => m.name).join(', ')}\n`;
      }
      if (profile?.preferences && profile.preferences.length > 0) {
        block += `- User Preferences: ${profile.preferences.map(p => `${p.category}: ${p.value}`).join('; ')}\n`;
      }

      return block;
    } catch (e) {
      console.error('[MemoryEngine] failed to construct context:', e);
      return '';
    }
  }
}
