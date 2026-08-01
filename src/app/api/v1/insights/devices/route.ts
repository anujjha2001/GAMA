import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const profileId = "default-user-profile-id"; // TODO: auth
    
    const insights = await prisma.aIInsight.findMany({
      where: { 
        profileId,
        // Optional: filter by device category if we had one in DB, for now fetch recent
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });
    
    return NextResponse.json({ success: true, data: insights });
  } catch (error) {
    console.error('[GET /api/v1/insights/devices] Error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch insights' }, { status: 500 });
  }
}
