import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, code, fullName, password } = body;

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

    const { firstName, lastName, username, dob, gender, height, weight, primaryGoal } = body;

    // Check if user already exists
    let user = await prisma.userProfile.findUnique({
      where: { email: emailNormalized }
    });

    // If not found, create new user profile with password & extended fields
    if (!user) {
      user = await prisma.userProfile.create({
        data: {
          userId: crypto.randomUUID(),
          email: emailNormalized,
          password: password || null,
          fullName: fullName || emailNormalized.split('@')[0],
          role: 'user',
          settings: {
            create: {
              theme: 'dark',
              notifications: true,
              language: 'en',
            }
          },
          preferences: {
            create: [
              { category: 'gender', value: gender || 'other' },
              { category: 'dob', value: dob || '' },
              { category: 'height', value: height?.toString() || '' },
              { category: 'weight', value: weight?.toString() || '' },
              { category: 'username', value: username || '' },
              { category: 'primaryGoal', value: primaryGoal || 'fitness' }
            ]
          }
        }
      });
    } else {
      // Update password and full name if provided
      user = await prisma.userProfile.update({
        where: { id: user.id },
        data: {
          password: password || user.password,
          fullName: fullName || user.fullName
        }
      });
    }

    // Generate JWT token
    const token = signToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName || emailNormalized.split('@')[0],
    });

    // Set the auth session cookie as the JWT token
    const response = NextResponse.json({ success: true, user: { fullName: user.fullName } });
    response.cookies.set('gama_session', token, {
      path: '/',
      maxAge: 86400,
      sameSite: 'lax',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch (error: any) {
    console.error('Verify OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
