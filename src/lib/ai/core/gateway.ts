import { AuraOrchestrator } from './orchestrator';
import { GlobalQueue } from './queue';
import { prisma } from '@/lib/prisma';
import { ProviderRegistry } from './provider-registry';
import { AI_CONFIG } from '../config';

// Import providers
import { OpenAIProvider } from '../providers/openai-provider';
import { AnthropicProvider } from '../providers/anthropic-provider';
import { GeminiProvider } from '../providers/gemini-provider';
import { PoolsideProvider } from '../providers/poolside-provider';
import { OpenRouterProvider } from '../providers/openrouter-provider';

export class AIGateway {
  private static initialized = false;
  private static initPromise: Promise<void> | null = null;

  private static async initProviders() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = (async () => {
      // Dynamic import to avoid circular dependencies during boot
      const { StartupValidator } = await import('./startup-validator');
      
      if (AI_CONFIG.providers.openai.apiKey) {
        ProviderRegistry.register(new OpenAIProvider(AI_CONFIG.providers.openai.apiKey));
      } else {
        console.warn('[AIGateway] OPENAI_API_KEY not set; OpenAI provider will not be registered.');
      }

      if (AI_CONFIG.providers.anthropic.apiKey) {
        ProviderRegistry.register(new AnthropicProvider(AI_CONFIG.providers.anthropic.apiKey));
      } else {
        console.warn('[AIGateway] ANTHROPIC_API_KEY not set; Anthropic provider will not be registered.');
      }

      if (AI_CONFIG.providers.gemini.apiKey) {
        ProviderRegistry.register(new GeminiProvider(AI_CONFIG.providers.gemini.apiKey));
      } else {
        console.warn('[AIGateway] GEMINI_API_KEY not set; Gemini provider will not be registered.');
      }

      if (AI_CONFIG.providers.poolside.apiKey) {
        ProviderRegistry.register(new PoolsideProvider(AI_CONFIG.providers.poolside.apiKey));
      } else {
        console.warn('[AIGateway] POOLSIDE_API_KEY not set; Poolside provider will not be registered.');
      }

      if (AI_CONFIG.providers.openrouter.apiKey) {
        ProviderRegistry.register(new OpenRouterProvider(AI_CONFIG.providers.openrouter.apiKey));
      } else {
        console.warn('[AIGateway] OPENROUTER_API_KEY not set; OpenRouter provider will not be registered.');
      }


      await StartupValidator.validateProviders();
      
      this.initialized = true;
      this.initPromise = null;
    })();
    
    return this.initPromise;
  }

  static async handleRequest(req: Request, user: any): Promise<Response> {
    try {
      await this.initProviders();

      // 1. Parse Input
      const body = await req.json();
      const { messages, message, conversationId, isPremium, image } = body;
      
      let incomingUserMessage = '';
      if (messages && Array.isArray(messages) && messages.length > 0) {
        incomingUserMessage = String(messages[messages.length - 1].content || '').trim();
      } else if (message) {
        incomingUserMessage = String(message).trim();
      }

      if (image) {
        incomingUserMessage += `\n[User uploaded an image for analysis]`;
      }

      if (!incomingUserMessage) {
        return new Response(JSON.stringify({ success: false, error: "Empty message" }), { status: 400 });
      }

      // 2. Rate Limiting & Auth Check
      const dbUser = await prisma.userProfile.findUnique({ where: { id: user.id }});
      if (!dbUser) return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 });
      
      const now = new Date();
      let currentTokens = dbUser.auraTokens;
      let resetAt = dbUser.tokensResetAt ? new Date(dbUser.tokensResetAt) : new Date();

      // If the reset window has passed, reset tokens to max (20)
      if (now >= resetAt) {
        currentTokens = 20;
        resetAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours window
        await prisma.userProfile.update({
          where: { id: user.id },
          data: { auraTokens: currentTokens, tokensResetAt: resetAt }
        });
      }

      if (currentTokens <= 0) {
        // Exceeded token limits: Return a clean 429 response
        return new Response(JSON.stringify({
          success: false,
          error: "Too Many Requests",
          fallbackMessage: "Your tokens have been exhausted. They will refresh automatically after 2 hours."
        }), { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Decrement tokens and save
      const newTokens = currentTokens - 1;
      const updateData: any = { auraTokens: newTokens };
      if (newTokens === 0) {
        // Trigger the 2-hour refresh countdown starting now
        updateData.tokensResetAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      }

      await prisma.userProfile.update({
        where: { id: user.id },
        data: updateData
      });

      // 3. Request Classification (Simplified mock)
      const isMedical = incomingUserMessage.toLowerCase().includes('pain') || incomingUserMessage.toLowerCase().includes('doctor');
      const contextType = image ? 'vision' : (isMedical ? 'medical' : 'general');
      const priority = isMedical ? 'EMERGENCY' : (isPremium ? 'PREMIUM' : 'NORMAL');

      // Add image to the context messages if present
      let finalMessages = messages?.slice(0, -1) || [];
      if (image) {
        finalMessages.push({
          role: 'user',
          content: [
            { type: 'text', text: incomingUserMessage },
            { type: 'image_url', image_url: { url: image } }
          ]
        });
      } else {
        finalMessages.push({
          role: 'user',
          content: incomingUserMessage
        });
      }

      // 4. Global Queue
      return await GlobalQueue.enqueue(priority, async () => {
        return await AuraOrchestrator.execute({
          userId: user.id,
          conversationId,
          message: incomingUserMessage,
          messages: finalMessages,
          contextType
        });
      });

    } catch (err: any) {
      console.error('[AIGateway] Critical Gateway Failure:', err);
      // Absolute graceful degradation. No 500s.
      return new Response(JSON.stringify({
        success: false,
        fallbackMessage: "I'm experiencing an extremely high volume of thoughts. Give me a brief moment and try again."
      }), {
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
}
