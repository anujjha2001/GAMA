import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

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
    provider: VisionProviderType = "openai",
    modelName: string = "gpt-4o"
  ): Promise<VisionResponse> {
    const startTime = Date.now();
    
    let model;
    if (provider === "google") {
      throw new Error("Google AI Provider is not configured or installed. Please use OpenAI.");
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
      tokensUsed: result.usage?.totalTokens || 0,
    };
  }
}
