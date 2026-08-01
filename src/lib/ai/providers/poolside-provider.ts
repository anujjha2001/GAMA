import { IProvider, ProviderCapabilities, AIRequest } from '../client';

export class PoolsideProvider implements IProvider {
  public id = 'poolside';
  
  public capabilities: ProviderCapabilities = {
    name: 'Poolside',
    isPremium: true,
    contextWindow: 128000,
    costPer1kTokens: 0.008,
    averageLatencyMs: 900,
  };

  constructor(private apiKey: string, private defaultModel?: string) {
    if (!this.defaultModel) {
      const models = (require('../core/model-registry').ModelRegistry).getAllModelsForProvider('poolside');
      this.defaultModel = models.length > 0 ? models[0].id : 'poolside-v1';
    }
  }

  async generate(request: AIRequest, controller: AbortController): Promise<Response> {
    if (!this.apiKey) {
      throw new Error(`[${this.id}] API Key missing`);
    }

    let model = request.model || this.defaultModel || 'poolside-v1';
    if (!model.startsWith('poolside-')) {
      model = this.defaultModel || 'poolside-v1';
    }

    const payload = {
      model: model,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens,
      stream: request.stream !== false,
      response_format: request.response_format,
    };

    const response = await fetch('https://api.poolside.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[${this.id}] HTTP ${response.status}: ${err}`);
    }

    if (payload.stream) {
      return this.normalizeStream(response);
    }
    
    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    return new Response(new ReadableStream({
      start(ctrl) {
        ctrl.enqueue(new TextEncoder().encode(content));
        ctrl.close();
      }
    }));
  }

  private normalizeStream(response: Response): Response {
    if (!response.body) throw new Error("No response body");
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buffer = '';

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.includes('[DONE]')) break;
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]' || !data) continue;
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.choices?.[0]?.delta?.content;
                  if (text) controller.enqueue(encoder.encode(text));
                } catch (e) { }
              }
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, { headers: { 'Content-Type': 'text/plain' } });
  }
}
