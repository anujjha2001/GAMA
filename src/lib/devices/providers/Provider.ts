export interface Provider {
  /**
   * Uniquely identifies the provider (e.g., 'garmin', 'fitbit', 'oura')
   */
  readonly id: string;

  /**
   * Name of the provider (e.g., 'Garmin', 'Fitbit')
   */
  readonly name: string;

  /**
   * Initiate connection (OAuth flow or BLE pairing)
   */
  connect(): Promise<string | void>;

  /**
   * Disconnect the provider and clear tokens
   */
  disconnect(accountId: string): Promise<boolean>;

  /**
   * Refresh the access token using the refresh token
   */
  refreshToken(accountId: string): Promise<boolean>;

  /**
   * Fetch health metrics from the provider
   */
  fetchMetrics(accountId: string, startDate: Date, endDate: Date): Promise<any[]>;

  /**
   * Fetch device metadata (model, firmware, etc)
   */
  fetchDevice(accountId: string, deviceId: string): Promise<any>;

  /**
   * Fetch latest battery level for a device
   */
  fetchBattery(accountId: string, deviceId: string): Promise<number | null>;

  /**
   * Discover capabilities for a specific device
   */
  fetchCapabilities(accountId: string, deviceId: string): Promise<string[]>;

  /**
   * Trigger a manual sync for all supported data
   */
  sync(accountId: string): Promise<boolean>;

  /**
   * Validate incoming webhooks from this provider
   */
  validateWebhook(payload: any, signature: string): boolean;
}
