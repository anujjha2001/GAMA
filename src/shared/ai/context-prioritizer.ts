export interface ContextItem {
  type: 'conversation' | 'today_health' | 'active_goals' | 'recent_reports' | 'preferences' | 'archived';
  content: string;
  priority: number;
}

export class ContextPrioritizer {
  static prioritize(items: ContextItem[]): ContextItem[] {
    const priorityMap = {
      conversation: 1,
      today_health: 2,
      active_goals: 3,
      recent_reports: 4,
      preferences: 5,
      archived: 6
    };

    return [...items].sort((a, b) => {
      const pA = priorityMap[a.type] || 99;
      const pB = priorityMap[b.type] || 99;
      return pA - pB;
    });
  }

  static buildPromptBlock(items: ContextItem[]): string {
    const sorted = this.prioritize(items);
    return sorted.map(item => `[${item.type.toUpperCase()}]: ${item.content}`).join('\n');
  }
}
