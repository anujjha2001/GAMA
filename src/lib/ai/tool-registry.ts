export interface ToolDefinition {
  name: string;
  description: string;
  keywords: string[];
  action: {
    type: 'NAVIGATE' | 'TRIGGER_SCANNER' | 'DATABASE_SEARCH' | 'IMAGE_SEARCH' | 'NONE';
    payload?: string;
  };
}

export const TOOL_REGISTRY: ToolDefinition[] = [
  {
    name: 'meal_guide',
    description: 'Open the GAMA Meal Guide and nutrition planner.',
    keywords: ['meal', 'meals', 'food', 'diet', 'hungry', 'eat', 'dinner', 'lunch', 'breakfast', 'recipe', 'recipes'],
    action: { type: 'NAVIGATE', payload: '/meals' }
  },
  {
    name: 'food_scanner',
    description: 'Activate the AI food scanner/camera to scan a meal plate.',
    keywords: ['scan', 'scanner', 'camera', 'photo', 'identify food', 'food picture'],
    action: { type: 'TRIGGER_SCANNER' }
  },
  {
    name: 'digital_twin',
    description: 'Open the Digital Twin 3D human body model.',
    keywords: ['twin', 'body', 'avatar', 'muscles', 'digital twin', 'muscle', 'anatomy', '3d body'],
    action: { type: 'NAVIGATE', payload: '/twin' }
  },
  {
    name: 'health_vault',
    description: 'Open the Secure Health Vault containing medical documents and reports.',
    keywords: ['vault', 'report', 'reports', 'blood report', 'lab report', 'records', 'medical record', 'pdf', 'document'],
    action: { type: 'NAVIGATE', payload: '/vault' }
  },
  {
    name: 'insights',
    description: 'View health trends, recovery summaries, and AI recommendations.',
    keywords: ['insights', 'insight', 'trend', 'trends', 'recommendations', 'analysis', 'progress'],
    action: { type: 'NAVIGATE', payload: '/insights' }
  },
  {
    name: 'schedule',
    description: 'Access the calendar schedule, circadian reminders, and workout logs.',
    keywords: ['schedule', 'calendar', 'reminders', 'reminder', 'todo', 'tasks', 'upcoming', 'circadian'],
    action: { type: 'NAVIGATE', payload: '/schedule' }
  },
  {
    name: 'settings',
    description: 'Open system settings, voice configuration, and privacy controls.',
    keywords: ['settings', 'preferences', 'profile', 'theme', 'privacy', 'logout'],
    action: { type: 'NAVIGATE', payload: '/settings' }
  },
  {
    name: 'dashboard',
    description: 'Go to the primary health dashboard overview.',
    keywords: ['dashboard', 'home', 'overview', 'gama home', 'main page'],
    action: { type: 'NAVIGATE', payload: '/dashboard' }
  }
];

/**
 * Fallback local parser to match voice commands if LLM classification fails
 */
export function matchVoiceCommandFallback(transcript: string): ToolDefinition | null {
  const normalized = transcript.toLowerCase();
  for (const tool of TOOL_REGISTRY) {
    for (const kw of tool.keywords) {
      if (normalized.includes(kw)) {
        return tool;
      }
    }
  }
  return null;
}
