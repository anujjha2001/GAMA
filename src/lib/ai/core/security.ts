export class SecurityPipeline {
  static validateInput(prompt: string): boolean {
    const maliciousPatterns = [
      /ignore previous instructions/i,
      /system prompt/i,
      /you are no longer aura/i
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(prompt)) {
        console.warn('[Security] Malicious prompt detected and blocked.');
        return false;
      }
    }
    return true;
  }

  static sanitizePII(prompt: string): string {
    // Basic PII masking (e.g. SSN or Emails)
    // For a real health app, you'd use a dedicated PII vault/model.
    return prompt.replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
                 .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]');
  }

  static validateOutput(response: string): string {
    // In production, you might pass the response through a secondary safety model before streaming.
    // Here we can strip out markdown code block anomalies or unsafe links.
    return response;
  }
}
