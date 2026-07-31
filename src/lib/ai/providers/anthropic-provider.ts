import { IProvider, ProviderCapabilities, AIRequest } from '../client';

export class AnthropicProvider implements IProvider {
  public id = 'anthropic';
  
  public capabilities: ProviderCapabilities = {
    name: 'Anthropic (Claude 3.5 Sonnet)',
    isPremium: true,
    contextWindow: 200000,
    costPer1kTokens: 0.015,
    averageLatencyMs: 1400,
  };

  constructor(private apiKey: string, private defaultModel: string = 'claude-3-5-sonnet-20240620') {}

  async generate(request: AIRequest, controller: AbortController): Promise<Response> {
    if (!this.apiKey) {
      throw new Error(`[${this.id}] API Key missing`);
    }

    // Anthropic requires the system prompt to be at the root level, not in the messages array
    let systemPrompt = '';
    const anthropicMessages = request.messages.filter(msg => {
      if (msg.role === 'system') {
        systemPrompt += (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content)) + '\n';
        return false;
      }
      return true;
    });

    const payload = {
      model: request.model || this.defaultModel,
      system: systemPrompt.trim(),
      messages: anthropicMessages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens || 4096, // Anthropic requires max_tokens
      stream: request.stream !== false,
    };

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01'
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
    const content = data.content?.[0]?.text || '';
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
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6).trim();
                if (!dataStr) continue;
                try {
                  const data = JSON.parse(dataStr);
                  if (data.type === 'content_block_delta' && data.delta?.type === 'text_delta') {
                    controller.enqueue(encoder.encode(data.delta.text));
                  }
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
