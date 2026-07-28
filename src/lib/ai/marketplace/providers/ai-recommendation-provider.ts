import { RecommendationProvider, RecommendationContext, RawRecommendation } from './index';
import { AIOrchestrator } from '@/lib/ai/orchestrator';

const GLOBAL_CUISINES = [
  'Japanese', 'Korean', 'Thai', 'Vietnamese', 'Indian', 'Mediterranean',
  'Italian', 'Greek', 'Mexican', 'Lebanese', 'Turkish', 'French',
  'Brazilian', 'American', 'Chinese', 'Scandinavian', 'African',
  'Spanish', 'Fusion', 'Middle Eastern',
];

export class AIRecommendationProvider implements RecommendationProvider {
  readonly name = 'AIRecommendationProvider';
  private unhealthyUntil = 0;

  isHealthy() {
    return Date.now() > this.unhealthyUntil;
  }

  markUnhealthy(durationMs = 60_000) {
    this.unhealthyUntil = Date.now() + durationMs;
  }

  async generate(context: RecommendationContext): Promise<RawRecommendation[]> {
    const response = await AIOrchestrator.generate({
      messages: [{ role: 'user', content: this.buildPrompt(context) }],
      temperature: 0.75,
      max_tokens: 8000,
      response_format: { type: 'json_object' }
    });

    let parsed: any;
    try {
      parsed = JSON.parse(response.content);
    } catch {
      throw new Error('AI provider returned invalid JSON');
    }

    const raw: RawRecommendation[] = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
      : Array.isArray(parsed)
        ? parsed
        : [];

    if (raw.length === 0) {
      throw new Error('AI provider returned empty recommendations array');
    }

    return raw.slice(0, 20);
  }

  private buildPrompt(ctx: RecommendationContext): string {
    const cuisineList = GLOBAL_CUISINES.join(', ');

    return `You are GAMA's global food intelligence engine. Your task is to generate exactly 20 globally diverse, health-optimized meal recommendations.

USER HEALTH CONTEXT (personalize every recommendation using this):
- Time of Day: ${ctx.timeOfDay}
- Weather: ${ctx.weather}
- City: ${ctx.city}
- Fitness Goal: ${ctx.fitnessGoal}
- Health Status: ${ctx.biometricSummary}
- Today's Activity: ${ctx.workoutToday}
- Variety Seed: ${ctx.seed}

MANDATORY RULES (violations will cause rejection):
1. Return EXACTLY 20 meals. No duplicates.
2. Every "restaurantName" must be unique across all 20 meals.
3. No cuisine type may appear MORE than 2 times across the 20 meals.
4. Cuisines MUST be spread globally from: ${cuisineList}
5. "imageQuery" must be a specific food photography search string (e.g., "tonkotsu ramen bowl with soft boiled egg and nori", NOT just "ramen").
6. "whyRecommend" must be 2-3 sentences that DIRECTLY reference the user's health status, fitness goal, or today's activity stated above.
7. "auraScore" must be 60-99, calculated from: nutrition quality, protein match for goal, glycemic load, processing level.
8. "price" must be realistic in Indian Rupees: snacks/drinks 80-250, full meals 200-800.
9. All nutrition values must be realistic for the specific dish.
10. "aiConfidence" should be 0.70-0.95 based on how confident you are in the nutrition accuracy.

Return ONLY this valid JSON object, with no markdown or explanation:
{
  "recommendations": [
    {
      "name": "string",
      "restaurantName": "string",
      "cuisine": "string",
      "country": "string",
      "city": "string",
      "imageQuery": "string (specific dish photography query)",
      "calories": number,
      "proteinG": number,
      "carbsG": number,
      "fatG": number,
      "fiberG": number,
      "sugarG": number,
      "sodiumMg": number,
      "glycemicLoad": number,
      "processingLevel": "Unprocessed" | "Minimally Processed" | "Moderately Processed" | "Highly Processed",
      "auraScore": number,
      "whyRecommend": "2-3 sentence personalized paragraph",
      "price": number,
      "category": "Breakfast" | "Lunch" | "Dinner" | "Snack" | "Drinks" | "Desserts",
      "expectedFeeling": "Energized" | "Heavy" | "Sleepy" | "Perfect Before Workout" | "Perfect Before Sleep",
      "aiConfidence": number
    }
  ]
}`;
  }
}
