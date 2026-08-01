import { ProviderRegistry } from './provider-registry';
import { HealthMonitor } from './health-monitor';

export class StartupValidator {
  /**
   * Run this once during system boot to validate API keys and endpoints.
   * Disables invalid providers immediately before they handle user traffic.
   */
  static async validateProviders() {
    console.log('[AURA Startup] Validating Enterprise AI Providers in parallel...');
    const providers = ProviderRegistry.getAllProviders();

    await Promise.all(providers.map(async (provider) => {
      try {
        // We do a lightweight abortable fetch to validate the endpoint.
        const testController = new AbortController();
        const timeout = setTimeout(() => testController.abort(), 4000); // 4 second timeout for validation

        try {
          const response = await provider.generate(
            { messages: [{ role: 'user', content: 'health_check' }], max_tokens: 1, stream: false },
            testController
          );
          
          if (!response.ok) {
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
        const errMsg = err.message || String(err);
        const isDefinitiveFailure = errMsg.includes('HTTP 401') || errMsg.includes('HTTP 403') || errMsg.includes('HTTP 404');
        
        if (isDefinitiveFailure) {
          HealthMonitor.markUnavailable(provider.id, `Startup Validation Failed (Definitive): ${errMsg}`);
        } else {
          console.warn(`[AURA Startup] Provider ${provider.id} validation warning (transient): ${errMsg}. Keeping provider enabled.`);
          HealthMonitor.markAvailable(provider.id); // Ensure it is available
        }
      }
    }));
  }
}
