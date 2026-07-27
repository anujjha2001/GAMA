import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOtp, hashOtp } from '@/lib/auth/otp';
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

    const existingOtp = await prisma.verificationOtp.findUnique({
      where: { email: emailNormalized },
    });

    if (existingOtp) {
      const now = Date.now();
      const lastSent = existingOtp.updatedAt.getTime();
      const secondsSinceLast = (now - lastSent) / 1000;

      // 60s cooldown
      if (secondsSinceLast < 60) {
        return NextResponse.json(
          { success: false, error: `Please wait ${Math.ceil(60 - secondsSinceLast)} seconds before requesting a new code.` },
          { status: 429 }
        );
      }
    }

    const plaintextOtp = generateOtp();
    const hashedOtpVal = hashOtp(plaintextOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete existing OTP record
    await prisma.verificationOtp.deleteMany({
      where: { email: emailNormalized },
    });

    // Save new OTP
    await prisma.verificationOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashedOtpVal,
        expiresAt,
        attempts: 0,
      },
    });

    // Send the email
    const emailHtml = getVerificationEmailTemplate(plaintextOtp);
    const emailSent = await sendEmail({
      to: emailNormalized,
      subject: 'Verify your GAMA Account',
      html: emailHtml,
    });

    if (!emailSent) {
      console.error('[RESEND-OTP] Email delivery failed for', emailNormalized);
    }

    // Log security audit
    await prisma.auditLog.create({
      data: {
        profileId: user.id,
        action: 'OTP_RESENT',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: { email: emailNormalized },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code resent successfully.',
      email: emailNormalized,
      ...((!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) ? { devOtp: plaintextOtp } : {}),
    });
  } catch (error: any) {
    console.error('Resend OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
