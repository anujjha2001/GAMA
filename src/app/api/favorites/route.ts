import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: decoded.id }
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const restaurants = await prisma.savedRestaurant.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    const meals = await prisma.savedMeal.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, restaurants, meals });
  } catch (error: any) {
    console.error('[Favorites GET Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: decoded.id }
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { type } = body;

    if (type === 'restaurant') {
      const { restaurantId, name, platform, healthRating } = body;
      
      const existing = await prisma.savedRestaurant.findFirst({
        where: {
          profileId: profile.id,
          restaurantId: restaurantId
        }
      });

      if (existing) {
        return NextResponse.json({ success: true, restaurant: existing });
      }

      const newFav = await prisma.savedRestaurant.create({
        data: {
          profileId: profile.id,
          restaurantId: restaurantId,
          name: name,
          platform: platform || 'Swiggy',
          healthRating: typeof healthRating === 'number' ? healthRating : parseFloat(healthRating) || 0.0
        }
      });

      return NextResponse.json({ success: true, restaurant: newFav });
    } else if (type === 'meal') {
      const { mealId, name, restaurantName, platform, auraScore, calories, protein } = body;

      const existing = await prisma.savedMeal.findFirst({
        where: {
          profileId: profile.id,
          mealId: mealId
        }
      });

      if (existing) {
        return NextResponse.json({ success: true, meal: existing });
      }

      const newFav = await prisma.savedMeal.create({
        data: {
          profileId: profile.id,
          mealId: mealId,
          name: name,
          restaurantName: restaurantName,
          platform: platform || 'Swiggy',
          auraScore: parseInt(auraScore) || 0,
          calories: parseInt(calories) || 0,
          protein: parseFloat(protein) || 0.0
        }
      });

      return NextResponse.json({ success: true, meal: newFav });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('[Favorites POST Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const decoded = await verifyToken(req);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { id: decoded.id }
    });

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');

    if (!type || !id) {
      return NextResponse.json({ success: false, error: 'Missing type or id' }, { status: 400 });
    }

    if (type === 'restaurant') {
      await prisma.savedRestaurant.deleteMany({
        where: {
          profileId: profile.id,
          restaurantId: id
        }
      });
      return NextResponse.json({ success: true });
    } else if (type === 'meal') {
      await prisma.savedMeal.deleteMany({
        where: {
          profileId: profile.id,
          mealId: id
        }
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    console.error('[Favorites DELETE Error]:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
