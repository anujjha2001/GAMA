import { HealthData, HealthAlert, HealthStatus } from '../types';
import { config } from '../core/config';

export class RulesEngine {
  static evaluate(data: HealthData): HealthAlert[] {
    const alerts: HealthAlert[] = [];
    const thresholds = config.thresholds;

    if (data.hrv < thresholds.hrv.low) {
      alerts.push({
        id: "alert_hrv",
        title: "Suppressed Autonomic Response",
        message: `HRV is critically low at ${data.hrv}ms. Your body is displaying signs of severe central nervous system strain or impending illness.`,
        severity: HealthStatus.Critical
      });
    }

    if (data.sleepHours < 5.0) {
      alerts.push({
        id: "alert_sleep",
        title: "Sleep Deprivation Risk",
        message: `Sleep duration was only ${data.sleepHours}h. Cognitive accuracy and physical reaction times are decreased.`,
        severity: HealthStatus.Poor
      });
    }

    if (data.bloodOxygen && data.bloodOxygen < thresholds.oxygen.low) {
      alerts.push({
        id: "alert_oxygen",
        title: "Sub-optimal SpO2 Levels",
        message: `Blood oxygen saturation is low at ${data.bloodOxygen}%. Ensure adequate ventilation or consult medical resources.`,
        severity: HealthStatus.Critical
      });
    }

    if (data.restingHeartRate > thresholds.restingHr.high) {
      alerts.push({
        id: "alert_rhr",
        title: "Elevated Resting Pulse",
        message: `Resting heart rate is elevated at ${data.restingHeartRate} BPM. Indicates physical fatigue, caffeine overload, or lack of recovery.`,
        severity: HealthStatus.Average
      });
    }

    return alerts;
  }
}
