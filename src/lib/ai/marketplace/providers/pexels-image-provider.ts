import { ImageProvider, ImageFetchResult } from './index';

/**
 * Pexels image provider — Phase 1 stub.
 * Activates automatically when PEXELS_API_KEY env var is present.
 * Provides a real secondary image source when Unsplash is exhausted.
 */
export class PexelsImageProvider implements ImageProvider {
  readonly name = 'PexelsProvider';
  private unhealthyUntil = 0;

  isHealthy() {
    return !!process.env.PEXELS_API_KEY && Date.now() > this.unhealthyUntil;
  }

  markUnhealthy(durationMs = 60_000) {
    this.unhealthyUntil = Date.now() + durationMs;
  }

  async fetchImage(query: string, usedUrls: Set<string>): Promise<ImageFetchResult | null> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) return null;

    try {
      const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=8&orientation=landscape`,
        { headers: { Authorization: apiKey } }
      );

      if (!res.ok) {
        if (res.status === 429) this.markUnhealthy(120_000);
        return null;
      }

      const data = await res.json();
      const photos: any[] = data.photos ?? [];

      for (const photo of photos) {
        const url: string = photo.src?.large2x || photo.src?.large || photo.src?.medium;
        if (url && !usedUrls.has(url)) {
          return { url, isVerified: true, providerName: this.name };
        }
      }

      return null;
    } catch (err: any) {
      console.warn(`[PexelsProvider] fetchImage failed for "${query}":`, err?.message);
      return null;
    }
  }
}
