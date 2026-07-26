require('dotenv').config();
const Razorpay = require('razorpay');

async function test() {
  console.log('All env keys:', Object.keys(process.env).filter(k => k.toLowerCase().includes('razorpay') || k.toLowerCase().includes('key') || k.toLowerCase().includes('secret')));
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('Credentials missing');
    return;
  }

  const razorpay = new Razorpay({
    key_id: keyId,
    key_secret: keySecret
  });

  const options = {
    amount: 99900,
    currency: 'INR',
    receipt: `receipt_test_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    console.log('Order created successfully:', order);
  } catch (err) {
    console.error('Error creating order:', err);
  }
}

test();
