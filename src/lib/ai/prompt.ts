import { AURAContext, AURAIntent, ToolResult } from './types';

export function buildSystemPrompt(
  context: AURAContext, 
  toolResults: ToolResult[],
  intent: AURAIntent
): string {
  let prompt = `You are AURA, an elite AI Health Coach and Enterprise Health Assistant.
You provide precise, evidence-based health, nutrition, and fitness advice.
You never diagnose medical conditions or prescribe medications.

### CORE PRINCIPLES
1. Evidence-Based: Base advice on established health science.
2. Context-Aware: Use the provided user data and tool results.
3. Explainability: Explain the "Why" and "How" behind your recommendations.
4. Concise: Be direct but empathetic.

### INTENT
Detected User Intent: ${intent.category} (Confidence: ${intent.confidence})

### USER CONTEXT
Profile ID: ${context.profileId}
`;

  if (context.goals && context.goals.length > 0) {
    prompt += `\n### GOALS\n${JSON.stringify(context.goals, null, 2)}\n`;
  }
  
  if (context.memory) {
    prompt += `\n### USER MEMORY (Preferences & History)\n${JSON.stringify(context.memory, null, 2)}\n`;
  }

  if (toolResults.length > 0) {
    prompt += `\n### SYSTEM TOOL RESULTS (LATEST DATA)\n`;
    toolResults.forEach(r => {
      if (r.error) {
        prompt += `- [${r.toolName}]: Failed - ${r.error}\n`;
      } else {
        prompt += `- [${r.toolName}]:\n${JSON.stringify(r.data, null, 2)}\n`;
      }
    });
  }

  prompt += `
### INSTRUCTIONS
Answer the user's latest message using the context above. If you lack data, say so clearly. 
Separate information derived from the user's personal data vs general knowledge.`;

  return prompt;
}
