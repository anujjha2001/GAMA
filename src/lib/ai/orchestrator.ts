import { AI_CONFIG } from './config';
import { AIRequest, AIResponse, AIProvider } from './client';

/**
 * Base Fetch Provider that implements standard OpenAI-compatible API schemas.
 * Used by both Poolside and OpenRouter.
 */
class FetchProvider implements AIProvider {
  constructor(
    public readonly name: string,
    private readonly baseURL: string,
    private readonly defaultModel: string,
    private readonly apiKey: string
  ) {}

  async generate(request: AIRequest): Promise<AIResponse> {
    if (!this.apiKey) {
      throw new Error(`[${this.name}] AI Provider Authentication Failed: API Key missing`);
    }

    const payload = {
      model: request.model || this.defaultModel,
      messages: request.messages,
      temperature: request.temperature ?? AI_CONFIG.temperature,
      max_tokens: request.max_tokens ?? AI_CONFIG.maxTokens,
      response_format: request.response_format,
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`
    };

    if (this.name === 'OpenRouter') {
      headers['HTTP-Referer'] = 'https://gama.fit';
      headers['X-Title'] = 'GAMA AI Orchestrator';
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        if (response.status === 401) {
          throw new Error(`[${this.name}] AI Provider Authentication Failed`);
        }
        if (response.status === 429) {
          throw new Error(`[${this.name}] Provider Rate Limited`);
        }
        throw new Error(`[${this.name}] Provider API Error ${response.status}: ${errText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content ?? '{}';

      return {
        content,
        usage: {
          promptTokens: data.usage?.prompt_tokens || 0,
          completionTokens: data.usage?.completion_tokens || 0
        },
        provider: this.name,
        model: payload.model
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error(`[${this.name}] Provider Request Timed Out`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

export class AIOrchestrator {
  private static providers: AIProvider[] = [
    new FetchProvider('Poolside', AI_CONFIG.providers.poolside.baseURL, AI_CONFIG.providers.poolside.defaultModel, AI_CONFIG.providers.poolside.apiKey),
    new FetchProvider('OpenRouter', AI_CONFIG.providers.openrouter.baseURL, AI_CONFIG.providers.openrouter.defaultModel, AI_CONFIG.providers.openrouter.apiKey)
  ];

  static async generate(request: AIRequest): Promise<AIResponse> {
    const errors: string[] = [];

    // Prioritize configured default provider, fallback to others
    const orderedProviders = [
      ...this.providers.filter(p => p.name.toLowerCase() === AI_CONFIG.defaultProvider),
      ...this.providers.filter(p => p.name.toLowerCase() !== AI_CONFIG.defaultProvider)
    ];

    for (const provider of orderedProviders) {
      const startMs = Date.now();
      try {
        const response = await provider.generate(request);
        const latency = Date.now() - startMs;
        
        // Structured Logging
        console.log(JSON.stringify({
          event: 'ai_orchestrator_generate',
          provider: response.provider,
          model: response.model,
          latencyMs: latency,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          fallbackUsed: provider.name.toLowerCase() !== AI_CONFIG.defaultProvider,
          retryCount: errors.length
        }));

        return response;
      } catch (err: any) {
        errors.push(err.message);
        console.warn(`[AIOrchestrator] ${provider.name} failed. Attempting next provider... Reason:`, err.message);
      }
    }

    // All providers failed
    console.error(`[AIOrchestrator] All providers failed. Errors: ${errors.join(' | ')}`);
    throw new Error('AI Provider Temporarily Unavailable');
  }
}
