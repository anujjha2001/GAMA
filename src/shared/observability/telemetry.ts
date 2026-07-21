export class Telemetry {
  static startSpan(name: string) {
    const startTime = Date.now();
    return {
      name,
      end: () => {
        const duration = Date.now() - startTime;
        console.log(`[Telemetry] Span ${name} took ${duration}ms`);
        return duration;
      }
    };
  }
}
