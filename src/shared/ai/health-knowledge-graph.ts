export interface GraphNode {
  id: string;
  label: string;
  value: any;
}

export interface GraphEdge {
  from: string;
  to: string;
  relationship: string; // e.g. "increases", "decreases", "influences"
}

export class HealthKnowledgeGraph {
  private static nodes: Record<string, GraphNode> = {
    stress: { id: 'stress', label: 'Stress Level', value: 0 },
    sleep: { id: 'sleep', label: 'Sleep Quality', value: 0 },
    recovery: { id: 'recovery', label: 'Recovery Score', value: 0 },
    workout: { id: 'workout', label: 'Workout Duration', value: 0 },
    nutrition: { id: 'nutrition', label: 'Nutrition Quality', value: 0 },
    heart_rate: { id: 'heart_rate', label: 'Heart Rate & HRV', value: 0 },
    mood: { id: 'mood', label: 'User Mood', value: 0 },
    productivity: { id: 'productivity', label: 'Productivity Level', value: 0 }
  };

  private static edges: GraphEdge[] = [
    { from: 'stress', to: 'sleep', relationship: 'decreases' },
    { from: 'sleep', to: 'recovery', relationship: 'increases' },
    { from: 'workout', to: 'recovery', relationship: 'requires' },
    { from: 'nutrition', to: 'recovery', relationship: 'increases' },
    { from: 'recovery', to: 'workout', relationship: 'enables' },
    { from: 'heart_rate', to: 'recovery', relationship: 'correlates_with' },
    { from: 'recovery', to: 'mood', relationship: 'increases' },
    { from: 'mood', to: 'productivity', relationship: 'increases' }
  ];

  static queryInfluence(factorId: string): string[] {
    const influences = this.edges
      .filter(e => e.from === factorId)
      .map(e => `${this.nodes[e.from]?.label} ${e.relationship} ${this.nodes[e.to]?.label}`);
    
    const influencedBy = this.edges
      .filter(e => e.to === factorId)
      .map(e => `${this.nodes[e.from]?.label} ${e.relationship} ${this.nodes[e.to]?.label}`);

    return [...influences, ...influencedBy];
  }
}
