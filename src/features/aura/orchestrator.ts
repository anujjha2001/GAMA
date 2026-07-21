import { AURAEventBus } from '@/shared/ai/event-bus';
import { MemoryEngine } from '@/shared/ai/memory-engine';
import { PromptRegistry } from '@/shared/ai/prompt-registry';
import { AIGateway } from '@/shared/ai/ai-gateway';
import { GovernanceEngine } from '@/shared/ai/governance-engine';
import { ExplainabilityEngine } from '@/shared/ai/explainability';
import { getEnabledTools } from '@/shared/ai/capability-registry';
import { MetricsCollector } from '@/shared/observability/metrics';

export type FSMState =
  | 'IDLE'
  | 'WAKE'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'RETRIEVING_CONTEXT'
  | 'SELECTING_AGENT'
  | 'CALLING_TOOL'
  | 'GENERATING'
  | 'STREAMING'
  | 'SPEAKING'
  | 'WAITING';

export class AURAOrchestrator {
  private static currentState: FSMState = 'IDLE';

  static async transitionTo(state: FSMState) {
    this.currentState = state;
    await AURAEventBus.publish('fsm_transition', { state });
  }

  static async processVoiceRequest(profileId: string, message: string, history: any[] = []): Promise<any> {
    const startTime = Date.now();
    let dbTime = 0;
    let aiTime = 0;

    await this.transitionTo('WAKE');
    await AURAEventBus.publish('WakeWordDetected');

    await this.transitionTo('LISTENING');
    await AURAEventBus.publish('TranscriptReceived', { message });

    // Step 1: Context retrieval
    await this.transitionTo('RETRIEVING_CONTEXT');
    const dbStart = Date.now();
    const contextText = await MemoryEngine.getContextPayload(profileId);
    dbTime = Date.now() - dbStart;
    await AURAEventBus.publish('ContextLoaded');

    // Step 2: Selecting Agent & Building Prompt
    await this.transitionTo('SELECTING_AGENT');
    const systemPrompt = PromptRegistry.getPrompt('system') + `\n\nUSER HEALTH CONTEXT:\n${contextText}`;

    // Step 3: Generating Response
    await this.transitionTo('GENERATING');
    const aiStart = Date.now();
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    const aiRes = await AIGateway.generateText(messages);
    aiTime = Date.now() - aiStart;

    let responseData: any;
    try {
      responseData = JSON.parse(aiRes.content);
    } catch {
      responseData = { message: aiRes.content, tool: { name: 'none', actionType: 'NONE' } };
    }

    // Step 4: Governance Validation Layer
    const governance = GovernanceEngine.evaluate(message, responseData.message || '');
    if (!governance.passed && governance.overrideResponse) {
      responseData.message = governance.overrideResponse;
      responseData.caption = governance.overrideResponse;
    } else {
      responseData.message = governance.cleansedText;
    }

    // Step 5: Tool Calling
    if (responseData.tool && responseData.tool.name !== 'none') {
      await this.transitionTo('CALLING_TOOL');
      const registryTools = getEnabledTools();
      const matchedTool = registryTools.find(t => t.name === responseData.tool.name);
      if (matchedTool) {
        const handlerResult = await matchedTool.handler(responseData.tool.parameter);
        responseData.tool.result = handlerResult;
        await AURAEventBus.publish('ToolExecuted', { tool: matchedTool.name });
      }
    }

    // Step 6: Explainability
    const explain = ExplainabilityEngine.formatExplanation(message, contextText.length > 0, {
      confidence: 0.9,
    });
    responseData.explainability = explain;

    await this.transitionTo('SPEAKING');
    await AURAEventBus.publish('AIResponseGenerated', { response: responseData });

    // Observability recording
    MetricsCollector.record({
      aiLatencyMs: aiTime,
      dbLatencyMs: dbTime,
      promptTokens: aiRes.usage?.promptTokens || 0,
      completionTokens: aiRes.usage?.completionTokens || 0,
    });

    return responseData;
  }
}
