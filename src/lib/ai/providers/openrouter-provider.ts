import { IProvider, ProviderCapabilities, AIRequest } from '../client';

export class OpenRouterProvider implements IProvider {
  public id = 'openrouter';
  
  public capabilities: ProviderCapabilities = {
    name: 'OpenRouter',
    isPremium: false,
    contextWindow: 64000,
    costPer1kTokens: 0.005,
    averageLatencyMs: 1500,
  };

  constructor(private apiKey: string, private defaultModel?: string) {
    if (!this.defaultModel) {
      const models = (require('../core/model-registry').ModelRegistry).getAllModelsForProvider('openrouter');
      this.defaultModel = models.length > 0 ? models[0].id : 'google/gemini-2.5-flash';
    }
  }

  async generate(request: AIRequest, controller: AbortController): Promise<Response> {
    if (!this.apiKey) {
      throw new Error(`[${this.id}] API Key missing`);
    }

    const payload = {
      model: request.model || this.defaultModel,
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens || 4000,
      stream: request.stream !== false,
      response_format: request.response_format,
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': 'https://gama.fit',
        'X-Title': 'GAMA AI Gateway'
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
            if (done) {
              if (buffer) {
                // handle leftover buffer if necessary
              }
              break;
            }
            
            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep the last incomplete line in buffer
            
            for (const line of lines) {
              if (line.includes('[DONE]')) {
                break;
              }
              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]' || !data) continue;
                try {
                  const parsed = JSON.parse(data);
                  const text = parsed.choices?.[0]?.delta?.content;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
                  }
                } catch (e) {
                  // ignore JSON parse errors for incomplete chunks
                }
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
