import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/auth/otp';
import { createSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, code } = body;

    const emailNormalized = email?.toLowerCase().trim();

    if (!emailNormalized || !code) {
      return NextResponse.json({ success: false, error: 'Email and verification code are required.' }, { status: 400 });
    }

    // Query OTP record
    const otpRecord = await prisma.verificationOtp.findUnique({
      where: { email: emailNormalized },
    });

    if (!otpRecord) {
      return NextResponse.json({ success: false, error: 'No active verification code found for this email.' }, { status: 401 });
    }

    // Increment attempt count
    const updatedOtp = await prisma.verificationOtp.update({
      where: { id: otpRecord.id },
      data: { attempts: { increment: 1 } },
    });

    // Check attempt limits
    if (updatedOtp.attempts > 5) {
      // Invalidate the OTP record due to safety reasons
      await prisma.verificationOtp.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return NextResponse.json(
        { success: false, error: 'Too many failed verification attempts. Please request a new code.' },
        { status: 401 }
      );
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      await prisma.verificationOtp.delete({ where: { id: otpRecord.id } }).catch(() => {});
      return NextResponse.json({ success: false, error: 'Verification code has expired. Please request a new code.' }, { status: 401 });
    }

    // Verify OTP using timing-safe comparison
    const isCodeValid = verifyOtp(code, otpRecord.otpHash);
    if (!isCodeValid) {
      return NextResponse.json(
        { success: false, error: `Invalid verification code. ${5 - updatedOtp.attempts} attempts remaining.` },
        { status: 401 }
      );
    }

    // Retrieve and update UserProfile
    const user = await prisma.userProfile.update({
      where: { email: emailNormalized },
      data: { emailVerified: true },
    });

    // Clean up OTP record
    await prisma.verificationOtp.delete({ where: { id: otpRecord.id } }).catch(() => {});

    // Create response and set JWT session cookie
    const response = NextResponse.json({
      success: true,
      message: 'Email successfully verified.',
      user: { fullName: user.fullName },
    });

    createSessionCookie(response, user, true);

    // Log security audit log
    await prisma.auditLog.create({
      data: {
        profileId: user.id,
        action: 'EMAIL_VERIFIED',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: { email: emailNormalized },
      },
    });

    return response;
  } catch (error: any) {
    console.error('Verify OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
