import { prisma } from '@/lib/prisma';

export class ContextBuilder {
  /**
   * Builds a rich, dynamic system prompt by pulling from multiple Memory Layers.
   * Semantic Retrieval will be mocked using Prisma queries for this implementation.
   */
  static async buildSystemPrompt(userId: string, currentQuery: string): Promise<string> {
    
    // Layer 1: Working Memory (User Profile & Settings)
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        userMemory: true
      }
    });

    // Layer 2: Medical Reports (Latest)
    const latestReport = await prisma.medicalDocument.findFirst({
      where: { userId, processingStatus: 'COMPLETED' },
      orderBy: { reportDate: 'desc' },
      include: { analysis: true }
    });

    // Layer 3: Nutrition (Recent Meals)
    const recentMeals = await prisma.meal.findMany({
      where: { profileId: userId },
      orderBy: { loggedAt: 'desc' },
      take: 3
    });

    // Layer 4: Health Records (Vitals)
    const latestVitals = await prisma.healthRecord.findFirst({
      where: { profileId: userId },
      orderBy: { recordedAt: 'desc' }
    });

    let context = `You are Aura, the premium next-generation AI health intelligence layer for GAMA.
You speak like a world-class personal physician and performance coach — precise, warm, and evidence-based.
Format with standard markdown. Never use raw HTML.

--- USER CONTEXT ---
Name: ${profile?.fullName || 'User'}
Units: ${profile?.userMemory?.units || 'metric'}
Diet: ${profile?.userMemory?.dietPreference || 'None specified'}
Allergies: ${profile?.userMemory?.allergies?.join(', ') || 'None specified'}
Fitness Goals: ${profile?.userMemory?.fitnessGoals?.join(', ') || 'None specified'}

`;

    if (latestVitals) {
      context += `--- LATEST VITALS ---\n`;
      context += `Heart Rate: ${latestVitals.heartRate || 'N/A'} bpm\n`;
      context += `Weight: ${latestVitals.weight || 'N/A'}\n`;
      context += `Stress Level: ${latestVitals.stressLevel || 'N/A'}\n\n`;
    }

    if (latestReport && latestReport.analysis) {
      context += `--- LATEST MEDICAL REPORT ---\n`;
      context += `Report: ${latestReport.title}\n`;
      context += `Health Score: ${latestReport.analysis.overallHealthScore}/100\n`;
      context += `Summary: ${latestReport.analysis.summary}\n\n`;
    }

    if (recentMeals.length > 0) {
      context += `--- RECENT MEALS ---\n`;
      recentMeals.forEach(m => {
        context += `- ${m.name} (${m.totalCals} cals, ${m.totalProtein}g protein)\n`;
      });
      context += `\n`;
    }

    context += `Please directly address the user's latest query using this rich context when relevant.`;

    return context;
  }
}
