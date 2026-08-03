import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp, hashOtp, isProductionOtpMode } from '@/lib/auth/otp';
import { sendEmail } from '@/lib/email/sender';
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    const emailNormalized = email?.toLowerCase().trim();

    if (!emailNormalized) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.userProfile.findUnique({
      where: { email: emailNormalized },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'No account found with this email.' }, { status: 404 });
    }

    // Check if an OTP record already exists to enforce cooldown and counts
    const existingOtp = await prisma.verificationOtp.findUnique({
      where: { email: emailNormalized },
    });

    if (existingOtp) {
      const now = Date.now();
      const lastSent = existingOtp.updatedAt.getTime();
      const secondsSinceLast = (now - lastSent) / 1000;

      if (secondsSinceLast < 60) {
        return NextResponse.json(
          { success: false, error: `Please wait ${Math.ceil(60 - secondsSinceLast)} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    // Maximum resend limit check: max 5 resend requests within 1 hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const sentCount = await prisma.auditLog.count({
      where: {
        profileId: user.id,
        action: { in: ['OTP_SENT', 'OTP_RESENT'] },
        createdAt: { gte: oneHourAgo },
      },
    });

    if (sentCount >= 5) {
      return NextResponse.json(
        { success: false, error: 'Maximum resend limit reached. Please try again in an hour.' },
        { status: 429 }
      );
    }

    const plaintextOtp = generateOtp();
    const hashedOtpVal = hashOtp(plaintextOtp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Invalidate old OTP
    await prisma.verificationOtp.deleteMany({
      where: { email: emailNormalized },
    });

    // Create new OTP record
    await prisma.verificationOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashedOtpVal,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email
    const emailHtml = getVerificationEmailTemplate(plaintextOtp, user.fullName || undefined);
    const emailSent = await sendEmail({
      to: emailNormalized,
      subject: 'Verify your GAMA Account',
      html: emailHtml,
    });

    if (!emailSent) {
      console.error('[SEND-OTP] Email delivery failed for', emailNormalized);
      await prisma.verificationOtp.deleteMany({
        where: { email: emailNormalized },
      }).catch(() => {});
      return NextResponse.json(
        { success: false, error: "We couldn't send the verification email. Please try again in a few moments." },
        { status: 500 }
      );
    }

    // Log security audit
    await prisma.auditLog.create({
      data: {
        profileId: user.id,
        action: 'OTP_SENT',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: { email: emailNormalized },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent.',
      email: emailNormalized,
      ...(!isProductionOtpMode() ? { devOtp: plaintextOtp } : {}),
    });
  } catch (error: any) {
    console.error('Send OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
