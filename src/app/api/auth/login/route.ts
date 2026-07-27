import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/auth/password';
import { generateOtp, hashOtp } from '@/lib/auth/otp';
import { sendEmail } from '@/lib/email/sender';
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification';
import { createSessionCookie } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    const emailNormalized = email?.toLowerCase().trim();

    if (!emailNormalized || !password) {
      return NextResponse.json({ success: false, error: 'Email and password are required' }, { status: 400 });
    }

    const user = await prisma.userProfile.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No profile found for this email. Please register first.' },
        { status: 401 }
      );
    }

    // Verify hashed password
    const isPasswordValid = await verifyPassword(password, user.password || '');
    if (!isPasswordValid) {
      return NextResponse.json({ success: false, error: 'Invalid email or password.' }, { status: 401 });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      // Generate a new OTP and redirect to verification
      const plaintextOtp = generateOtp();
      const hashedOtpVal = hashOtp(plaintextOtp);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      await prisma.verificationOtp.deleteMany({
        where: { email: emailNormalized },
      });

      await prisma.verificationOtp.create({
        data: {
          email: emailNormalized,
          otpHash: hashedOtpVal,
          expiresAt,
          attempts: 0,
        },
      });

      // Send verification email
      const emailHtml = getVerificationEmailTemplate(plaintextOtp);
      const emailSent = await sendEmail({
        to: emailNormalized,
        subject: 'Verify your GAMA Account',
        html: emailHtml,
      });

      if (!emailSent) {
        console.error('[LOGIN] Email delivery failed for unverified user', emailNormalized);
      }

      await prisma.auditLog.create({
        data: {
          profileId: user.id,
          action: 'LOGIN_ATTEMPT_UNVERIFIED',
          ipAddress: request.headers.get('x-forwarded-for') || null,
          userAgent: request.headers.get('user-agent') || null,
          metadata: { email: emailNormalized },
        },
      });

      return NextResponse.json({
        success: false,
        needsVerification: true,
        email: emailNormalized,
        ...((!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) ? { devOtp: plaintextOtp } : {}),
      });
    }

    // Email is verified, create session
    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: { fullName: user.fullName },
    });

    createSessionCookie(response, user, true);

    // Audit log login
    await prisma.auditLog.create({
      data: {
        profileId: user.id,
        action: 'USER_LOGIN',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: { email: emailNormalized },
      },
    });

    return response;
  } catch (error: any) {
    console.error('Login handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
