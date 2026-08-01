import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { AIGateway } from '@/lib/ai/core/gateway';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const user = await verifyToken(req);

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized. Please log in to use AURA.' }, { status: 401 });
  }

  // Delegate the entire request lifecycle to the resilient AI Gateway
  return await AIGateway.handleRequest(req, user);
}
