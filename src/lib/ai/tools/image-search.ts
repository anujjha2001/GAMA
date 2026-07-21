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

// Curated high-fidelity premium medical and health assets
const CURATED_MEDICAL_IMAGES: { keywords: string[]; title: string; imageUrl: string; altText: string }[] = [
  {
    keywords: ['vitamin d', 'vit d', 'vitamin', 'vitamins'],
    title: 'Vitamin D & Nutrition Synergy',
    imageUrl: 'https://images.unsplash.com/photo-1616679911721-eff6eec18fcd?w=800&q=80',
    altText: 'A balanced assortment of citrus fruits and healthy supplements highlighting vital vitamins.'
  },
  {
    keywords: ['iron', 'hemoglobin', 'anemia', 'blood cell', 'ferritin'],
    title: 'Biomarker Analysis: Oxygen Carriers',
    imageUrl: 'https://images.unsplash.com/photo-1530026405186-ed1ea0ac7a63?w=800&q=80',
    altText: 'Microscopic 3D rendering of red blood cells carrying oxygen throughout the body.'
  },
  {
    keywords: ['heart', 'cardiovascular', 'ldl', 'hdl', 'lipid', 'cholesterol', 'cardio'],
    title: 'Cardiovascular Assessment & Biomarkers',
    imageUrl: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80',
    altText: 'A medical professional examining cardiovascular report data next to a stethoscope.'
  },
  {
    keywords: ['liver', 'lft', 'bilirubin', 'enzyme'],
    title: 'Hepatic Function & Liver Anatomy',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80',
    altText: 'An anatomical schematic detailing human organ functions and liver health biomarkers.'
  },
  {
    keywords: ['blood sugar', 'glucose', 'diabetes', 'hba1c', 'insulin'],
    title: 'Metabolic Profile: Glucose Control',
    imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=800&q=80',
    altText: 'High-tech laboratory testing equipment measuring metabolic biomarkers and glucose index.'
  },
  {
    keywords: ['kidney', 'kft', 'creatinine', 'egfr', 'renal'],
    title: 'Renal Biomarkers & Kidney Health',
    imageUrl: 'https://images.unsplash.com/photo-1579684389782-64d84b5e901a?w=800&q=80',
    altText: 'Scientific diagnostic test tubes carrying blood samples for creatinine and kidney filtration tests.'
  },
  {
    keywords: ['sleep', 'circadian', 'melatonin', 'rest', 'hrv'],
    title: 'Circadian Sleep Hygiene Optimization',
    imageUrl: 'https://images.unsplash.com/photo-1511295742364-92767fc4a098?w=800&q=80',
    altText: 'A calm, dark bedroom layout optimized for restorative deep sleep and melatonin production.'
  },
  {
    keywords: ['nutrition', 'diet', 'food', 'meal', 'breakfast', 'lunch', 'dinner', 'recipes'],
    title: 'Anti-Inflammatory Mediterranean Diet',
    imageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=800&q=80',
    altText: 'A vibrant selection of fresh vegetables, leafy greens, and omega-rich olive oil on a kitchen table.'
  },
  {
    keywords: ['hydration', 'water', 'electrolyte', 'drink'],
    title: 'Cellular Hydration & Fluid Intake',
    imageUrl: 'https://images.unsplash.com/photo-1548839140-29a886455ac5?w=800&q=80',
    altText: 'A clean glass of fresh drinking water with lemon slices demonstrating daily hydration goals.'
  },
  {
    keywords: ['exercise', 'workout', 'training', 'muscle', 'gym', 'resistance'],
    title: 'Zone 2 Cardio & Strength Progression',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&q=80',
    altText: 'Fitness training equipment and running shoes positioned on an athletic training surface.'
  }
];

