import { IProvider, ProviderCapabilities, AIRequest } from '../client';

export class GeminiProvider implements IProvider {
  public id = 'gemini';
  
  public capabilities: ProviderCapabilities = {
    name: 'Google Gemini (1.5 Pro)',
    isPremium: true,
    contextWindow: 1000000, // Very large context
    costPer1kTokens: 0.007,
    averageLatencyMs: 1600,
  };

  constructor(private apiKey: string, private defaultModel: string = 'gemini-1.5-pro') {}

  async generate(request: AIRequest, controller: AbortController): Promise<Response> {
    if (!this.apiKey) {
      throw new Error(`[${this.id}] API Key missing`);
    }

    let systemInstruction;
    const contents = request.messages.filter(msg => {
      if (msg.role === 'system') {
        systemInstruction = {
          parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
        };
        return false;
      }
      return true;
    }).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content) }]
    }));

    const payload: any = {
      contents,
      generationConfig: {
        temperature: request.temperature ?? 0.7,
        maxOutputTokens: request.max_tokens,
      }
    };

    if (systemInstruction) {
      payload.systemInstruction = systemInstruction;
    }

    if (request.response_format?.type === 'json_object') {
      payload.generationConfig.responseMimeType = 'application/json';
    }

    const endpoint = request.stream !== false ? 'streamGenerateContent?alt=sse' : 'generateContent';
    
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${request.model || this.defaultModel}:${endpoint}&key=${this.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`[${this.id}] HTTP ${response.status}: ${err}`);
    }

    if (request.stream !== false) {
      return this.normalizeStream(response);
    }
    
    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
                if (!dataStr || dataStr === '[DONE]') continue;
                try {
                  const data = JSON.parse(dataStr);
                  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                  if (text) {
                    controller.enqueue(encoder.encode(text));
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
