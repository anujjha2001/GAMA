export class CircuitBreaker {
  private static failures: Record<string, number> = {};
  private static disabledUntil: Record<string, number> = {};
  private static readonly MAX_FAILURES = 5;
  private static readonly COOLDOWN_MS = 60 * 1000; // 60 seconds

  static recordFailure(providerId: string) {
    this.failures[providerId] = (this.failures[providerId] || 0) + 1;
    if (this.failures[providerId] >= this.MAX_FAILURES) {
      this.trip(providerId);
    }
  }

  static recordSuccess(providerId: string) {
    this.failures[providerId] = 0;
    this.disabledUntil[providerId] = 0;
  }

  static trip(providerId: string) {
    console.warn(`[CircuitBreaker] Provider ${providerId} has failed ${this.MAX_FAILURES} times. Tripping circuit for ${this.COOLDOWN_MS / 1000}s.`);
    this.disabledUntil[providerId] = Date.now() + this.COOLDOWN_MS;
  }

  static isAvailable(providerId: string): boolean {
    if (this.disabledUntil[providerId] && Date.now() < this.disabledUntil[providerId]) {
      return false; // Circuit is open (tripped)
    }
    
    // Half-open state: time has passed, allow one request through to test
    // If it succeeds, recordSuccess will clear failures.
    // If it fails, recordFailure will immediately trip it again.
    return true; 
  }
}