export class ImageSearchService {
  /**
   * Search images using the configured provider.
   * Falls back to curated assets or strict tag-filtered Lorem Flickr.
   */
  static async search(query: string, count: number = 3): Promise<ImageResult[]> {
    const provider = (process.env.IMAGE_SEARCH_PROVIDER || '').toLowerCase();
    const queryLower = query.toLowerCase().trim();

    // STAGE 2 Validation: Filter out unrelated entities (animals, memes, random objects)
    const blockedKeywords = ['cat', 'dog', 'animal', 'meme', 'joke', 'car', 'funny', 'random'];
    const containsBlocked = blockedKeywords.some(kw => queryLower.includes(kw));

    // Must have at least some medical/health context
    const healthKeywords = [
      'vitamin', 'vit', 'iron', 'hemoglobin', 'anemia', 'blood', 'heart', 'cardio', 'lipid', 'cholesterol',
      'liver', 'lft', 'sugar', 'glucose', 'diabetes', 'insulin', 'kidney', 'renal', 'creatinine', 'sleep',
      'rest', 'circadian', 'nutrition', 'diet', 'food', 'meal', 'hydration', 'water', 'exercise', 'workout',
      'training', 'biomarker', 'health', 'anatomy', 'medical', 'organ', 'report', 'test', 'fit'
    ];
    const isHealthRelated = healthKeywords.some(kw => queryLower.includes(kw));

    if (containsBlocked || !isHealthRelated) {
      console.log(`[ImageSearch] Query "${query}" rejected as non-medical/unrelated.`);
      return [];
    }

    // 1. Try to match query against Curated Medical Assets first
    const matchedCurated = CURATED_MEDICAL_IMAGES.find(item =>
      item.keywords.some(keyword => queryLower.includes(keyword))
    );

    if (matchedCurated) {
      console.log(`[ImageSearch] Matched curated medical asset for query: "${query}"`);
      return [
        {
          id: `curated-1-${Date.now()}`,
          title: matchedCurated.title,
          imageUrl: matchedCurated.imageUrl,
          thumbnailUrl: matchedCurated.imageUrl,
          sourceUrl: 'https://unsplash.com',
          sourceName: 'Unsplash (Curated Health)',
          license: 'Unsplash License (Free)',
          altText: matchedCurated.altText,
        }
      ];
    }

    if (!provider) {
      console.log('[ImageSearch] No IMAGE_SEARCH_PROVIDER configured — falling back to keyless Lorem Flickr with strict medical filters');
      // Format tags replacing spaces with commas, and append a strict 'health,medical' tag fallback
      // This forces Lorem Flickr's tag resolver to load a health placeholder rather than defaulting to cats
      const cleanQuery = encodeURIComponent(queryLower.replace(/\s+/g, ',')) + ',health,medical';
      return [
        {
          id: `keyless-1-${Date.now()}`,
          title: `Visualizing: ${query}`,
          imageUrl: `https://loremflickr.com/800/600/${cleanQuery}?random=1`,
          thumbnailUrl: `https://loremflickr.com/400/300/${cleanQuery}?random=1`,
          sourceUrl: `https://flickr.com/search/?q=${encodeURIComponent(query)}`,
          sourceName: 'Flickr (Public)',
          license: 'Creative Commons (Free)',
          altText: `A visual representation of ${query}`,
        },
        {
          id: `keyless-2-${Date.now()}`,
          title: `Alternative View: ${query}`,
          imageUrl: `https://loremflickr.com/800/600/${cleanQuery}?random=2`,
          thumbnailUrl: `https://loremflickr.com/400/300/${cleanQuery}?random=2`,
          sourceUrl: `https://flickr.com/search/?q=${encodeURIComponent(query)}`,
          sourceName: 'Flickr (Public)',
          license: 'Creative Commons (Free)',
          altText: `An alternative visual representation of ${query}`,
        },
        {
          id: `keyless-3-${Date.now()}`,
          title: `Related details: ${query}`,
          imageUrl: `https://loremflickr.com/800/600/${cleanQuery}?random=3`,
          thumbnailUrl: `https://loremflickr.com/400/300/${cleanQuery}?random=3`,
          sourceUrl: `https://flickr.com/search/?q=${encodeURIComponent(query)}`,
          sourceName: 'Flickr (Public)',
          license: 'Creative Commons (Free)',
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

  private static async searchPexels(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn('[ImageSearch] PEXELS_API_KEY not set');
      return [];
    }

    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' health')}&per_page=${Math.min(count, 15)}&orientation=landscape`;
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

  private static async searchUnsplash(query: string, count: number): Promise<ImageResult[]> {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.warn('[ImageSearch] UNSPLASH_ACCESS_KEY not set');
      return [];
    }

    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' medical')}&per_page=${Math.min(count, 30)}&orientation=landscape`;
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

  private static async searchPixabay(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.PIXABAY_API_KEY;
    if (!apiKey) {
      console.warn('[ImageSearch] PIXABAY_API_KEY not set');
      return [];
    }

    const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(query + ' health')}&per_page=${Math.min(count, 20)}&image_type=photo&orientation=horizontal&safesearch=true`;
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

  private static async searchGoogle(query: string, count: number): Promise<ImageResult[]> {
    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const cx = process.env.GOOGLE_SEARCH_CX;

    if (!apiKey || !cx) {
      console.warn('[ImageSearch] GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_CX not set');
      return [];
    }

    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(query + ' health')}&searchType=image&num=${Math.min(count, 10)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) throw new Error(`Google Search API error: ${res.status}`);
    const data = await res.json();

    return (data.items || []).slice(0, count).map((item: any, idx: number) => ({
      id: `google-${idx}-${Date.now()}`,
      title: item.title || query,
      imageUrl: item.link,
      thumbnailUrl: item.image?.thumbnailLink || item.link,
      sourceUrl: item.image?.contextLink || 'https://google.com',
      sourceName: 'Google Search',
      license: 'Refer to source website',
      altText: item.title || query,
      width: item.image?.width,
      height: item.image?.height,
    }));
  }
}
