export type IntentCategory = 
  | 'nutrition' 
  | 'fitness' 
  | 'medical' 
  | 'sleep' 
  | 'mental_health' 
  | 'dashboard' 
  | 'general';

export interface AURAIntent {
  category: IntentCategory;
  requiresTools: boolean;
  suggestedTools: string[];
  confidence: number;
}

export interface AURAContext {
  userId: string;
  profileId: string;
  recentMeals?: any[];
  recentWorkouts?: any[];
  recentSleep?: any[];
  goals?: any[];
  memory?: any;
}

export interface ToolResult {
  toolName: string;
  data?: any;
  error?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content: string;
  tool_calls?: any[];
  tool_call_id?: string;
  name?: string;
}

export interface AURAConversationHistory {
  messages: AIMessage[];
}
