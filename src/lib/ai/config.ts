/**
 * Centralized AI Configuration
 * Replacing Groq with Unified Poolside & OpenRouter architecture.
 */

const getOpenRouterKey = (): string => {
  return (
    process.env.OPENROUTER_API_KEY ||
    process.env.Google_Places_API ||
    process.env.Edamam_API ||
    process.env.Indian_Food_Composition_Tables ||
    process.env.FatSecret_Platform_API ||
    process.env.Open_FoodFacts_API ||
    ''
  );
};

export const AI_CONFIG = {
  defaultProvider: (process.env.DEFAULT_AI_PROVIDER || 'openrouter') as 'poolside' | 'openrouter',
  providers: {
    poolside: {
      baseURL: 'https://api.poolside.ai/v1',
      defaultModel: process.env.DEFAULT_MODEL || 'poolside-llama-3',
      apiKey: process.env.POOLSIDE_API_KEY || ''
    },
    openrouter: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultModel: process.env.DEFAULT_MODEL || 'meta-llama/llama-3.3-70b-instruct',
      apiKey: getOpenRouterKey()
    }
  },
  timeoutMs: 30000,
  maxRetries: 3,
  temperature: 0.7,
  maxTokens: 8000
};
