export class RetryService {
  static async withExponentialBackoff<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
  ): Promise<T> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        const isRetryable = this.isRetryableError(error);
        if (!isRetryable || attempt >= maxRetries) {
          throw error;
        }

        // Exponential backoff with jitter
        const jitter = Math.random() * 200;
        const delay = (baseDelayMs * Math.pow(2, attempt - 1)) + jitter;
        
        console.log(`[RetryService] Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`);
        await new Promise(res => setTimeout(res, delay));
      }
    }
    throw new Error("Max retries exceeded");
  }

  private static isRetryableError(error: any): boolean {
    const msg = error?.message?.toLowerCase() || "";
    // 429 Too Many Requests, 500 Internal, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout, fetch failed
    return (
      msg.includes("429") || 
      msg.includes("500") || 
      msg.includes("502") || 
      msg.includes("503") || 
      msg.includes("504") || 
      msg.includes("timeout") ||
      msg.includes("fetch failed") ||
      msg.includes("econnreset")
    );
  }
}
