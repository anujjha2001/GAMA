import { IProvider, ProviderCapabilities, AIRequest } from '../client';

export class OpenAIProvider implements IProvider {
  public id = 'openai';
  
  public capabilities: ProviderCapabilities = {
    name: 'OpenAI',
    isPremium: true,
    contextWindow: 128000,
    costPer1kTokens: 0.01,
    averageLatencyMs: 800,
  };

  constructor(private apiKey: string) {}

  async generate(request: AIRequest, controller: AbortController): Promise<Response> {
    if (!this.apiKey) {
      throw new Error(`[${this.id}] API Key missing`);
    }

    const payload = {
      model: request.model || 'gpt-4o',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens,
      stream: request.stream !== false,
      response_format: request.response_format,
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
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
    
    // Non-streaming response parsing
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

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n').filter(line => line.trim() !== '');
            
            for (const line of lines) {
              if (line.includes('[DONE]')) {
                break;
              }
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') break;
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
