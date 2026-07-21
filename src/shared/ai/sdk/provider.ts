export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
  };
}

export interface LLMProvider {
  name: string;
  generateText: (messages: any[], options?: any) => Promise<LLMResponse>;
}
