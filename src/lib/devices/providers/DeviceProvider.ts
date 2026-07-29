import { 
  UnifiedHealthMetric, 
  DeviceProviderCapabilities,
  OAuthCallbackData 
} from "../types";

export abstract class DeviceProvider {
  protected providerId: string;
  protected name: string;

  constructor(providerId: string, name: string) {
    this.providerId = providerId;
    this.name = name;
  }

  public getProviderId(): string {
    return this.providerId;
  }

  public getName(): string {
    return this.name;
  }

  public abstract getCapabilities(): DeviceProviderCapabilities;

  // OAuth Flow
  public abstract getAuthUrl(redirectUri: string, state?: string): string;
  
  public abstract connect(
    callbackData: OAuthCallbackData
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  
  public abstract refreshToken(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;

  // Data Sync
  public abstract fetchMetrics(
    accessToken: string,
    startDate: Date,
    endDate: Date,
    deviceId?: string
  ): Promise<UnifiedHealthMetric[]>;

  // Webhooks
  public abstract verifyWebhookSignature(payload: string, signature: string): boolean;
  
  // Conflict Resolution (can be overridden by specific providers if needed)
  public resolveConflicts(
    newMetrics: UnifiedHealthMetric[], 
    existingMetrics: UnifiedHealthMetric[],
    primaryDeviceProviderId?: string
  ): UnifiedHealthMetric[] {
    // Default strategy: If this is not the primary device for a metric, we might lower its confidence
    // In a real scenario, this would use the Multi-Device Merge Engine logic.
    return newMetrics;
  }
}
