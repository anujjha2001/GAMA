import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerUser } from '@/lib/auth/server-utils';

export async function GET(req: NextRequest) {
  try {
    const user = await getServerUser();
    
    let profile;
    if (user) {
      profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });
    } else {
      // Fallback for local development
      profile = await prisma.userProfile.findFirst({ select: { id: true } });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await prisma.settings.findUnique({
      where: { profileId: profile.id },
      select: {
        dashboardBackgroundType: true,
        dashboardBackgroundUrl: true,
        dashboardBackgroundOverlay: true,
        dashboardPlaybackOptions: true
      }
    });

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Failed to get background settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getServerUser();
    
    let profile;
    if (user) {
      profile = await prisma.userProfile.findUnique({
        where: { userId: user.id },
        select: { id: true }
      });
    } else {
      // Fallback for local development
      profile = await prisma.userProfile.findFirst({ select: { id: true } });
    }

    if (!profile) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const updated = await prisma.settings.upsert({
      where: { profileId: profile.id },
      update: {
        dashboardBackgroundType: body.type,
        dashboardBackgroundUrl: body.url,
        dashboardBackgroundOverlay: body.overlay,
        dashboardPlaybackOptions: body.playback
      },
      create: {
        profileId: profile.id,
        dashboardBackgroundType: body.type,
        dashboardBackgroundUrl: body.url,
        dashboardBackgroundOverlay: body.overlay,
        dashboardPlaybackOptions: body.playback
      }
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error('Failed to save background settings:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
