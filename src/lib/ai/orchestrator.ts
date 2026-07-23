import { PoolsideProvider, PoolsideMessage, PoolsideResponse } from './providers/poolside-provider';
import { FOOD_PROMPTS } from './prompts/food';
import { HEALTH_PROMPTS } from './prompts/health';
import { EXERCISE_PROMPTS } from './prompts/exercise';
import { VAULT_PROMPTS } from './prompts/vault';
import { MEAL_PLANNER_PROMPTS } from './prompts/meal-planner';
import { BODY_TWIN_PROMPTS } from './prompts/body-twin';
import { COACH_PROMPTS } from './prompts/coach';

export class AIOrchestrator {
  static async generateText(messages: PoolsideMessage[], options?: any): Promise<PoolsideResponse> {
    return await PoolsideProvider.generateText(messages, options);
  }

  static async generateStream(
    messages: PoolsideMessage[],
    onChunk: (text: string) => void,
    options?: any
  ): Promise<void> {
    await PoolsideProvider.generateStream(messages, onChunk, options);
  }

  // --- Specific Feature Actions ---

  static async explainFoodScan(foodName: string, verifiedNutrients?: any): Promise<string> {
    const verifiedString = verifiedNutrients ? JSON.stringify(verifiedNutrients) : '';
    const prompt = FOOD_PROMPTS.explainNutrition(verifiedString, foodName);
    const messages: PoolsideMessage[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: `Analyze: ${foodName}` }
    ];
    const res = await this.generateText(messages);
    return res.content;
  }

  static async explainMedicalReport(fileName: string, extractedText: string): Promise<string> {
    const prompt = VAULT_PROMPTS.parseReport(fileName);
    const messages: PoolsideMessage[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: extractedText }
    ];
    const res = await this.generateText(messages);
    return res.content;
  }

  static async explainInsights(recoveryScore: number, sleepHours: number, stressLevel: number): Promise<string> {
    const prompt = BODY_TWIN_PROMPTS.explainRecovery(recoveryScore, sleepHours, stressLevel);
    const messages: PoolsideMessage[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: 'Generate natural language summary.' }
    ];
    const res = await this.generateText(messages);
    return res.content;
  }

  static async getCoachingCues(exerciseName: string, jointAngles: any, formAccuracy: number): Promise<string> {
    const prompt = EXERCISE_PROMPTS.coachingCues(exerciseName, formAccuracy);
    const messages: PoolsideMessage[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: `Current telemetry: ${JSON.stringify(jointAngles)}` }
    ];
    const res = await this.generateText(messages);
    return res.content;
  }

  static async generateWorkoutPlan(userBio: any, goals: string, equipment: string): Promise<string> {
    const prompt = MEAL_PLANNER_PROMPTS.workoutBuild(goals, equipment);
    const messages: PoolsideMessage[] = [
      { role: 'system', content: prompt },
      { role: 'user', content: `Generate workout based on recovery bio: ${JSON.stringify(userBio)}` }
    ];
    const res = await this.generateText(messages);
    return res.content;
  }
}
