import { ImageProvider, ImageFetchResult } from './index';

/**
 * Gradient fallback provider — the final safety net.
 * Always healthy, always returns something.
 * Generates a unique deterministic SVG gradient per query.
 * Never relies on external network calls.
 */
export class GradientFallbackProvider implements ImageProvider {
  readonly name = 'GradientFallback';

  // Cannot be unhealthy — it's pure computation
  isHealthy() { return true; }
  markUnhealthy() {}

  async fetchImage(query: string, _usedUrls: Set<string>): Promise<ImageFetchResult> {
    const hash = this.hashString(query.toLowerCase());

    // Map hue based on query to produce cuisine-themed gradients
    const baseHue = hash % 360;
    const accentHue = (baseHue + 45) % 360;
    const sat = 30 + (hash % 20); // 30–50% saturation
    const light1 = 10 + (hash % 8); // 10–18% lightness
    const light2 = 18 + (hash % 10); // 18–28% lightness

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400">`,
      `<defs>`,
      `<linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">`,
      `<stop offset="0%" style="stop-color:hsl(${baseHue},${sat}%,${light1}%)"/>`,
      `<stop offset="60%" style="stop-color:hsl(${accentHue},${sat - 5}%,${light2}%)"/>`,
      `<stop offset="100%" style="stop-color:hsl(${baseHue},${sat + 5}%,${light1 + 4}%)"/>`,
      `</linearGradient>`,
      `<radialGradient id="r" cx="30%" cy="30%" r="60%">`,
      `<stop offset="0%" style="stop-color:rgba(255,255,255,0.03)"/>`,
      `<stop offset="100%" style="stop-color:rgba(0,0,0,0)"/>`,
      `</radialGradient>`,
      `</defs>`,
      `<rect width="600" height="400" fill="url(#g)"/>`,
      `<rect width="600" height="400" fill="url(#r)"/>`,
      `<text x="300" y="215" font-family="Georgia,serif" font-size="72" fill="rgba(255,255,255,0.06)" text-anchor="middle">🍽</text>`,
      `</svg>`,
    ].join('');

    const dataUri = `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
    return { url: dataUri, isVerified: false, providerName: this.name };
  }

  private hashString(str: string): number {
    let h = 0x811c9dc5;
    for (let i = 0; i < str.length; i++) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 0x01000193);
    }
    return Math.abs(h);
  }
}
