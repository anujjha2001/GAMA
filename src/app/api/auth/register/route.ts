import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { generateOtp, hashOtp } from '@/lib/auth/otp';
import { sendEmail } from '@/lib/email/sender';
import { getVerificationEmailTemplate } from '@/lib/email/templates/verification';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      email,
      password,
      confirmPassword,
      firstName,
      lastName,
      username,
      dob,
      gender,
      height,
      weight,
      primaryGoal,
    } = body;

    const emailNormalized = email?.toLowerCase().trim();

    if (!emailNormalized || !password || !confirmPassword || !firstName || !lastName || !username) {
      return NextResponse.json(
        { success: false, error: 'All required registration fields must be filled.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'Passwords do not match.' }, { status: 400 });
    }

    // Password strength check
    const strengthCheck = validatePasswordStrength(password);
    if (!strengthCheck.valid) {
      return NextResponse.json({ success: false, error: strengthCheck.error }, { status: 400 });
    }

    // Duplicate email check
    const existingUser = await prisma.userProfile.findUnique({
      where: { email: emailNormalized },
    });
    if (existingUser) {
      return NextResponse.json(
        { success: false, error: 'Email is already registered. Please login.' },
        { status: 400 }
      );
    }

    // Duplicate username check
    const existingUsername = await prisma.userPreference.findFirst({
      where: {
        category: 'username',
        value: { equals: username.trim(), mode: 'insensitive' },
      },
    });
    if (existingUsername) {
      return NextResponse.json(
        { success: false, error: 'Username is already taken. Please choose another.' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create UserProfile (emailVerified defaults to false)
    const user = await prisma.userProfile.create({
      data: {
        userId: crypto.randomUUID(),
        email: emailNormalized,
        password: hashedPassword,
        fullName: `${firstName} ${lastName}`,
        role: 'user',
        emailVerified: false,
        settings: {
          create: {
            theme: 'dark',
            notifications: true,
            language: 'en',
          },
        },
        preferences: {
          create: [
            { category: 'gender', value: gender || 'other' },
            { category: 'dob', value: dob || '' },
            { category: 'height', value: height?.toString() || '' },
            { category: 'weight', value: weight?.toString() || '' },
            { category: 'username', value: username || '' },
            { category: 'primaryGoal', value: primaryGoal || 'fitness' },
          ],
        },
      },
    });

    // Generate secure 6-digit OTP
    const plaintextOtp = generateOtp();
    const hashedOtpVal = hashOtp(plaintextOtp);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Delete any old OTPs for this email first
    await prisma.verificationOtp.deleteMany({
      where: { email: emailNormalized },
    });

    // Create VerificationOtp record
    await prisma.verificationOtp.create({
      data: {
        email: emailNormalized,
        otpHash: hashedOtpVal,
        expiresAt,
        attempts: 0,
      },
    });

    // Send email
    const emailHtml = getVerificationEmailTemplate(plaintextOtp);
    const emailSent = await sendEmail({
      to: emailNormalized,
      subject: 'Verify your GAMA Account',
      html: emailHtml,
    });

    if (!emailSent) {
      console.error('[REGISTER] Email delivery failed for', emailNormalized);
    }

    // Log registration audit log
    await prisma.auditLog.create({
      data: {
        profileId: user.id,
        action: 'USER_REGISTERED',
        ipAddress: request.headers.get('x-forwarded-for') || null,
        userAgent: request.headers.get('user-agent') || null,
        metadata: { email: emailNormalized },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Verification code sent.',
      email: emailNormalized,
      // For development local testing, return devOtp if Gmail credentials aren't set
      ...((!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) ? { devOtp: plaintextOtp } : {}),
    });
  } catch (error: any) {
    console.error('Registration handler error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
