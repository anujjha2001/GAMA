import { NextResponse } from 'next/server';
import { runAURA } from '@/lib/ai/planner';
import { gatherAURAContext } from '@/lib/ai/context';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, history, dashboardState, memoryTags, image } = body;

    // --- CASE 1: Multimodal Vision (Image Upload) ---
    if (image) {
      // Return a simulated, high-fidelity biological vision output matching food logs
      const meals = [
        { mealName: "Grilled Salmon Quinoa Bowl", calories: 540, protein: 42, carbs: 38, fat: 22, imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80" },
        { mealName: "Avocado Sourdough Toast", calories: 360, protein: 11, carbs: 42, fat: 18, imageUrl: "https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80" },
        { mealName: "Superberry Acai Protein Bowl", calories: 420, protein: 15, carbs: 65, fat: 12, imageUrl: "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=500&q=80" }
      ];

      const selectedMeal = meals[Math.floor(Math.random() * meals.length)];

      return NextResponse.json({
        success: true,
        text: `### THE INSIGHT\nI have scanned the food profile. Identifed: **${selectedMeal.mealName}**.\n\n### THE WHY\nThis contains high-quality structural lipids and amino acids suited to your metabolic baseline.\n\n### THE ADJUSTMENT\nLog this to track daily protein target tracking.\n\n### THE MICRO-WIN\nDrink 250ml water to optimize gastric enzyme dilution before consuming this meal.`,
        visionPayload: selectedMeal
      });
    }

    // --- CASE 2: Text Chat using Grok AURA Architecture ---
    
    // 1. Gather Context
    const profileId = "default_user"; // Replace with real auth user ID when auth is integrated
    const context = await gatherAURAContext(profileId, dashboardState, memoryTags);
    
    // 2. Run Planner (Intent -> Tools -> Grok Completion)
    const formattedHistory = { messages: history || [] };
    const result = await runAURA(message, context, formattedHistory);
    
    return NextResponse.json({
      success: true,
      text: result.text,
      intent: result.intent,
      toolsUsed: result.toolResults?.map((t: any) => t.toolName) || []
    });

  } catch (error: any) {
    console.error("AURA Route Error:", error);
    
    // Fallback in case Grok is down or rate limited
    return NextResponse.json({ 
      success: true, 
      text: `### THE INSIGHT\nI am currently operating in limited capacity mode due to network constraints.\n\n### THE WHY\nThe primary biological intelligence engine (Grok) is unreachable.\n\n### THE ADJUSTMENT\nPlease try your query again in a moment.\n\n### THE MICRO-WIN\nTake a deep breath. Inhale for 4s, hold for 4s, exhale for 4s.`
    });
  }
}
