export interface AIRequest {
  model?: string;
  messages: { role: 'system' | 'user' | 'assistant'; content: string | any[] }[];
  temperature?: number;
  max_tokens?: number;
  response_format?: { type: 'json_object' | 'text' };
  stream?: boolean;
}

export interface ProviderCapabilities {
  name: string;
  isPremium: boolean;
  contextWindow: number;
  costPer1kTokens: number;
  averageLatencyMs: number;
}

export interface IProvider {
  id: string;
  capabilities: ProviderCapabilities;
  
  /**
   * Generates a response from the AI provider.
   * If streaming, returns a standard Fetch Response whose body is a ReadableStream<Uint8Array>.
   * The stream chunks should be parsed raw text tokens from the LLM, making it provider-agnostic.
   */
  generate(request: AIRequest, controller: AbortController): Promise<Response>;
}
