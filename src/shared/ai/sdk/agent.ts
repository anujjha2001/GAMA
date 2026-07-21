export interface AgentDefinition {
  id: string;
  name: string;
  systemPrompt: string;
  temperature?: number;
}

export function registerAgent(agent: AgentDefinition): AgentDefinition {
  return agent;
}
