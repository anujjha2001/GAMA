import { groqClient } from '@/lib/ai/client';

export interface VisionModelResult {
  content: string;
  modelUsed: string;
  provider: string;
}

export class VisionLayer {
  /**
   * Analyzes an image with the multi-model vision layer.
   * Order: Google Gemini 2.5 Flash (OpenRouter) -> Groq Llama 3.2 11b Vision -> OpenAI GPT-4o (OpenRouter)
   */
  static async analyzeImage(base64Image: string, prompt: string): Promise<VisionModelResult> {
    const openRouterKey = process.env.Open_router_API_KEY;
    const groqApiKey = process.env.GROQ_API_KEY;

    // Remove any base64 prefix
    const base64ImageClean = base64Image.replace(/^data:image\/\w+;base64,/, '');

    // 1. Primary: Google Gemini 2.5 Flash via OpenRouter
    if (openRouterKey) {
      try {
        console.log('[VisionLayer] Attempting primary model: google/gemini-2.5-flash');
        const content = await this.callOpenRouter('google/gemini-2.5-flash', base64ImageClean, prompt, openRouterKey);
        if (content) {
          return {
            content,
            modelUsed: 'google/gemini-2.5-flash',
            provider: 'openrouter'
          };
        }
      } catch (err: any) {
        console.warn(`[VisionLayer] Primary model google/gemini-2.5-flash failed: ${err?.message || err}`);
      }
    }

    // 2. Fallback: Groq Llama 3.2 11b Vision
    if (groqApiKey && groqApiKey !== 'MISSING_KEY') {
      try {
        console.log('[VisionLayer] Attempting fallback model: llama-3.2-11b-vision-preview');
        const content = await this.callGroqVision('llama-3.2-11b-vision-preview', base64ImageClean, prompt);
        if (content) {
          return {
            content,
            modelUsed: 'llama-3.2-11b-vision-preview',
            provider: 'groq'
          };
        }
      } catch (err: any) {
        console.warn(`[VisionLayer] Fallback model llama-3.2-11b-vision-preview failed: ${err?.message || err}`);
      }
    }

    // 3. Optional: OpenAI GPT-4o via OpenRouter
    if (openRouterKey) {
      try {
        console.log('[VisionLayer] Attempting optional model: openai/gpt-4o-mini');
        const content = await this.callOpenRouter('openai/gpt-4o-mini', base64ImageClean, prompt, openRouterKey);
        if (content) {
          return {
            content,
            modelUsed: 'openai/gpt-4o-mini',
            provider: 'openrouter'
          };
        }
      } catch (err: any) {
        console.warn(`[VisionLayer] Optional model openai/gpt-4o-mini failed: ${err?.message || err}`);
      }
    }

    throw new Error('All vision models in the Vision Layer failed to process the image.');
  }

  private static async callOpenRouter(modelName: string, base64Image: string, prompt: string, apiKey: string): Promise<string> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://gama.health',
        'X-Title': 'GAMA Food Scanner'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  }

  private static async callGroqVision(modelName: string, base64Image: string, prompt: string): Promise<string> {
    const response = await groqClient.chat.completions.create({
      model: modelName,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1
    });

    return response.choices[0]?.message?.content || '';
  }
}
