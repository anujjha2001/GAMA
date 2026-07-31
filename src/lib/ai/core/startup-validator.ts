import { ProviderRegistry } from './provider-registry';
import { HealthMonitor } from './health-monitor';

export class StartupValidator {
  /**
   * Run this once during system boot to validate API keys and endpoints.
   * Disables invalid providers immediately before they handle user traffic.
   */
  static async validateProviders() {
    console.log('[AURA Startup] Validating Enterprise AI Providers...');
    const providers = ProviderRegistry.getAllProviders();

    for (const provider of providers) {
      try {
        // We do a lightweight abortable fetch to validate the endpoint.
        // We aren't doing a real generate to save tokens, but we can check if it returns 401/404.
        const testController = new AbortController();
        const timeout = setTimeout(() => testController.abort(), 5000); // 5 second timeout for health checks

        try {
          const response = await provider.generate(
            { messages: [{ role: 'user', content: 'health_check' }], max_tokens: 1, stream: false },
            testController
          );
          
          if (!response.ok) {
            // A 400 Bad Request might happen if the model is bad, but 401/403 means auth is definitely broken.
            // 404 means the endpoint/model is invalid.
            if (response.status === 401 || response.status === 403 || response.status === 404) {
              throw new Error(`Critical Provider Error: HTTP ${response.status}`);
            }
          }

          HealthMonitor.markAvailable(provider.id);
          console.log(`[AURA Startup] Provider ${provider.id} is healthy and validated.`);
        } catch (innerErr: any) {
          throw innerErr;
        } finally {
          clearTimeout(timeout);
        }
      } catch (err: any) {
        // If validation fails, we instantly mark it unavailable and log internally.
        HealthMonitor.markUnavailable(provider.id, `Startup Validation Failed: ${err.message}`);
        // The provider remains in the registry but HealthMonitor says it's unavailable, 
        // so it will never be routed to.
      }
    }
  }
}
