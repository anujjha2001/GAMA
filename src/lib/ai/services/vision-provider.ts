import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";

export type VisionProviderType = "openai" | "google";

export interface VisionResponse {
  content: string;
  latencyMs: number;
  tokensUsed: number;
}

export class VisionProvider {
  static async analyzeImage(
    imageUrl: string,
    prompt: string,
    provider: VisionProviderType = "google",
    modelName: string = "gemini-2.5-flash"
  ): Promise<VisionResponse> {
    const startTime = Date.now();
    
    let model;
    if (provider === "google") {
      model = google(modelName);
    } else {
      model = openai(modelName);
    }

    const result = await generateText({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: imageUrl },
          ],
        },
      ],
    });

    const latencyMs = Date.now() - startTime;

    return {
      content: result.text,
      latencyMs,
      tokensUsed: result.usage.totalTokens,
    };
  }
}
