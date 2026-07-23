export const AI_CONFIG = {
  defaultProvider: 'poolside',
  providers: {
    poolside: {
      apiKey: process.env.POOLSIDE_API_KEY || '',
      baseURL: process.env.POOLSIDE_API_URL || 'https://inference.poolside.ai/v1',
      defaultModel: 'laguna-s-2.1',
    },
    groq: {
      apiKey: process.env.GROQ_API_KEY || '',
      defaultModel: 'llama-3.3-70b-versatile',
      fallbackModel: 'llama-3.1-8b-instant',
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || '',
      defaultModel: 'gemini-1.5-flash',
      fallbackModel: 'gemini-1.5-pro',
    },
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      defaultModel: 'gpt-4o-mini',
      fallbackModel: 'gpt-4o',
    },
    claude: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      defaultModel: 'claude-3-5-sonnet-20241022',
      fallbackModel: 'claude-3-5-haiku-20241022',
    },
    local: {
      baseURL: process.env.LOCAL_LLM_URL || 'http://localhost:11434/v1',
      defaultModel: 'llama3',
    }
  },
  temperature: 0.3,
  maxTokens: 1024,
  timeoutMs: 30000,
  maxRetries: 3
};
