import { AIOrchestrator } from '@/lib/ai/orchestrator';

export interface VisionModelResult {
  content: string;
  modelUsed: string;
  provider: string;
}

export class VisionLayer {
  /**
   * Analyzes an image using the unified AIOrchestrator vision capabilities.
   */
  static async analyzeImage(base64Image: string, prompt: string): Promise<VisionModelResult> {
    const base64ImageClean = base64Image.replace(/^data:image\/\w+;base64,/, '');
    const dataUrl = `data:image/jpeg;base64,${base64ImageClean}`;

    try {
      console.log('[VisionLayer] Attempting to process image via AIOrchestrator');
      const response = await AIOrchestrator.generate({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: dataUrl
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        response_format: { type: 'json_object' }
      });

      return {
        content: response.content,
        modelUsed: response.model,
        provider: response.provider
      };
    } catch (err: any) {
      console.error(`[VisionLayer] Image processing failed: ${err.message}`);
      throw new Error('All vision models in the Vision Layer failed to process the image.');
    }
  }
}
