import { LLMResponse } from './sdk/provider';
import { AIOrchestrator } from '@/lib/ai/orchestrator';

export class AIGateway {
  static async generateText(messages: any[], activeModelOverride?: string): Promise<LLMResponse> {
    const response = await AIOrchestrator.generate({
      messages,
      model: activeModelOverride,
      response_format: { type: 'json_object' }
    });

    return {
      content: response.content,
      usage: response.usage
    };
  }
}
