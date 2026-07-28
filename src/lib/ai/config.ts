/**
 * Centralized AI Configuration
 * Replacing Groq with Unified Poolside & OpenRouter architecture.
 */

export const AI_CONFIG = {
  defaultProvider: (process.env.DEFAULT_AI_PROVIDER || 'poolside') as 'poolside' | 'openrouter',
  providers: {
    poolside: {
      baseURL: 'https://api.poolside.ai/v1',
      defaultModel: process.env.DEFAULT_MODEL || 'poolside-llama-3',
      apiKey: process.env.POOLSIDE_API_KEY || ''
    },
    openrouter: {
      baseURL: 'https://openrouter.ai/api/v1',
      defaultModel: process.env.DEFAULT_MODEL || 'meta-llama/llama-3.3-70b-instruct',
      apiKey: process.env.OPENROUTER_API_KEY || ''
    }
  },
  timeoutMs: 30000,
  maxRetries: 3,
  temperature: 0.7,
  maxTokens: 8000
};
