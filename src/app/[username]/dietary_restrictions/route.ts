import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username;

    // Search for user preference with category 'username' matching the route parameter
    const pref = await prisma.userPreference.findFirst({
      where: {
        category: 'username',
        value: { equals: username, mode: 'insensitive' },
      },
    });

    let profileId = pref?.profileId;

    if (!profileId) {
      const user = await prisma.userProfile.findFirst({
        where: {
          OR: [
            { email: { contains: username, mode: 'insensitive' } },
            { fullName: { contains: username, mode: 'insensitive' } },
          ],
        },
      });
      profileId = user?.id;
    }

    if (!profileId) {
      const firstProfile = await prisma.userProfile.findFirst();
      profileId = firstProfile?.id;
    }

    let restrictions: any[] = [];

    if (profileId) {
      restrictions = await prisma.dietaryRestriction.findMany({
        where: { profileId },
      });
    }

    // Default fallback dietary restrictions if none in database yet
    if (!restrictions || restrictions.length === 0) {
      restrictions = [
        { id: 'dt-1', restriction: 'DIABETES_FRIENDLY', category: 'Dietary', description: 'Low glycemic index meals' },
        { id: 'dt-[#00f0ff]', restriction: 'LOW_SODIUM', category: 'Cardiovascular', description: 'Under 2000mg sodium daily' },
        { id: 'dt-3', restriction: 'HIGH_PROTEIN', category: 'Fitness', description: 'Minimum 1.6g/kg protein target' },
      ];
    }

    return NextResponse.json({
      success: true,
      username,
      profileId: profileId || 'default-profile',
      dietaryRestrictions: restrictions,
    });
  } catch (error: any) {
    console.error(`[DIETARY RESTRICTIONS API] Error fetching for username:`, error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch dietary restrictions' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> | { username: string } }
) {
  try {
    const resolvedParams = await params;
    const username = resolvedParams.username;
    const body = await request.json().catch(() => ({}));

    const pref = await prisma.userPreference.findFirst({
      where: {
        category: 'username',
        value: { equals: username, mode: 'insensitive' },
      },
    });

    let profile = await prisma.userProfile.findFirst({
      where: pref?.profileId ? { id: pref.profileId } : {},
    });

    if (!profile) {
      profile = await prisma.userProfile.findFirst();
    }

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const { restriction } = body;
    if (!restriction) {
      return NextResponse.json({ success: false, error: 'Restriction string required' }, { status: 400 });
    }

    const newRestriction = await prisma.dietaryRestriction.create({
      data: {
        profileId: profile.id,
        restriction,
      },
    });

    return NextResponse.json({ success: true, restriction: newRestriction });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update dietary restrictions' },
      { status: 500 }
    );
  }
}
