export const BODY_TWIN_PROMPTS = {
  explainRecovery: (score: number, sleep: number, stress: number) => `
You are AURA Health Engine.
Explain recovery score ${score}% (Sleep: ${sleep}h, Stress level: ${stress}/10).
Detail cardiovascular load, local fatigue thresholds, and muscle recovery times in plain terms.
`
};
