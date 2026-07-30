import { Provider } from './Provider';

export class FitbitProvider implements Provider {
  readonly id = 'fitbit';
  readonly name = 'Fitbit';

  async connect(): Promise<string | void> {
    console.log('[FitbitProvider] Connecting to Fitbit Web API...');
    return 'oauth_redirect_url';
  }

  async disconnect(accountId: string): Promise<boolean> {
    console.log(`[FitbitProvider] Disconnecting account ${accountId}`);
    return true;
  }

  async refreshToken(accountId: string): Promise<boolean> {
    console.log(`[FitbitProvider] Refreshing token for ${accountId}`);
    return true;
  }

  async fetchMetrics(accountId: string, startDate: Date, endDate: Date): Promise<any[]> {
    console.log(`[FitbitProvider] Fetching metrics from ${startDate} to ${endDate}`);
    return [];
  }

  async fetchDevice(accountId: string, deviceId: string): Promise<any> {
    console.log(`[FitbitProvider] Fetching device ${deviceId}`);
    return { model: 'Fitbit Charge 6', firmware: '1.2.3' };
  }

  async fetchBattery(accountId: string, deviceId: string): Promise<number | null> {
    console.log(`[FitbitProvider] Fetching battery for ${deviceId}`);
    return 100;
  }

  async fetchCapabilities(accountId: string, deviceId: string): Promise<string[]> {
    return ['heart_rate', 'hrv', 'sleep', 'steps', 'ecg', 'stress'];
  }

  async sync(accountId: string): Promise<boolean> {
    console.log(`[FitbitProvider] Syncing data for ${accountId}`);
    return true;
  }

  validateWebhook(payload: any, signature: string): boolean {
    return true;
  }
}
