export const AI_CONFIG = {
  providers: {
    groq: {
      baseURL: 'https://api.groq.com/openai/v1',
      defaultModel: 'llama-3.3-70b-versatile',
      fallbackModels: [
        'llama-3.1-8b-instant',
        'mixtral-8x7b-32768',
        'gemma2-9b-it'
      ]
    }
  },
  timeoutMs: 30000,
  maxRetries: 3
};
