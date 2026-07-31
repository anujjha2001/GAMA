import { AuraOrchestrator } from './orchestrator';
import { globalQueue } from './queue';
import { prisma } from '@/lib/prisma';

export class AIGateway {
  static async handleRequest(req: Request, user: any): Promise<Response> {
    try {
      // 1. Parse & Validate
      const body = await req.json();
      const { messages, message, conversationId } = body;
      
      let incomingUserMessage = '';
      if (messages && Array.isArray(messages) && messages.length > 0) {
        incomingUserMessage = String(messages[messages.length - 1].content || '').trim();
      } else if (message) {
        incomingUserMessage = String(message).trim();
      }

      if (!incomingUserMessage) {
        return new Response(JSON.stringify({ success: false, error: "Empty message" }), { status: 400 });
      }

      // 2. Token / Rate Limit Check
      const dbUser = await prisma.userProfile.findUnique({ where: { id: user.id }});
      if (!dbUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      if (dbUser.auraTokens <= 0) {
        // We will return a structured JSON error instead of raw 429
        return new Response(JSON.stringify({
          success: false,
          retryable: false,
          fallbackMessage: "Your Aura tokens are exhausted. Please check back later."
        }), { 
          status: 200, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Deduct Token
      await prisma.userProfile.update({
        where: { id: user.id },
        data: { auraTokens: { decrement: 1 } }
      });

      // 3. Queue Execution (Prevent Server Overload)
      // The queue guarantees that if there are 1000 concurrent requests, they are executed in order.
      return await globalQueue.enqueue('aura_core_queue', async () => {
        return await AuraOrchestrator.execute({
          userId: user.id,
          conversationId,
          message: incomingUserMessage,
          messages: messages?.slice(0, -1) || [], // context without the current message
          contextType: 'general' // A real implementation might use an intent classifier here
        });
      });

    } catch (err: any) {
      console.error('[AIGateway] Critical failure:', err);
      // Enterprise graceful degradation. Zero raw 500s.
      return new Response(JSON.stringify({
        success: false,
        retryable: true,
        estimatedRetry: 5000,
        fallbackMessage: "I'm experiencing an extremely high volume of thoughts. Give me a brief moment and try again."
      }), {
        status: 200, // Important: 200 OK so the frontend parses the JSON gracefully
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
