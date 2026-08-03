import { prisma } from '@/lib/prisma';
import { searchKnowledgeBase } from '../retrieval';

export class ContextBuilder {
  /**
   * Builds a rich, dynamic system prompt by pulling from multiple Memory Layers.
   * Semantic Retrieval is supported via knowledge base vector search, and database
   * records are retrieved conditionally to keep context efficient and scalable.
   */
  static async buildSystemPrompt(userId: string, currentQuery: string): Promise<string> {
    const queryLower = currentQuery.toLowerCase();
    
    // Layer 1: Working Memory (User Profile, settings, and general preferences)
    const profile = await prisma.userProfile.findUnique({
      where: { id: userId },
      include: {
        settings: true,
        userMemory: true,
        preferences: true
      }
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

    // Layer 2: Recent Conversations (History)
    if (queryLower.includes('history') || queryLower.includes('chat') || queryLower.includes('previous') || queryLower.includes('conversations')) {
      const recentConversations = await prisma.aIConversation.findMany({
        where: { profileId: userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        }
      });
      if (recentConversations.length > 0) {
        context += `\n--- RECENT CONVERSATIONS ---\n`;
        recentConversations.forEach(c => {
          context += `- "${c.title}" (ID: ${c.id}) - Latest message snippet: "${c.messages[0]?.content?.substring(0, 80) || ''}..."\n`;
        });
      }
    }

    // Layer 3: Health Records & Health Timeline
    if (queryLower.includes('health') || queryLower.includes('timeline') || queryLower.includes('vital') || queryLower.includes('stress') || queryLower.includes('heart') || queryLower.includes('hrv')) {
      const latestVitals = await prisma.healthRecord.findFirst({
        where: { profileId: userId },
        orderBy: { recordedAt: 'desc' }
      });
      if (latestVitals) {
        context += `\n--- LATEST HEALTH RECORD & VITALS ---\n`;
        context += `Heart Rate: ${latestVitals.heartRate || 'N/A'} bpm\n`;
        context += `HRV: ${latestVitals.hrv || 'N/A'} ms\n`;
        context += `Blood Pressure: ${latestVitals.bloodPressure || 'N/A'}\n`;
        context += `Weight: ${latestVitals.weight || 'N/A'} kg\n`;
        context += `Stress Level: ${latestVitals.stressLevel || 'N/A'}/100\n`;
      }

      const timelineEvents = await prisma.timelineEvent.findMany({
        where: { profileId: userId },
        orderBy: { timestamp: 'desc' },
        take: 3
      });
      if (timelineEvents.length > 0) {
        context += `\n--- HEALTH TIMELINE ---\n`;
        timelineEvents.forEach(e => {
          context += `- [${e.timestamp.toDateString()}] ${e.title}: ${e.description}\n`;
        });
      }
    }

    // Layer 4: Medical Reports & Documents
    if (queryLower.includes('medical') || queryLower.includes('report') || queryLower.includes('document') || queryLower.includes('scan') || queryLower.includes('blood') || queryLower.includes('lab')) {
      const latestReport = await prisma.medicalDocument.findFirst({
        where: { userId, processingStatus: 'COMPLETED' },
        orderBy: { reportDate: 'desc' },
        include: { analysis: true }
      });
      if (latestReport && latestReport.analysis) {
        context += `\n--- LATEST MEDICAL REPORT ---\n`;
        context += `Report: ${latestReport.title}\n`;
        context += `Category: ${latestReport.category || 'N/A'}\n`;
        context += `Overall Health Score: ${latestReport.analysis.overallHealthScore}/100\n`;
        context += `Summary: ${latestReport.analysis.summary}\n`;
        context += `Biomarkers parsed: ${JSON.stringify(latestReport.analysis.structuredData || {})}\n`;
      }
    }

    // Layer 5: Food History & Nutrition Logs
    if (queryLower.includes('food') || queryLower.includes('meal') || queryLower.includes('eat') || queryLower.includes('nutrition') || queryLower.includes('calories') || queryLower.includes('diet')) {
      const recentMeals = await prisma.meal.findMany({
        where: { profileId: userId },
        orderBy: { loggedAt: 'desc' },
        take: 3
      });
      if (recentMeals.length > 0) {
        context += `\n--- RECENT MEALS & NUTRITION ---\n`;
        recentMeals.forEach(m => {
          context += `- ${m.name} (${m.type}): ${m.totalCals} cals, P: ${m.totalProtein}g, C: ${m.totalCarbs}g, F: ${m.totalFat}g\n`;
        });
      }
    }

    // Layer 6: Workout History & Posture
    if (queryLower.includes('workout') || queryLower.includes('gym') || queryLower.includes('exercise') || queryLower.includes('posture') || queryLower.includes('strength')) {
      const recentWorkouts = await prisma.workout.findMany({
        where: { profileId: userId },
        orderBy: { recordedAt: 'desc' },
        take: 3
      });
      if (recentWorkouts.length > 0) {
        context += `\n--- RECENT WORKOUTS ---\n`;
        recentWorkouts.forEach(w => {
          context += `- ${w.type}: ${w.duration} mins, ${w.caloriesBurned} cals, Intensity: ${w.intensity}\n`;
        });
      }
    }

    // Layer 7: Sleep History
    if (queryLower.includes('sleep') || queryLower.includes('bed') || queryLower.includes('insomnia') || queryLower.includes('rem') || queryLower.includes('deep sleep')) {
      const recentSleep = await prisma.sleepLog.findMany({
        where: { profileId: userId },
        orderBy: { recordedAt: 'desc' },
        take: 3
      });
      if (recentSleep.length > 0) {
        context += `\n--- RECENT SLEEP LOGS ---\n`;
        recentSleep.forEach(s => {
          context += `- Sleep: ${s.durationHours} hrs, Quality Score: ${s.qualityScore}/100 (Deep: ${s.deepSleepMin}m, REM: ${s.remSleepMin}m)\n`;
        });
      }
    }

    // Layer 8: Goals & Devices
    if (queryLower.includes('goal') || queryLower.includes('target') || queryLower.includes('device') || queryLower.includes('watch') || queryLower.includes('tracker')) {
      const activeGoals = await prisma.goal.findMany({
        where: { profileId: userId, completed: false },
        take: 3
      });
      if (activeGoals.length > 0) {
        context += `\n--- ACTIVE HEALTH GOALS ---\n`;
        activeGoals.forEach(g => {
          context += `- Goal: ${g.title} (Category: ${g.category}, Current: ${g.currentValue}, Target: ${g.targetValue} ${g.unit})\n`;
        });
      }

      const connectedDevices = await prisma.deviceConnection.findMany({
        where: { profileId: userId, status: 'CONNECTED' },
        take: 3
      });
      if (connectedDevices.length > 0) {
        context += `\n--- CONNECTED DEVICES ---\n`;
        connectedDevices.forEach(d => {
          context += `- ${d.deviceName} (${d.provider})\n`;
        });
      }
    }

    // Layer 9: Personal Preferences & Family
    if (profile?.preferences && profile.preferences.length > 0) {
      context += `\n--- PERSONAL PREFERENCES ---\n`;
      profile.preferences.forEach(p => {
        context += `- ${p.category}: ${p.value}\n`;
      });
    }

    // Layer 10: Previous AI Recommendations
    if (queryLower.includes('recommendation') || queryLower.includes('advice') || queryLower.includes('suggest')) {
      const prevRecs = await prisma.aIRecommendation.findMany({
        where: { profileId: userId },
        orderBy: { generatedAt: 'desc' },
        take: 3
      });
      if (prevRecs.length > 0) {
        context += `\n--- PREVIOUS RECOMMENDATIONS ---\n`;
        prevRecs.forEach(r => {
          context += `- Recommendation: "${r.text}" (${r.category}, Severity: ${r.severity})\n`;
        });
      }
    }

    // Layer 11: Semantic Vector Memory (RAG)
    if (queryLower.length > 8) {
      const vectorDocs = await searchKnowledgeBase(currentQuery, 2);
      if (vectorDocs && vectorDocs.length > 0) {
        context += `\n--- RETRIEVED SEMANTIC KNOWLEDGE ---\n`;
        vectorDocs.forEach(d => {
          context += `- [Source: ${d.title}] ${d.content}\n`;
        });
      }
    }

    context += `\nAddress the user's latest query using this rich context when relevant. Do not mention that this context was retrieved in a special system block.`;

    return context;
  }
}
