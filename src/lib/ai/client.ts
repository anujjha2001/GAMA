import Groq from 'groq-sdk';
import { AI_CONFIG } from './config';

const groqApiKey = process.env.GROQ_API_KEY;

if (!groqApiKey) {
  console.warn("GROQ_API_KEY is not defined in environment variables. API will fail.");
}

export const groqClient = new Groq({
  apiKey: groqApiKey || "MISSING_KEY",
  maxRetries: AI_CONFIG.maxRetries,
  timeout: AI_CONFIG.timeoutMs
});

let validatedModel: string | null = null;

export async function getValidatedModel(): Promise<string> {
  if (validatedModel) return validatedModel;

  try {
    const modelsResponse = await groqClient.models.list();
    const availableModels = modelsResponse.data.map(m => m.id);
    
    // Check default first
    if (availableModels.includes(AI_CONFIG.providers.groq.defaultModel)) {
      validatedModel = AI_CONFIG.providers.groq.defaultModel;
      return validatedModel;
    }

    // Check fallbacks
    for (const fallback of AI_CONFIG.providers.groq.fallbackModels) {
      if (availableModels.includes(fallback)) {
        console.warn(`[AI] Default model unavailable. Falling back to: ${fallback}`);
        validatedModel = fallback;
        return fallback;
      }
    }
    
    // Last resort: any Llama model
    const anyLlama = availableModels.find(m => m.toLowerCase().includes('llama'));
    if (anyLlama) {
      validatedModel = anyLlama;
      return validatedModel;
    }

    throw new Error("No usable Groq models found.");
  } catch (error: any) {
    console.error("[AI] Failed to validate Groq models", error);
    throw new Error(`Failed to communicate with Groq API: ${error?.message}`);
  }
}
