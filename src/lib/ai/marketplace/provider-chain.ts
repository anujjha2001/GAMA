/**
 * Generic provider chain with automatic fallback and health tracking.
 *
 * Usage:
 *   const chain = new ProviderChain([providerA, providerB, providerC]);
 *   const result = await chain.execute(p => p.doSomething(args));
 *   // If providerA fails → tries providerB → tries providerC → throws if all fail
 */
export class ProviderChain<T extends { isHealthy(): boolean; readonly name: string }> {
  private _failures: string[] = [];

  constructor(private readonly providers: T[]) {}

  /** Returns failures from the most recent execute() call */
  getFailures(): string[] {
    return this._failures;
  }

  async execute<R>(fn: (provider: T) => Promise<R>): Promise<R> {
    this._failures = [];

    for (const provider of this.providers) {
      // Skip providers marked as temporarily unhealthy
      if (!provider.isHealthy()) {
        this._failures.push(`${provider.name}: skipped (unhealthy circuit open)`);
        continue;
      }

      try {
        return await fn(provider);
      } catch (err: any) {
        const isRateLimit =
          err?.status === 429 ||
          err?.message?.toLowerCase().includes('rate limit') ||
          err?.message?.includes('429');

        // Open circuit on rate limit — provider decides duration
        if (isRateLimit && typeof (provider as any).markUnhealthy === 'function') {
          (provider as any).markUnhealthy();
        }

        const reason = err?.message || 'unknown error';
        this._failures.push(`${provider.name}: ${reason}`);
        console.warn(`[ProviderChain] ${provider.name} failed, trying next:`, reason);
        // Continue to next provider
      }
    }

    const allFailed = `All providers failed. Attempts: ${this._failures.join(' | ')}`;
    throw new Error(allFailed);
  }
}
