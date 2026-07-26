import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment verification details.' }, { status: 400 });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keySecret) {
      console.error('[Payment Error]: Razorpay key secret is not configured.');
      return NextResponse.json({ error: 'Payment gateway configuration error.' }, { status: 500 });
    }

    // Verify signature using SHA256 HMAC
    const shasum = crypto.createHmac('sha256', keySecret);
    shasum.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const digest = shasum.digest('hex');

    if (digest !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Payment verification failed. Invalid signature.' }, { status: 400 });
    }

    // Upgrade user role in database to PRO
    try {
      await prisma.userProfile.update({
        where: { id: user.id },
        data: { role: 'PRO' }
      });
    } catch (dbError: any) {
      console.error('[Verify Signature DB Error]:', dbError?.message || dbError);
      return NextResponse.json({ error: 'Failed to update user profile to PRO in the database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully. User upgraded to PRO.'
    });

  } catch (error: any) {
    console.error('[Razorpay Verify Error]:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify payment.' },
      { status: 500 }
    );
  }
}
