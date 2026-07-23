import { AI_CONFIG } from '@/config/ai.config';

export interface PoolsideMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface PoolsideOptions {
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  signal?: AbortSignal;
}

export interface PoolsideUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface PoolsideResponse {
  content: string;
  usage?: PoolsideUsage;
}

export class PoolsideProvider {
  private static apiKey = AI_CONFIG.providers.poolside.apiKey;
  private static baseURL = AI_CONFIG.providers.poolside.baseURL;
  private static defaultModel = AI_CONFIG.providers.poolside.defaultModel;

  private static validateRequest(messages: PoolsideMessage[]) {
    if (!messages || messages.length === 0) {
      throw new Error('[Poolside] Request payload must contain at least one message.');
    }
    if (!this.apiKey || this.apiKey === 'MISSING_KEY' || this.apiKey === '') {
      throw new Error('[Poolside] API key is missing. Set POOLSIDE_API_KEY environment variable.');
    }
  }

  private static async fetchWithBackoff(
    url: string,
    options: RequestInit,
    retries: number = AI_CONFIG.maxRetries,
    delay: number = 1000
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        // Handle retriable status codes: 408 (Timeout), 429 (Rate Limit), 5xx (Server Errors)
        const isRetriable = [408, 429, 500, 502, 503, 504].includes(response.status);
        if (isRetriable && retries > 0) {
          console.warn(`[Poolside] Request failed with status ${response.status}. Retrying in ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return await this.fetchWithBackoff(url, options, retries - 1, delay * 2);
        }
        
        let errorMsg = `HTTP Error ${response.status}`;
        try {
          const body = await response.json();
          errorMsg = body.error?.message || body.message || errorMsg;
        } catch {}
        throw new Error(errorMsg);
      }
      return response;
    } catch (error: any) {
      if (retries > 0 && error.name !== 'AbortError') {
        console.warn(`[Poolside] Network failed: ${error.message}. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return await this.fetchWithBackoff(url, options, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  static async generateText(
    messages: PoolsideMessage[],
    options: PoolsideOptions = {}
  ): Promise<PoolsideResponse> {
    this.validateRequest(messages);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
    const signal = options.signal || controller.signal;

    try {
      const payload = {
        model: this.defaultModel,
        messages,
        temperature: options.temperature ?? AI_CONFIG.temperature,
        max_tokens: options.maxTokens ?? AI_CONFIG.maxTokens,
        stream: false,
      };

      const response = await this.fetchWithBackoff(
        `${this.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal,
        }
      );

      clearTimeout(timeoutId);
      const data = await response.json();
      
      const content = data.choices?.[0]?.message?.content || '';
      const usage = {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
      };

      return { content, usage };
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('[Poolside] Request timed out or was cancelled.');
      }
      throw new Error(`[Poolside] Failed to generate response: ${error.message}`);
    }
  }

  static async generateStream(
    messages: PoolsideMessage[],
    onChunk: (text: string) => void,
    options: PoolsideOptions = {}
  ): Promise<void> {
    this.validateRequest(messages);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.timeoutMs);
    const signal = options.signal || controller.signal;

    try {
      const payload = {
        model: this.defaultModel,
        messages,
        temperature: options.temperature ?? AI_CONFIG.temperature,
        max_tokens: options.maxTokens ?? AI_CONFIG.maxTokens,
        stream: true,
      };

      const response = await this.fetchWithBackoff(
        `${this.baseURL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify(payload),
          signal,
        }
      );

      clearTimeout(timeoutId);
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('[Poolside] Response body is not readable.');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const cleanedLine = line.trim();
          if (cleanedLine === '') continue;
          if (cleanedLine === 'data: [DONE]') continue;

          if (cleanedLine.startsWith('data: ')) {
            try {
              const json = JSON.parse(cleanedLine.substring(6));
              const text = json.choices?.[0]?.delta?.content || '';
              if (text) {
                onChunk(text);
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('[Poolside] Streaming timed out or was cancelled.');
      }
      throw new Error(`[Poolside] Streaming failed: ${error.message}`);
    }
  }
}
