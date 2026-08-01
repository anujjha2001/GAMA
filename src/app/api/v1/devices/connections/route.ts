import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
// Use a generic mock user ID for now if session isn't available to keep UI alive without auth walls during dev

export async function GET(request: Request) {
  try {
    // 1. Get authenticated user (mocked to a default UUID for now if no auth is implemented yet)
    // const session = await getServerSession(authOptions);
    // if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // const profileId = session.user.id;
    const profileId = "default-user-profile-id"; // TODO: Replace with real auth

    // 2. Fetch connections
    const connections = await prisma.deviceConnection.findMany({
      where: { profileId },
      include: {
        capabilities: true,
        permissions: true,
        settings: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: connections });
  } catch (error) {
    console.error('[GET /api/v1/devices/connections] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch connections' }, { status: 500 });
  }
}
