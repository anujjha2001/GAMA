import { z } from "zod";

// --- Unified Health Schema ---
export const MetricType = z.enum([
  "HEART_RATE",
  "HRV",
  "SPO2",
  "STEPS",
  "CALORIES",
  "SLEEP",
  "RESPIRATION",
  "STRESS",
  "RECOVERY",
  "TEMPERATURE",
  "BLOOD_PRESSURE",
  "WEIGHT",
  "BODY_FAT",
  "GLUCOSE",
  "HYDRATION",
  "WORKOUT",
  "VO2_MAX",
]);

export type MetricType = z.infer<typeof MetricType>;

export const UnifiedHealthMetricSchema = z.object({
  metricType: MetricType,
  value: z.any(), // Structure depends on metric (e.g. float for weight, complex object for sleep)
  unit: z.string(),
  provider: z.string(),
  deviceId: z.string().optional(),
  recordedAt: z.date(),
  confidence: z.number().min(0).max(1).default(1.0),
  qualityScore: z.number().min(0).max(1).default(1.0),
  metadata: z.record(z.string(), z.any()).optional(),
});

export type UnifiedHealthMetric = z.infer<typeof UnifiedHealthMetricSchema>;

// --- Provider Architecture ---
export interface DeviceProviderCapabilities {
  supportedMetrics: MetricType[];
  supportsAutoSync: boolean;
  supportsRealtime: boolean;
  requiresOAuth: boolean;
}

export interface OAuthCallbackData {
  code: string;
  state?: string;
  [key: string]: any;
}

export interface SyncResult {
  success: boolean;
  metricsImported: number;
  error?: string;
}

// Represents the standard format all providers must implement
export interface IDeviceProvider {
  providerId: string;
  name: string;
  
  getCapabilities(): DeviceProviderCapabilities;
  
  // OAuth Flow
  getAuthUrl(redirectUri: string): string;
  connect(callbackData: OAuthCallbackData): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }>;
  
  // Data Sync
  fetchMetrics(accessToken: string, startDate: Date, endDate: Date): Promise<UnifiedHealthMetric[]>;
  
  // Webhooks
  verifyWebhookSignature(payload: string, signature: string): boolean;
}
