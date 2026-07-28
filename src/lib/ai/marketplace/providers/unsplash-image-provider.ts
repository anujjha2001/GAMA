import { ImageProvider, ImageFetchResult } from './index';
import { searchRealImage } from '@/lib/ai/image-search';

export class UnsplashImageProvider implements ImageProvider {
  readonly name = 'UnsplashProvider';
  private unhealthyUntil = 0;

  isHealthy() {
    return Date.now() > this.unhealthyUntil;
  }

  markUnhealthy(durationMs = 60_000) {
    this.unhealthyUntil = Date.now() + durationMs;
  }

  async fetchImage(query: string, usedUrls: Set<string>): Promise<ImageFetchResult | null> {
    try {
      // First attempt: exact query
      const result = await searchRealImage(query);
      if (result?.imageUrl && !usedUrls.has(result.imageUrl)) {
        return { url: result.imageUrl, isVerified: true, providerName: this.name };
      }

      // Second attempt: variant query to escape cache collision
      const variants = [
        `${query} plated`,
        `${query} restaurant dish`,
        `${query} gourmet`,
      ];

      for (const variant of variants) {
        const varResult = await searchRealImage(variant);
        if (varResult?.imageUrl && !usedUrls.has(varResult.imageUrl)) {
          return { url: varResult.imageUrl, isVerified: true, providerName: this.name };
        }
      }

      return null;
    } catch (err: any) {
      if (err?.status === 429 || err?.message?.includes('429')) {
        this.markUnhealthy(120_000); // 2 min cooldown on rate limit
      }
      console.warn(`[UnsplashProvider] fetchImage failed for "${query}":`, err?.message);
      return null;
    }
  }
}
