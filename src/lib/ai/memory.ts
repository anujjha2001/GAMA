import { prisma } from '../prisma';

export async function getUserMemory(profileId: string) {
  try {
    const memory = await prisma.userMemory.findUnique({
      where: { profileId }
    });
    
    return memory;
  } catch (error) {
    console.error(`Failed to fetch user memory for ${profileId}:`, error);
    return null;
  }
}

export async function updateUserMemory(profileId: string, updates: any) {
  try {
    const memory = await prisma.userMemory.upsert({
      where: { profileId },
      update: updates,
      create: {
        profileId,
        ...updates
      }
    });
    return memory;
  } catch (error) {
    console.error(`Failed to update user memory for ${profileId}:`, error);
    throw error;
  }
}
