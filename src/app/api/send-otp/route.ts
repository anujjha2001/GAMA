import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummy_key');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email is required' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    const emailNormalized = email.toLowerCase().trim();

    // Clean up older OTPs for this email address
    try {
      await prisma.otp.deleteMany({
        where: { email: emailNormalized }
      });
    } catch (e) {
      console.warn('Error deleting old OTP records:', e);
    }

    // Save the new OTP record to the database
    await prisma.otp.create({
      data: {
        email: emailNormalized,
        code: otpCode,
        expiresAt,
      }
    });

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey && apiKey !== 're_dummy_key') {
      try {
        await resend.emails.send({
          from: 'GAMA Verification <onboarding@resend.dev>', // Default testing domain for Resend sandbox
          to: emailNormalized,
          subject: 'GAMA verification code',
          html: `
            <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 16px; background-color: #0c0c0e; color: #ffffff;">
              <h2 style="color: #f97316; text-align: center; margin-bottom: 24px;">GAMA Security Verification</h2>
              <p>Your one-time verification code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; text-align: center; margin: 30px 0; color: #f97316;">
                ${otpCode}
              </div>
              <p style="color: #a3a3a3; font-size: 12px;">This code will expire in 5 minutes. If you did not request this code, you can safely ignore this email.</p>
            </div>
          `
        });
      } catch (emailErr: any) {
        console.error('Failed to send email via Resend API:', emailErr);
      }
    } else {
      console.log(`[DEV MODE] OTP generated for ${emailNormalized}: ${otpCode}`);
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      ...(process.env.NODE_ENV === 'development' && (!apiKey || apiKey === 're_dummy_key') ? { devOtp: otpCode } : {})
    });
  } catch (error: any) {
    console.error('Send OTP handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
