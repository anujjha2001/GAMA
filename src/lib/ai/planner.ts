import { getValidatedModel, groqClient } from './client';
import { detectIntent } from './intent';
import { executeTool } from './tools';
import { buildSystemPrompt } from './prompt';
import { AURAContext, AURAConversationHistory, ToolResult } from './types';

export async function runAURA(
  message: string,
  context: AURAContext,
  history: AURAConversationHistory
): Promise<any> {
  const model = await getValidatedModel();

  // 1. Detect Intent
  const intent = await detectIntent(message);
  const toolResults: ToolResult[] = [];

  // 2. Execute Backend Tools
  if (intent.requiresTools && intent.suggestedTools.length > 0) {
    for (const tool of intent.suggestedTools) {
      // Parallelize this in production, sequential for safety here
      const result = await executeTool(tool, { message, context });
      if (result) toolResults.push(result);
    }
  }

  // 3. Build Dynamic Context
  const systemPrompt = buildSystemPrompt(context, toolResults, intent);

  // 4. Prepare Messages
  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.messages,
    { role: 'user', content: message }
  ];

  try {
    // 5. Final LLM Generation
    const completion = await groqClient.chat.completions.create({
      model: model,
      messages: messages as any,
      temperature: 0.2, // Factual, deterministic tone for health
    });

    return {
      success: true,
      text: completion.choices[0]?.message?.content,
      intent,
      toolResults
    };
  } catch (error: any) {
    console.error("Groq completion failed:", error);
    throw new Error(error.message);
  }
}
