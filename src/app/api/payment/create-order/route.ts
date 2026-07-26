import { NextResponse, type NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in first.' }, { status: 401 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('[Payment Error]: Razorpay credentials are not configured in environment variables.');
      return NextResponse.json({ error: 'Payment gateway configuration error.' }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: 99900, // 999 INR in paise
      currency: 'INR',
      receipt: `rcpt_pro_${user.id.slice(0, 16)}_${Date.now().toString().slice(-4)}`
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId // Need to pass keyId to the frontend to initialize Checkout
    });

  } catch (error: any) {
    console.error('[Razorpay Create Order Error]:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create payment order.' },
      { status: 500 }
    );
  }
}
