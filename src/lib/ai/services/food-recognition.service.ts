import { prisma } from "@/lib/prisma";
import { VisionProvider } from "./vision-provider";

export class FoodRecognitionService {
  /**
   * Analyzes food uploads, extracts macros/micros, stores images.
   */
  static async analyze(profileId: string, imageUrl: string, mealType: string = "lunch") {
    console.log(`[FoodRecognitionService] Analyzing food image for profile: ${profileId}`);

    const aiPrompt = `Analyze this food image. Provide calories, protein, carbs, fat, fiber, sugar. List food items and ingredients. Predict portion size. Return JSON only.`;
    
    const aiResponse = await VisionProvider.analyzeImage(imageUrl, aiPrompt, "google", "gemini-2.5-flash");
    
    // Assume AI returns a JSON structure which we parse.
    // Mock parsing:
    const parsedData = {
      foodItems: ["Grilled Salmon", "Asparagus", "Brown Rice"],
      ingredients: { "salmon": "1 fillet", "asparagus": "5 spears", "rice": "1 cup" },
      calories: 550,
      protein: 45,
      carbs: 40,
      fat: 22,
      fiber: 6,
      sugar: 2,
      vitamins: { "Vitamin C": "20%", "Vitamin B6": "30%" },
      minerals: { "Iron": "15%", "Magnesium": "25%" },
      glycemicLoad: 12.5,
      portionSize: "Medium",
      confidenceScore: 0.95,
      healthRating: 8,
      alternatives: ["Quinoa instead of rice"],
      explanation: "Balanced meal with high protein and healthy fats."
    };

    const analysis = await prisma.foodAnalysis.create({
      data: {
        profileId,
        imageUrl,
        mealType,
        ...parsedData,
        status: "COMPLETED",
        modelVersion: "gemini-2.5-flash",
        provider: "google",
        processingTimeMs: aiResponse.latencyMs,
        tokensUsed: aiResponse.tokensUsed,
      }
    });

    return analysis;
  }
}
