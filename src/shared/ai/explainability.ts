export interface ExplanationMetadata {
  confidence: number;
  reasoning: string;
  evidence: string;
  sources: string[];
  actionItems: string[];
}

export class ExplainabilityEngine {
  static formatExplanation(queryText: string, contextFound: boolean, details: Partial<ExplanationMetadata>): ExplanationMetadata {
    return {
      confidence: details.confidence ?? (contextFound ? 0.9 : 0.6),
      reasoning: details.reasoning ?? (contextFound ? "Based on active user biometric logs." : "Synthesized from general medical knowledge bases."),
      evidence: details.evidence ?? (contextFound ? "Matched user vital records, sleep quality, and active goals." : "No specific personal logs matched the query."),
      sources: details.sources ?? ['GAMA Biometric database', 'CDC Health Guidelines'],
      actionItems: details.actionItems ?? ['Discuss these metrics at your next clinical consultation.']
    };
  }
}
