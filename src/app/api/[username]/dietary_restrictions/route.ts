import { NextResponse, type NextRequest } from 'next/server';
import { GET as handlerGet, POST as handlerPost } from '@/app/[username]/dietary_restrictions/route';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ username: string }> | { username: string } }
) {
  return handlerGet(request, context);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ username: string }> | { username: string } }
) {
  return handlerPost(request, context);
}
