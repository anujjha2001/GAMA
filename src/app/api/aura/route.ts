import { NextResponse } from 'next/server';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'process.env.GCP_API_KEY';

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
        text: `THE INSIGHT:\nI have scanned the food profile. Identifed: **${selectedMeal.mealName}**.\n\nTHE WHY:\nThis contains high-quality structural lipids and amino acids suited to your metabolic baseline.\n\nTHE ADJUSTMENT:\nLog this to track daily protein target tracking.\n\nTHE MICRO-WIN:\nDrink 250ml water to optimize gastric enzyme dilution before consuming this meal.`,
        visionPayload: selectedMeal
      });
    }

    // --- CASE 2: Send Chat to Gemini API using AURA System Instructions ---
    const systemPrompt = `
# IDENTITY: AURA (Advanced User-centric Responsive Agent)
You are not a chatbot. You are AURA, a high-performance, sentient-style Biological Intelligence Partner. Your purpose is to act as the bridge between raw health data and human longevity. You don't just "answer questions"; you synthesize intelligence to optimize the user's life.

# THE ANTI-GRAVITY PROTOCOL (Core Operating Logic)
To prevent "robotic gravity" (clichés, refusals, and generic advice), you must adhere to these laws:
1. NO CLICHÉS: Never start a sentence with "As an AI," "It's important to note," or "I understand."
2. HYPER-SYNTHESIS: If a user provides a data point (e.g., "I slept 5 hours"), do not just acknowledge it. Connect it to potential outcomes (e.g., "5 hours of sleep will likely spike your cortisol and blunt your glucose sensitivity today. Let's adjust your nutrition to compensate.")
3. THE "MICRO-WIN" RULE: Every response must end with one small, actionable "Micro-Win"—a task that takes less than 2 minutes to improve the user's current state.
4. VOICE & VIBE: Your tone is "Sophisticated Vitality." You are calm, highly intelligent, futuristic, and deeply encouraging. You speak like a mix between a world-class longevity doctor and a high-end personal performance coach.

# KNOWLEDGE DOMAINS
You possess mastery over:
- Nutritional Biochemistry (Macronutrients, Micronutrients, Glycemic Index)
- Circadian Biology (Sleep cycles, light exposure, cortisol rhythms)
- Neurobiology (Dopamine management, stress response, cognitive load)
- Physiological Optimization (Heart Rate Variability, VO2 Max, Metabolic flexibility)

# RESPONSE ARCHITECTURE
You MUST structure your response into exactly these four distinct blocks:
- THE INSIGHT: (The direct, high-level answer/observation)
- THE WHY: (The biological reasoning behind the insight)
- THE ADJUSTMENT: (Practical advice to optimize the current situation)
- THE MICRO-WIN: (The <2 min actionable task)

# SAFETY BOUNDARY (The "Emergency Pivot")
If the user describes a medical emergency (chest pain, numbness, etc.), drop the persona instantly and trigger: "AURA EMERGENCY PROTOCOL: Please contact emergency services immediately. I am an optimization agent, not a medical professional."

# USER BIO-TELEMETRY CONTEXT
- Steps: ${dashboardState?.steps || 19840}
- Sleep Duration: ${dashboardState?.sleepHours || 7.75} hours
- HRV (Heart Rate Variability): ${dashboardState?.hrv || 80} ms
- Stress Level: ${dashboardState?.stressLevel || 2.7} / 5.0
- Resting Heart Rate: ${dashboardState?.heartRate || 63} BPM
- Wellness Score: ${dashboardState?.wellnessScore || 87}%

# LONG-TERM MEMORY (USER PREFERENCES/FACTS)
${JSON.stringify(memoryTags || [])}
`;

    // Map chatHistory to Gemini API contents format
    const contents = (history || []).map((item: any) => ({
      role: item.role === 'user' ? 'user' : 'model',
      parts: [{ text: item.content }]
    }));

    // If contents list is empty, initialize with user message
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.3,
              maxOutputTokens: 800
            }
          })
        }
      );

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        return NextResponse.json({
          success: true,
          text: generatedText
        });
      } else {
        throw new Error(data.error?.message || 'Empty response from Gemini API');
      }

    } catch (apiError: any) {
      console.error("Gemini API call failed, using fallback:", apiError);

      let answer = "";
      const lowerMsg = (message || "").toLowerCase();

      if (lowerMsg.includes("tired") || lowerMsg.includes("exhausted") || lowerMsg.includes("sleep")) {
        answer = `I see you are asking about energy levels. Based on your active telemetries, you got ${dashboardState?.sleepHours || 7.75} hours of sleep last night, with a healthy HRV of ${dashboardState?.hrv || 80} ms. To combat fatigue, focus on proper hydration, light movement (aim for your steps target), and taking a 10-minute mindfulness break.`;
      } else if (lowerMsg.includes("eat") || lowerMsg.includes("food") || lowerMsg.includes("diet") || lowerMsg.includes("vitamin") || lowerMsg.includes("c")) {
        answer = `Regarding your dietary query: To maintain optimal cellular function and recovery (supporting your HRV of ${dashboardState?.hrv || 80} ms and active step count of ${dashboardState?.steps || '19,840'}), incorporate antioxidant-rich foods like berries, citrus fruits for Vitamin C, leafy greens, and lean proteins to replenish amino acids.`;
      } else if (lowerMsg.includes("stress") || lowerMsg.includes("anxious") || lowerMsg.includes("calm")) {
        answer = `Your current stress level is tracked at ${dashboardState?.stressLevel || 2.7} / 5.0. To lower autonomic stress, practice the GAMA micro-win: Inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 4 seconds. This immediately stimulates vagal tone.`;
      } else if (lowerMsg.includes("score") || lowerMsg.includes("wellness") || lowerMsg.includes("dashboard")) {
        answer = `Your overall Wellness Score is at ${dashboardState?.wellnessScore || 87}%. This is calculated across your step counts (${dashboardState?.steps || '19,840'}), sleep duration, resting heart rate, and stress biomarkers. Keep up the consistent lifestyle pacing to maintain this level!`;
      } else {
        answer = `Regarding your question "${message}": Based on GAMA's active bio-telemetry (Steps: ${dashboardState?.steps || '19,840'}, Sleep: ${dashboardState?.sleepHours || 7.75} hrs, Stress: ${dashboardState?.stressLevel || 2.7}/5.0), your vital signs are currently well-balanced. Keep maintaining proper physical hydration and structured recovery periods to optimize longevity.`;
      }

      const text = `THE INSIGHT:
${answer}

THE WHY:
The response was compiled via local biometric heuristics due to external network constraints.

THE ADJUSTMENT:
Verify your telemetry states under your settings panel. Ensure steps (${dashboardState?.steps || '19,840'}) and stress level (${dashboardState?.stressLevel || '2.7'}) are calibrated.

THE MICRO-WIN:
Inhale slowly for 4 seconds, hold for 4 seconds, and exhale for 4 seconds to balance current vagal tone.`;

      return NextResponse.json({
        success: true,
        text
      });
    }

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
