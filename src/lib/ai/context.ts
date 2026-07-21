import { AURAContext } from './types';
import { getUserMemory } from './memory';

export async function gatherAURAContext(
  profileId: string, 
  dashboardState: any, 
  memoryTags: string[]
): Promise<AURAContext> {
  const memory = await getUserMemory(profileId);
  
  return {
    userId: "mock_user_id",
    profileId,
    memory: memory || { tags: memoryTags },
    recentMeals: dashboardState?.meals || [],
    recentWorkouts: dashboardState?.workouts || [],
    recentSleep: dashboardState?.sleep || [],
    goals: dashboardState?.goals || []
  };
}
