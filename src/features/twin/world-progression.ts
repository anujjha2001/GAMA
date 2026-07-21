import { WorldState } from './world-state';

export interface MilestoneUnlock {
  level: number;
  featureName: string;
  requirement: string;
}

export class WorldProgression {
  static milestones: MilestoneUnlock[] = [
    { level: 1, featureName: 'CAMPFIRE', requirement: 'Base recovery level' },
    { level: 2, featureName: 'BRIDGE', requirement: 'Maintain recovery > 60 for 3 days' },
    { level: 3, featureName: 'LANTERNS', requirement: 'Average stress < 4 for 5 days' },
    { level: 4, featureName: 'CABIN', requirement: 'Sleep target met 4 times this week' },
    { level: 5, featureName: 'PET_COMPANION', requirement: 'Consistent hydration score above 85%' }
  ];

  static getWorldProgress(unlockedCount: number): { progress: number; currentLevel: number } {
    const total = this.milestones.length;
    const progress = Math.min(100, Math.floor((unlockedCount / total) * 100));
    const currentLevel = Math.max(1, Math.min(total, unlockedCount));

    return { progress, currentLevel };
  }
}
