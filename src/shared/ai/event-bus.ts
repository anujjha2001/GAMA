type EventHandler = (data?: any) => void | Promise<void>;

export class AURAEventBus {
  private static listeners: Record<string, EventHandler[]> = {};

  static subscribe(event: string, handler: EventHandler) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(handler);
  }

  static async publish(event: string, data?: any) {
    console.log(`[AURAEventBus] Publishing event: ${event}`);
    const handlers = this.listeners[event] || [];
    for (const handler of handlers) {
      try {
        await handler(data);
      } catch (err) {
        console.error(`[AURAEventBus] Error in event listener for ${event}:`, err);
      }
    }
  }
}
