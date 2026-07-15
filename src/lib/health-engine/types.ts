export enum HealthStatus {
  Excellent = "Excellent",
  Good = "Good",
  Average = "Average",
  Poor = "Poor",
  Critical = "Critical"
}

export enum RecommendationSeverity {
  Critical = "Critical",
  High = "High",
  Medium = "Medium",
  Low = "Low"
}

export interface UserBaseline {
  hrvAvg7d: number;
  hrvAvg30d: number;
  restingHrAvg7d: number;
  sleepAvg7d: number;
  activityAvg7d: number;
  waterAvg7d: number;
  stressAvg7d: number;
}

export interface HealthMetadata {
  timestamp: Date;
  source: "apple" | "garmin" | "fitbit" | "oura" | "manual" | "mock";
  quality: "live" | "estimated" | "manual";
  lastUpdated: Date;
}

export interface ProviderCapabilities {
  supportsHRV: boolean;
  supportsBloodOxygen: boolean;
  supportsBloodPressure: boolean;
  supportsSleepStages: boolean;
  supportsWorkoutLogs: boolean;
}

export interface HealthData {
  metadata: HealthMetadata;
  capabilities: ProviderCapabilities;
  steps: number;
  sleepHours: number;
  sleepEfficiency: number;
  sleepStages: { deep: number; rem: number; light: number; awake: number };
  hrv: number;
  restingHeartRate: number;
  currentHeartRate: number;
  bloodOxygen?: number;
  bloodPressure?: { systolic: number; diastolic: number };
  waterIntakeMl: number;
  activeCalories: number;
  mood?: number;
  screenTimeMin?: number;
  deepWorkMin?: number;
}

export interface FactorScore {
  metric: string;
  contribution: number; // e.g. -18 or +12
}

export interface EngineResult {
  score: number; // 0-100
  confidence: number; // 0-100
  factors: FactorScore[];
  status: HealthStatus;
  algorithmVersion: string;
  generatedAt: Date;
  provider: string;
}

export interface DashboardMetric {
  id: string;
  title: string;
  displayValue: string;
  rawScore: number;
  gaugeValue: number;
  color: string;
  explanation: string;
  confidence: number;
  factors: FactorScore[];
  status: HealthStatus;
  history: { score: number; timestamp: string }[];
  quality: "live" | "estimated" | "manual";
}

export interface RegisteredHealthEngine {
  id: string;
  name: string;
  calculate(input: HealthData, baseline: UserBaseline, config: any): EngineResult;
}

export interface PredictionResult {
  expectedScore: number;
  rangeMin: number;
  rangeMax: number;
  confidence: number;
}

export interface Recommendation {
  id: string;
  text: string;
  severity: RecommendationSeverity;
  category: "hydration" | "sleep" | "activity" | "breathing" | "mind";
  generatedFrom: string[]; // list of engine ids contributing to this recommendation
}

export interface HealthAlert {
  id: string;
  title: string;
  message: string;
  severity: HealthStatus;
}

export interface HealthEvent {
  id: string;
  type: "workout" | "meal" | "meditation" | "sleep" | "stress_spike" | "coffee" | "hydration" | "hr_peak";
  title: string;
  timestamp: string;
  value?: string;
}

export interface DashboardState {
  metrics: Record<string, DashboardMetric>;
  predictions: Record<string, PredictionResult>;
  recommendations: Recommendation[];
  alerts: HealthAlert[];
  timeline: HealthEvent[];
  provider: string;
  quality: string;
  lastSync: string;
}
