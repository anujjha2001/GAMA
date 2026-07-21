export type EventType = 
  | "MEAL_LOGGED"
  | "SLEEP_LOGGED"
  | "WORKOUT_COMPLETED"
  | "MEDICAL_REPORT_UPLOADED";

export interface AIEvent {
  type: EventType;
  profileId: string;
  payload: any;
  timestamp: Date;
}

export class QueueDispatcher {
  static async dispatch(event: AIEvent) {
    console.log(`[QueueDispatcher] Dispatching event: ${event.type} for profile: ${event.profileId}`);
    
    // In a real application, this would push to Inngest, BullMQ, or an API route.
    // For now, we will simulate asynchronous background processing by calling the Orchestrator directly
    // but not awaiting it, or using setTimeout.
    
    // This avoids circular dependencies if we just log for now, but to connect them:
    const { AIOrchestrator } = await import("../ai/services/orchestrator");
    
    setTimeout(() => {
      AIOrchestrator.handleEvent(event).catch(err => {
        console.error(`[QueueDispatcher] Error handling event ${event.type}:`, err);
      });
    }, 0);
  }
}
