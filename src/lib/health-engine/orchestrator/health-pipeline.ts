import { HealthData, UserBaseline, DashboardState, DashboardMetric, PredictionResult } from '../types';
import { DataValidator } from '../core/validation';
import { Normalizer } from '../core/normalization';
import { EngineRegistry } from '../engines/registry';
import { CorrelationEngine } from '../ai/correlation';
import { PredictionEngine } from '../ai/prediction';
import { ExplainabilityEngine } from '../ai/explainability';
import { RecommendationEngine } from '../ai/recommendation';
import { RulesEngine } from '../alerts/rules';
import { TimelineEngine } from '../timeline/timeline';

export class HealthPipeline {
  static run(
    rawInput: any,
    baseline: UserBaseline,
    historicalScores: Record<string, { score: number; timestamp: string }[]> = {}
  ): DashboardState {
    // 1. Validation & Data Quality Layer
    const validationResult = DataValidator.validate(rawInput);
    
    // 2. Normalization Layer
    const normalizedData = Normalizer.normalize(rawInput);

    // 3. Registered Engines Dynamic Execution Loop
    const engines = EngineRegistry.getEngines();
    const metrics: Record<string, DashboardMetric> = {};

    for (const engine of engines) {
      // Calculate scores (0-100 normalized output)
      const engineResult = engine.calculate(normalizedData, baseline, {});
      
      // Calculate explainability metrics
      const explanation = ExplainabilityEngine.explain(engine.id, engineResult, baseline);

      // Map raw 0-100 scores to display scales
      let displayValue = `${engineResult.score}%`;
      let gaugeValue = engineResult.score / 100;

      if (engine.id === "stress") {
        // Stress converts to 0.0 - 5.0 gauge index
        const indexValue = (engineResult.score / 20).toFixed(1);
        displayValue = `${indexValue} / 5.0`;
        gaugeValue = parseFloat(indexValue);
      } else if (engine.id === "sleep") {
        // Sleep duration display representation
        displayValue = `${normalizedData.sleepHours.toFixed(1)}h`;
      } else if (engine.id === "heart") {
        displayValue = `${normalizedData.currentHeartRate} BPM`;
      } else if (engine.id === "hrv") {
        displayValue = `${normalizedData.hrv} ms`;
      } else if (engine.id === "focus") {
        displayValue = `${engineResult.score}%`;
      }

      // Map status colors
      let color = "text-white";
      if (engineResult.status === "Excellent") color = "text-emerald-400";
      else if (engineResult.status === "Good") color = "text-green-400";
      else if (engineResult.status === "Average") color = "text-amber-400";
      else if (engineResult.status === "Poor") color = "text-amber-500";
      else if (engineResult.status === "Critical") color = "text-red-500";

      metrics[engine.id] = {
        id: engine.id,
        title: engine.name.replace(" Engine", ""),
        displayValue,
        rawScore: engineResult.score,
        gaugeValue,
        color,
        explanation: `${explanation.whyChange} ${explanation.improvement}`,
        confidence: Math.round(engineResult.confidence * (validationResult.confidenceBonus / 100)),
        factors: engineResult.factors,
        status: engineResult.status,
        history: historicalScores[engine.id] || [
          { score: engineResult.score, timestamp: new Date().toISOString() }
        ],
        quality: normalizedData.metadata.quality
      };
    }

    // 4. Prediction Engine (expected tomorrow forecast ranges)
    const predictions: Record<string, PredictionResult> = {};
    for (const key of Object.keys(metrics)) {
      const history = metrics[key].history.map(h => h.score);
      predictions[key] = PredictionEngine.predictMetric(metrics[key].rawScore, history);
    }

    // 5. Correlation Engine
    const correlations = CorrelationEngine.analyze(normalizedData, baseline);

    // 6. Recommendation Engine
    const recommendations = RecommendationEngine.generate(
      normalizedData,
      metrics["stress"]?.rawScore || 50,
      metrics["recovery"]?.rawScore || 70
    );

    // 7. Rules & Alert Engine
    const alerts = RulesEngine.evaluate(normalizedData);

    // 8. Event Timeline Engine
    const timeline = TimelineEngine.getTimelineEvents(normalizedData);

    return {
      metrics,
      predictions,
      recommendations,
      alerts,
      timeline,
      provider: normalizedData.metadata.source,
      quality: normalizedData.metadata.quality,
      lastSync: normalizedData.metadata.lastUpdated.toISOString()
    };
  }
}
