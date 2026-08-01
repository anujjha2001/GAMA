/**
 * Centralized AI Configuration
 * Enterprise Architecture with multi-provider failover.
 */

export const AI_CONFIG = {
  providers: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY || ''
    },
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || ''
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || ''
    },
    poolside: {
      apiKey: process.env.POOLSIDE_API_KEY || ''
    },
    openrouter: {
      apiKey: process.env.OPENROUTER_API_KEY || ''
    }
  },
  circuitBreaker: {
    failureThreshold: 3,
    cooldownMs: 30000,
    timeoutMs: 15000
  },
  timeoutMs: 30000,
  maxRetries: 3,
  temperature: 0.7,
  maxTokens: 8000
};
