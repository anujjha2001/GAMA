import { EngineResult, UserBaseline } from '../types';

export class ExplainabilityEngine {
  static explain(
    metricId: string,
    result: EngineResult,
    baseline: UserBaseline
  ): { whyChange: string; contributor: string; improvement: string } {
    let whyChange = "";
    let contributor = "";
    let improvement = "";

    const worstFactor = result.factors.reduce((prev, curr) => 
      curr.contribution < prev.contribution ? curr : prev
    , { metric: "None", contribution: 999 });

    contributor = worstFactor.metric !== "None" && worstFactor.contribution < 0
      ? `${worstFactor.metric} (Contribution: ${worstFactor.contribution}%)`
      : "Baseline Stasis (metrics within normal boundaries)";

    switch (metricId) {
      case "stress":
        whyChange = result.score > 60 
          ? "Stress is elevated due to a combination of suppressed HRV and sleep debt."
          : "Stress is calm due to stable parasympathetic rest signals.";
        improvement = "Try a 2-minute box breathing session (Inhale 4s, Hold 4s, Exhale 4s, Hold 4s).";
        break;
      case "sleep":
        whyChange = result.score < 70
          ? "Sleep quality dropped due to reduced REM/Deep sleep cycles."
          : "Sleep is highly restorative with healthy core sleep cycles.";
        improvement = "Maintain consistent sleep timing; limit screen light 1 hour before sleeping.";
        break;
      case "recovery":
        whyChange = result.score < 60
          ? "Recovery capacity is impaired. Biometrics show nervous fatigue."
          : "Recovery is optimal. Your cardiovascular systems are fully loaded.";
        improvement = "Adjust today's workout plan to a light walk or passive stretching.";
        break;
      default:
        whyChange = "Biometrics match normal averages. All systems stable.";
        improvement = "Maintain your current activity volume and diet structure.";
    }

    return { whyChange, contributor, improvement };
  }
}
