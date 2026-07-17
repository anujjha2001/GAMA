import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { signToken, verifyToken } from '@/lib/jwt';

export async function GET(request: NextRequest) {
  try {
    const decoded = await verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.userProfile.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, email, password, fullName } = body;

    const emailNormalized = email?.toLowerCase().trim();

    if (action === 'login') {
      if (!emailNormalized || !password) {
        return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
      }

      // Check user in database
      const user = await prisma.userProfile.findUnique({
        where: { email: emailNormalized }
      });

      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'No profile found for this email. Please register first.' 
        }, { status: 401 });
      }

      // Simple password check (if password exists in db)
      if (user.password && user.password !== password) {
        return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
      }

      // Sign JWT token
      const token = signToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName || emailNormalized.split('@')[0],
      });

      // Set the auth session cookie with JWT token
      const response = NextResponse.json({ success: true, user: { fullName: user.fullName } });
      response.cookies.set('gama_session', token, {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
      return response;

    } else if (action === 'register') {
      const { username } = body;
      if (!emailNormalized || !password || !fullName || !username) {
        return NextResponse.json({ success: false, error: 'Username, email, and password are required' }, { status: 400 });
      }

      // Check if user already exists with email
      const existingUserByEmail = await prisma.userProfile.findUnique({
        where: { email: emailNormalized }
      });

      if (existingUserByEmail) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email is already registered. Please login.' 
        }, { status: 400 });
      }

      // Pre-check succeeded
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Authentication handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('gama_session');
  return response;
}
