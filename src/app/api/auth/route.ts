import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, email } = body;

    // Handle credentials or profile check/creation if it's login or register
    if (action === 'login') {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }
      
      // Check if user exists in database
      const user = await prisma.userProfile.findUnique({
        where: { email: email.toLowerCase().trim() }
      });
      
      if (!user) {
        return NextResponse.json({ 
          success: false, 
          error: 'No profile found for this email. Please register first.' 
        }, { status: 401 });
      }
    } else if (action === 'register') {
      if (!email) {
        return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
      }
      
      const emailNormalized = email.toLowerCase().trim();
      
      // Check if user already exists
      const existingUser = await prisma.userProfile.findUnique({
        where: { email: emailNormalized }
      });

      if (existingUser) {
        return NextResponse.json({ 
          success: false, 
          error: 'Email is already registered. Please login.' 
        }, { status: 400 });
      }

      // Create new user profile in database
      await prisma.userProfile.create({
        data: {
          userId: crypto.randomUUID(),
          email: emailNormalized,
          fullName: emailNormalized.split('@')[0],
          role: 'user',
          settings: {
            create: {
              theme: 'dark',
              notifications: true,
              language: 'en',
            }
          }
        }
      });
    }

    // Set the auth session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('gama_session', 'true', {
      path: '/',
      maxAge: 86400,
      sameSite: 'strict',
      httpOnly: true,
    });
    return response;
  } catch (error: any) {
    console.error('Authentication handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });
  response.cookies.set('gama_session', '', {
    path: '/',
    expires: new Date(0),
  });
  return response;
}
