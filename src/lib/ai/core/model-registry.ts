export interface ModelDefinition {
  id: string;
  providerId: string;
  contextWindow: number;
  costPer1kTokens: number;
  supportsVision: boolean;
}

export class ModelRegistry {
  private static models: Map<string, ModelDefinition> = new Map([
    ['gpt-4o', { id: 'gpt-4o', providerId: 'openai', contextWindow: 128000, costPer1kTokens: 0.01, supportsVision: true }],
    ['claude-3-5-sonnet-20240620', { id: 'claude-3-5-sonnet-20240620', providerId: 'anthropic', contextWindow: 200000, costPer1kTokens: 0.015, supportsVision: true }],
    ['gemini-1.5-pro', { id: 'gemini-1.5-pro', providerId: 'gemini', contextWindow: 1000000, costPer1kTokens: 0.007, supportsVision: true }],
    ['poolside-v1', { id: 'poolside-v1', providerId: 'poolside', contextWindow: 128000, costPer1kTokens: 0.008, supportsVision: false }],
    ['google/gemini-2.5-flash', { id: 'google/gemini-2.5-flash', providerId: 'openrouter', contextWindow: 64000, costPer1kTokens: 0.005, supportsVision: true }]
  ]);

  static getModel(id: string): ModelDefinition | undefined {
    return this.models.get(id);
  }

  static isModelValidForProvider(modelId: string, providerId: string): boolean {
    const model = this.models.get(modelId);
    return model ? model.providerId === providerId : false;
  }

  static getAllModelsForProvider(providerId: string): ModelDefinition[] {
    return Array.from(this.models.values()).filter(m => m.providerId === providerId);
  }
}
