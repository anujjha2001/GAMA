import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, code, fullName } = body;

    if (!email || !code) {
      return NextResponse.json({ success: false, error: 'Email and OTP code are required' }, { status: 400 });
    }

    const emailNormalized = email.toLowerCase().trim();

    // Query OTP record from database
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email: emailNormalized,
        code: code.trim(),
      }
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'Invalid verification code' }, { status: 401 });
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      // Clean up expired record
      await prisma.otp.delete({ where: { id: otpRecord.id } }).catch(() => { });
      return NextResponse.json({ success: false, error: 'Verification code has expired' }, { status: 401 });
    }

    // Clean up OTP record
    await prisma.otp.delete({ where: { id: otpRecord.id } }).catch(() => { });

    // Check if user already exists
    let user = await prisma.userProfile.findUnique({
      where: { email: emailNormalized }
    });

    // If not found, create new user profile
    if (!user) {
      user = await prisma.userProfile.create({
        data: {
          userId: crypto.randomUUID(),
          email: emailNormalized,
          fullName: fullName || emailNormalized.split('@')[0],
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
      sameSite: 'lax',
      httpOnly: true,
    });
    return response;
  } catch (error: any) {
    console.error('Verify OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
