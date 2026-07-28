import { AIOrchestrator } from './orchestrator';
import { AURAIntent } from './types';

export async function detectIntent(message: string): Promise<AURAIntent> {
  try {
    const response = await AIOrchestrator.generate({
      messages: [
        {
          role: "system",
          content: `You are an Intent Detection router for an AI Health Coach. 
Analyze the user message and classify the intent.
Output ONLY a JSON object exactly matching this structure:
{
  "category": "nutrition" | "fitness" | "medical" | "sleep" | "mental_health" | "dashboard" | "general",
  "requiresTools": boolean,
  "suggestedTools": string[],
  "confidence": number
}

Available Tools:
- GetUser, GetDashboard, GetStress, GetRecovery, GetSleep, GetHeartHealth, GetMeals, SearchFood, SearchRecipe, GetNutrition, CalculateCalories, CalculateProtein, CalculateBMI, CalculateBMR, CalculateTDEE, SearchKnowledge, SearchArticles, GetTimeline, GetRecommendations, GetPredictions, GetAlerts, SearchHistory, GetGoals
`
        },
        { role: "user", content: message }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    if (response.content) {
      return JSON.parse(response.content) as AURAIntent;
    }
  } catch (err) {
    console.error("Failed to detect intent with AIOrchestrator:", err);
  }

  // Fallback intent
  return { category: 'general', requiresTools: false, suggestedTools: [], confidence: 0 };
}
