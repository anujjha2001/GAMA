import crypto from 'crypto';

export class RequestTracer {
  static getTraceId(): string {
    return crypto.randomUUID();
  }
}
