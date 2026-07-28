/**
 * AI Provider Abstraction Interfaces
 * Decouples the application from specific provider SDKs.
 */

export interface AIRequest {
  model?: string;
  messages: { role: string; content: string }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
  };
  provider: string;
  model: string;
}

export interface AIProvider {
  name: string;
  generate(request: AIRequest): Promise<AIResponse>;
}
