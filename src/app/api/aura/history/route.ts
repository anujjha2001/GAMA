import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (id) {
      const conversation = await prisma.aIConversation.findUnique({
        where: { id },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' }
          }
        }
      });

      if (!conversation) {
        return NextResponse.json({ error: 'Conversation not found.' }, { status: 404 });
      }

      // Check ownership
      if (conversation.profileId !== user.id) {
        return NextResponse.json({ error: 'Forbidden. You do not own this conversation.' }, { status: 403 });
      }

      return NextResponse.json({ success: true, conversation });
    }

    const conversations = await prisma.aIConversation.findMany({
      where: { profileId: user.id },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    });

    return NextResponse.json({ success: true, conversations });
  } catch (err: any) {
    console.error('[AURA History API Error]:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
