export class PromptGuard {
  /**
   * Validates and sanitizes the user prompt before sending it to the LLM.
   * Throws an error if the prompt violates safety rules.
   */
  static validate(prompt: string): string {
    if (!prompt || prompt.trim() === '') {
      throw new Error("Prompt cannot be empty");
    }

    if (prompt.length > 50000) {
      throw new Error("Prompt exceeds maximum allowed length");
    }

    // Basic PII sanitization (e.g., masking SSN or credit cards if this was a finance app)
    // For GAMA (Health app), we might want to ensure they aren't asking for critical emergency advice
    const lowerPrompt = prompt.toLowerCase();
    
    const emergencyKeywords = ['suicide', 'kill myself', 'heart attack right now', 'stroke right now', 'dying right now'];
    for (const keyword of emergencyKeywords) {
      if (lowerPrompt.includes(keyword)) {
        throw new Error("EMERGENCY_DETECTED: Please call your local emergency services (e.g., 911) immediately. Aura cannot provide emergency medical assistance.");
      }
    }

    // Prompt Injection checks
    const injectionKeywords = ['ignore all previous instructions', 'system prompt', 'you are now a'];
    for (const keyword of injectionKeywords) {
      if (lowerPrompt.includes(keyword)) {
        throw new Error("Invalid prompt structure detected. Please rephrase your health query.");
      }
    }

    return prompt.trim();
  }
}
