/**
 * AURA Image Search Service
 * Supports: Pexels, Unsplash, Pixabay, Google Custom Search
 * Provider is selected via IMAGE_SEARCH_PROVIDER env var.
 * Gracefully returns [] if no provider is configured.
 */

export interface ImageResult {
  id: string;
  title: string;
  imageUrl: string;
  thumbnailUrl: string;
  sourceUrl: string;
  sourceName: string;
  license: string;
  altText: string;
  photographer?: string;
  photographerUrl?: string;
  width?: number;
  height?: number;
}

export class ImageSearchService {
  /**
   * Search images using the configured provider.
   * Falls back to [] if no provider is configured or if search fails.
   */
  static async search(query: string, count: number = 3): Promise<ImageResult[]> {
    const provider = (process.env.IMAGE_SEARCH_PROVIDER || '').toLowerCase();

    if (!provider) {
      console.log('[ImageSearch] No IMAGE_SEARCH_PROVIDER configured — falling back to keyless Unsplash Source');
      return [
        {
          id: `keyless-1-${Date.now()}`,
          title: `Visualizing: ${query}`,
          imageUrl: `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=1`,
          thumbnailUrl: `https://images.unsplash.com/featured/400x300/?${encodeURIComponent(query)}&sig=1`,
          sourceUrl: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
          sourceName: 'Unsplash (Public)',
          license: 'Unsplash License (Free)',
          altText: `A visual representation of ${query}`,
        },
        {
          id: `keyless-2-${Date.now()}`,
          title: `Alternative View: ${query}`,
          imageUrl: `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=2`,
          thumbnailUrl: `https://images.unsplash.com/featured/400x300/?${encodeURIComponent(query)}&sig=2`,
          sourceUrl: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
          sourceName: 'Unsplash (Public)',
          license: 'Unsplash License (Free)',
          altText: `An alternative visual representation of ${query}`,
        },
        {
          id: `keyless-3-${Date.now()}`,
          title: `Related details: ${query}`,
          imageUrl: `https://images.unsplash.com/featured/800x600/?${encodeURIComponent(query)}&sig=3`,
          thumbnailUrl: `https://images.unsplash.com/featured/400x300/?${encodeURIComponent(query)}&sig=3`,
          sourceUrl: `https://unsplash.com/s/photos/${encodeURIComponent(query)}`,
          sourceName: 'Unsplash (Public)',
          license: 'Unsplash License (Free)',
          altText: `Related visual context for ${query}`,
        }
      ].slice(0, count);
    }

    try {
      switch (provider) {
        case 'pexels':
          return await this.searchPexels(query, count);
        case 'unsplash':
          return await this.searchUnsplash(query, count);
        case 'pixabay':
          return await this.searchPixabay(query, count);
        case 'google':
          return await this.searchGoogle(query, count);
        default:
          console.warn(`[ImageSearch] Unknown provider: "${provider}"`);
          return [];
      }
    } catch (error: any) {
      console.error(`[ImageSearch] Search failed for "${query}":`, error?.message || error);
      return [];
    }
  }

  // -----------------------------------------------------------------
  // PEXELS  (https://www.pexels.com/api/)
  // Required env: PEXELS_API_KEY
  // -----------------------------------------------------------------
  private static async searchPexels(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn('[ImageSearch] PEXELS_API_KEY not set');
      return [];
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${Math.min(count, 15)}&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: apiKey },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);
    const data = await res.json();

    return (data.photos || []).slice(0, count).map((photo: any) => ({
      id: String(photo.id),
      title: photo.alt || query,
      imageUrl: photo.src?.large || photo.src?.original,
      thumbnailUrl: photo.src?.medium || photo.src?.small,
      sourceUrl: photo.url,
      sourceName: 'Pexels',
      license: 'Pexels License (Free)',
      altText: photo.alt || query,
      photographer: photo.photographer,
      photographerUrl: photo.photographer_url,
      width: photo.width,
      height: photo.height,
    }));
  }

  // -----------------------------------------------------------------
  // UNSPLASH  (https://unsplash.com/developers)
  // Required env: UNSPLASH_ACCESS_KEY
  // -----------------------------------------------------------------
  private static async searchUnsplash(query: string, count: number): Promise<ImageResult[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.warn('[ImageSearch] UNSPLASH_ACCESS_KEY not set');
      return [];
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${Math.min(count, 30)}&orientation=landscape`;
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Unsplash API error: ${res.status}`);
    const data = await res.json();

    return (data.results || []).slice(0, count).map((photo: any) => ({
      id: photo.id,
      title: photo.alt_description || photo.description || query,
      imageUrl: photo.urls?.regular || photo.urls?.full,
      thumbnailUrl: photo.urls?.small || photo.urls?.thumb,
      sourceUrl: photo.links?.html,
      sourceName: 'Unsplash',
      license: 'Unsplash License (Free)',
      altText: photo.alt_description || query,
      photographer: photo.user?.name,
      photographerUrl: photo.user?.links?.html,
      width: photo.width,
      height: photo.height,
    }));
  }

  // -----------------------------------------------------------------
  // PIXABAY  (https://pixabay.com/api/docs/)
  // Required env: PIXABAY_API_KEY
  // -----------------------------------------------------------------
  private static async searchPixabay(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      console.warn('[ImageSearch] PIXABAY_API_KEY not set');
      return [];
    }

    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query)}&per_page=${Math.min(count, 20)}&image_type=photo&orientation=horizontal&safesearch=true`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Pixabay API error: ${res.status}`);
    const data = await res.json();

    return (data.hits || []).slice(0, count).map((hit: any) => ({
      id: String(hit.id),
      title: hit.tags || query,
      imageUrl: hit.largeImageURL || hit.webformatURL,
      thumbnailUrl: hit.previewURL || hit.webformatURL,
      sourceUrl: hit.pageURL,
      sourceName: 'Pixabay',
      license: 'Pixabay License (Free)',
      altText: hit.tags || query,
      photographer: hit.user,
      width: hit.imageWidth,
      height: hit.imageHeight,
    }));
  }

  // -----------------------------------------------------------------
  // GOOGLE CUSTOM SEARCH  (https://developers.google.com/custom-search)
  // Required env: GOOGLE_CSE_API_KEY, GOOGLE_CSE_ID
  // -----------------------------------------------------------------
  private static async searchGoogle(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.GOOGLE_CSE_API_KEY;
    const cx = process.env.GOOGLE_CSE_ID;

    if (!apiKey || !cx) {
      console.warn('[ImageSearch] GOOGLE_CSE_API_KEY or GOOGLE_CSE_ID not set');
      return [];
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query)}&searchType=image&num=${Math.min(count, 10)}&safe=active&imgSize=large`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Google CSE API error: ${res.status}`);
    const data = await res.json();

    return (data.items || []).slice(0, count).map((item: any) => ({
      id: item.link,
      title: item.title || query,
      imageUrl: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      sourceUrl: item.image?.contextLink || item.link,
      sourceName: new URL(item.image?.contextLink || item.link).hostname.replace('www.', ''),
      license: 'Various',
      altText: item.title || query,
      width: item.image?.width,
      height: item.image?.height,
    }));
  }
}
