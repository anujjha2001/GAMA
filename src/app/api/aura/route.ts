import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AIGateway } from '@/lib/ai/core/gateway';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in to use AURA.' }, { status: 401 });
    }

    // The entire enterprise architecture is handled behind the Gateway
    // This includes Rate Limiting, Prioritized Queueing, Safety Pipelines,
    // Context Building, Smart Provider Routing, Circuit Breaking, and Streaming.
    return await AIGateway.handleRequest(req as any, user);

  } catch (error: any) {
    console.error('[AURA Route Error]:', error?.message || error);
    // Absolute fallback if even the Gateway's outer try-catch fails
    return NextResponse.json(
      { success: false, fallbackMessage: 'AURA is temporarily unavailable.' },
      { status: 200 } // Always 200 to allow graceful frontend handling
    );
  }
}
