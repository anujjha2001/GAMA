export class RetryEngine {
  /**
   * Executes a block with exponential backoff and jitter.
   * Only retries on specific retryable errors.
   */
  static async execute<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 500
  ): Promise<T> {
    let attempt = 0;
    
    while (true) {
      try {
        return await operation();
      } catch (error: any) {
        attempt++;
        
        const msg = error.message?.toLowerCase() || '';
        const isRetryable = 
          msg.includes('timeout') || 
          msg.includes('429') || 
          msg.includes('502') || 
          msg.includes('503') || 
          msg.includes('504') ||
          msg.includes('network');

        if (!isRetryable || attempt > maxRetries) {
          throw error;
        }

        // Exponential backoff with Full Jitter
        // https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
        const delay = Math.random() * (baseDelayMs * Math.pow(2, attempt - 1));
        console.warn(`[RetryEngine] Attempt ${attempt} failed. Retrying in ${Math.round(delay)}ms...`);
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
