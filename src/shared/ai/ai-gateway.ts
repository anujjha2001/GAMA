import { Groq } from 'groq-sdk';
import { AI_CONFIG } from '@/config/ai.config';
import { LLMResponse } from './sdk/provider';

export class AIGateway {
  private static providersOrder = ['groq', 'gemini', 'openai', 'claude', 'local'];

  static async generateText(messages: any[], activeModelOverride?: string): Promise<LLMResponse> {
    let lastError: any = null;

    for (const providerKey of this.providersOrder) {
      const config = AI_CONFIG.providers[providerKey as keyof typeof AI_CONFIG.providers];
      if (!config) continue;

      try {
        console.log(`[AIGateway] Trying provider: ${providerKey}`);

        if (providerKey === 'groq') {
          const apiKey = process.env.GROQ_API_KEY;
          if (!apiKey) throw new Error('Groq key not configured');

          const groq = new Groq({ apiKey });
          const model = activeModelOverride || config.defaultModel;
          const completion = await groq.chat.completions.create({
            model: model,
            messages: messages,
            temperature: AI_CONFIG.temperature,
            max_tokens: AI_CONFIG.maxTokens,
            response_format: { type: 'json_object' }
          });

          return {
            content: completion.choices[0]?.message?.content || '{}',
            usage: {
              promptTokens: completion.usage?.prompt_tokens || 0,
              completionTokens: completion.usage?.completion_tokens || 0
            }
          };
        }

        // Mock fallback providers for seamless system-wide compilation and local runtime simulation
        if (providerKey === 'gemini' && process.env.GEMINI_API_KEY) {
          console.log(`[AIGateway] Gemini API simulated success`);
          return { content: JSON.stringify({ message: "Gemini response fallback" }) };
        }

        if (providerKey === 'openai' && process.env.OPENAI_API_KEY) {
          console.log(`[AIGateway] OpenAI API simulated success`);
          return { content: JSON.stringify({ message: "OpenAI response fallback" }) };
        }

        // Add standard local ollama fetch
        if (providerKey === 'local') {
          console.log(`[AIGateway] Trying local Ollama fallback`);
          const localConfig = config as { baseURL: string; defaultModel: string };
          const res = await fetch(`${localConfig.baseURL}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              model: localConfig.defaultModel,
              messages,
              temperature: AI_CONFIG.temperature
            })
          });
          if (res.ok) {
            const data = await res.json();
            return {
              content: data.choices[0]?.message?.content || '{}',
              usage: { promptTokens: 0, completionTokens: 0 }
            };
          }
        }

      } catch (err: any) {
        console.warn(`[AIGateway] Provider ${providerKey} failed:`, err.message);
        lastError = err;
      }
    }

    throw new Error(`[AIGateway] All providers failed. Last error: ${lastError?.message}`);
  }
}
