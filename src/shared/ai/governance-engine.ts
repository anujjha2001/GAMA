export interface GovernanceResult {
  passed: boolean;
  overrideResponse?: string;
  cleansedText: string;
  hasDisclaimer: boolean;
}

export class GovernanceEngine {
  static evaluate(userInput: string, modelResponse: string): GovernanceResult {
    const normalizedInput = userInput.toLowerCase();
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'suicide', 'self harm', 'kill myself'];
    
    // 1. Health Safety Validation Check
    const needsEmergencyOverride = emergencyKeywords.some(kw => normalizedInput.includes(kw));
    
    if (needsEmergencyOverride) {
      return {
        passed: false,
        overrideResponse: "EMERGENCY WARNING: You are reporting potentially life-threatening symptoms. Please call 911 or visit the nearest emergency department immediately. Do not rely on an AI for urgent medical care.",
        cleansedText: "",
        hasDisclaimer: true
      };
    }

    // 2. Privacy filter & tone normalization
    let cleansed = modelResponse
      .replace(/\b(social security|ssn|password)\b/gi, '[REDACTED]')
      .trim();

    // 3. Add education disclaimers if medical advice is suggested
    let hasDisclaimer = false;
    const medicalAdviceKeywords = ['diagnose', 'disease', 'cure', 'prescribe', 'treatment', 'pill', 'doctor'];
    const referencesMedicine = medicalAdviceKeywords.some(kw => cleansed.toLowerCase().includes(kw));
    
    if (referencesMedicine && !cleansed.includes('disclaimer')) {
      cleansed += "\n\nDisclaimer: I am an AI assistant and not a medical doctor. Consult a healthcare professional before altering medication or treatment.";
      hasDisclaimer = true;
    }

    return {
      passed: true,
      cleansedText: cleansed,
      hasDisclaimer
    };
  }
}
