import { prisma } from "@/lib/prisma";

export class HealthMemoryService {
  static async extractMemory(profileId: string, contextText: string) {
    console.log(`[HealthMemoryService] Extracting memory for profile: ${profileId}`);
    // Mock memory node creation
    return await prisma.memoryNode.create({
      data: {
        profileId,
        label: "Prefers Morning Workouts",
        category: "workout_preference",
        confidence: 0.95,
      }
    });
  }
}
