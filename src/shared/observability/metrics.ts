export interface VoiceMetrics {
  aiLatencyMs: number;
  toolLatencyMs: number;
  dbLatencyMs: number;
  sttLatencyMs: number;
  ttsLatencyMs: number;
  memoryRetrievalMs: number;
  queueTimeMs: number;
  streamingStartMs: number;
  promptTokens: number;
  completionTokens: number;
  errorRate: number;
}

export class MetricsCollector {
  private static metrics: VoiceMetrics[] = [];

  static record(metric: Partial<VoiceMetrics>) {
    const fullMetric: VoiceMetrics = {
      aiLatencyMs: metric.aiLatencyMs || 0,
      toolLatencyMs: metric.toolLatencyMs || 0,
      dbLatencyMs: metric.dbLatencyMs || 0,
      sttLatencyMs: metric.sttLatencyMs || 0,
      ttsLatencyMs: metric.ttsLatencyMs || 0,
      memoryRetrievalMs: metric.memoryRetrievalMs || 0,
      queueTimeMs: metric.queueTimeMs || 0,
      streamingStartMs: metric.streamingStartMs || 0,
      promptTokens: metric.promptTokens || 0,
      completionTokens: metric.completionTokens || 0,
      errorRate: metric.errorRate || 0,
    };
    this.metrics.push(fullMetric);
    console.log('[MetricsCollector] Recorded:', fullMetric);
  }

  static getSummary() {
    if (this.metrics.length === 0) return null;
    const len = this.metrics.length;
    return {
      avgAiLatency: this.metrics.reduce((acc, m) => acc + m.aiLatencyMs, 0) / len,
      avgToolLatency: this.metrics.reduce((acc, m) => acc + m.toolLatencyMs, 0) / len,
      avgDbLatency: this.metrics.reduce((acc, m) => acc + m.dbLatencyMs, 0) / len,
      totalPromptTokens: this.metrics.reduce((acc, m) => acc + m.promptTokens, 0),
      totalCompletionTokens: this.metrics.reduce((acc, m) => acc + m.completionTokens, 0),
      errorCount: this.metrics.reduce((acc, m) => acc + (m.errorRate > 0 ? 1 : 0), 0)
    };
  }
}
