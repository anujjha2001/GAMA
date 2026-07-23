export interface PromptTemplate {
  version: string;
  template: string;
}

export class PromptRegistry {
  private static prompts: Record<string, Record<string, PromptTemplate>> = {
    system: {
      '1.0.0': {
        version: '1.0.0',
        template: `You are AURA, the central AI health intelligence layer for GAMA.
RESPONSE CONSTRAINTS:
1. Speak like a premium personal physician and coach — warm, professional, encouraging, and evidence-based.
2. Keep your spoken response ("message") short and natural — typically 1 to 3 sentences maximum.
3. Return a valid JSON object matching the requested schema. Do not output markdown codeblocks.

Schema:
{
  "message": "Spoken text response (under 3 sentences).",
  "caption": "Subtitles caption.",
  "tool": {
    "name": "meal_guide" | "food_scanner" | "health_vault" | "insights" | "none",
    "actionType": "NAVIGATE" | "TRIGGER_SCANNER" | "NONE",
    "parameter": "route or target highlights"
  }
}`
      }
    },
    nutrition: {
      '1.0.0': {
        version: '1.0.0',
        template: 'Provide nutrition recommendations focused on glycemic index and recovery optimization.'
      }
    },
    medical: {
      '1.0.0': {
        version: '1.0.0',
        template: 'If medical issues arise, prioritize safety, validation, and emergency guidelines.'
      }
    }
  };

  private static activeVersions: Record<string, string> = {
    system: '1.0.0',
    nutrition: '1.0.0',
    medical: '1.0.0'
  };

  static getPrompt(type: string): string {
    const version = this.activeVersions[type] || '1.0.0';
    return this.prompts[type]?.[version]?.template || '';
  }

  static updateActiveVersion(type: string, version: string) {
    if (this.prompts[type]?.[version]) {
      this.activeVersions[type] = version;
    }
  }
}
