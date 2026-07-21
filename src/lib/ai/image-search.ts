import { ImageSearchService } from './tools/image-search';

export interface RealImageResult {
  imageUrl: string;
  thumbnail: string;
  title: string;
  source: string;
  photographer?: string;
  license: string;
}

// In-memory cache for search query results to prevent redundant provider API calls
const imageCache = new Map<string, RealImageResult | null>();

export async function searchRealImage(query: string): Promise<RealImageResult | null> {
  const cacheKey = query.toLowerCase().trim();
  
  if (imageCache.has(cacheKey)) {
    console.log(`[ImageCache] Cache hit for query: "${query}"`);
    return imageCache.get(cacheKey) || null;
  }

  console.log(`[ImageSearch] Cache miss. Searching trusted providers for: "${query}"`);
  try {
    const results = await ImageSearchService.search(query, 1);
    
    if (results && results.length > 0) {
      const topResult = results[0];
      const imageResult: RealImageResult = {
        imageUrl: topResult.imageUrl,
        thumbnail: topResult.thumbnailUrl || topResult.imageUrl,
        title: topResult.title || `Photograph of ${query}`,
        source: topResult.sourceName || 'Image Provider',
        photographer: topResult.photographer,
        license: topResult.license || 'Free to use',
      };
      
      imageCache.set(cacheKey, imageResult);
      return imageResult;
    }
    
    // Cache negative results as null to prevent spamming APIs on failed lookups
    imageCache.set(cacheKey, null);
    return null;
  } catch (err) {
    console.error(`[ImageSearch] Failed to retrieve image for "${query}":`, err);
    return null;
  }
}
