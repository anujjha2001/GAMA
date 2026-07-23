import { Capability } from './sdk/capability';
import { ToolSchema } from './sdk/tool';

export const CAPABILITY_REGISTRY: Record<string, Capability> = {
  voice: {
    id: 'voice',
    name: 'Voice Assistant Core',
    enabled: true,
    tools: []
  },
  'meal-planner': {
    id: 'meal-planner',
    name: 'Meal Planner & Guide',
    enabled: true,
    tools: [
      {
        name: 'navigate_meal_guide',
        description: 'Navigate to the meal guide planner.',
        parameters: { type: 'object', properties: {} },
        keywords: ['meal', 'meals', 'food', 'diet', 'hungry', 'eat', 'dinner', 'lunch', 'breakfast', 'recipe', 'recipes'],
        handler: async () => ({ action: 'NAVIGATE', payload: '/meals' })
      }
    ]
  },
  'food-scanner': {
    id: 'food-scanner',
    name: 'Food Plate Scanner',
    enabled: true,
    tools: [
      {
        name: 'trigger_scanner',
        description: 'Trigger food recognition scanner.',
        parameters: { type: 'object', properties: {} },
        keywords: ['scan', 'scanner', 'camera', 'photo', 'identify food', 'food picture'],
        handler: async () => ({ action: 'TRIGGER_SCANNER' })
      }
    ]
  },
  'health-vault': {
    id: 'health-vault',
    name: 'Secure Medical Reports Vault',
    enabled: true,
    tools: [
      {
        name: 'navigate_vault',
        description: 'Navigate to health vault.',
        parameters: { type: 'object', properties: {} },
        keywords: ['vault', 'report', 'reports', 'blood report', 'lab report', 'records', 'medical record', 'pdf', 'document'],
        handler: async () => ({ action: 'NAVIGATE', payload: '/vault' })
      }
    ]
  },

  insights: {
    id: 'insights',
    name: 'Health Trends & Insights',
    enabled: true,
    tools: [
      {
        name: 'navigate_insights',
        description: 'View health trends, recovery summaries, and AI recommendations.',
        parameters: { type: 'object', properties: {} },
        keywords: ['insights', 'insight', 'trend', 'trends', 'recommendations', 'analysis', 'progress'],
        handler: async () => ({ action: 'NAVIGATE', payload: '/insights' })
      }
    ]
  }
};

export function getEnabledTools(): ToolSchema[] {
  const tools: ToolSchema[] = [];
  for (const cap of Object.values(CAPABILITY_REGISTRY)) {
    if (cap.enabled) {
      tools.push(...cap.tools);
    }
  }
  return tools;
}
