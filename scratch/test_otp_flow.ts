import { generateOtp, hashOtp, verifyOtp, isProductionOtpMode } from '../src/lib/auth/otp';
import { getVerificationEmailTemplate } from '../src/lib/email/templates/verification';

async function testOtpFlow() {
  console.log('--- STARTING OTP SYSTEM TESTS ---');

  // Test 1: Secure OTP Generation
  console.log('\nTest 1: Generating secure 6-digit OTP...');
  const otp = generateOtp();
  console.log(`Generated OTP: ${otp}`);
  if (otp.length !== 6 || isNaN(Number(otp))) {
    throw new Error('OTP is not a 6-digit number!');
  }
  console.log('✓ Secure OTP generated correctly.');

  // Test 2: OTP Hashing and Timing-Safe Verification
  console.log('\nTest 2: Testing hashing and verification...');
  const hashed = hashOtp(otp);
  console.log(`Hashed OTP: ${hashed}`);

  const match = verifyOtp(otp, hashed);
  console.log(`Verification with correct OTP: ${match}`);
  if (!match) {
    throw new Error('Correct OTP failed verification!');
  }

  const mismatch = verifyOtp('000000', hashed);
  console.log(`Verification with incorrect OTP: ${mismatch}`);
  if (mismatch) {
    throw new Error('Incorrect OTP passed verification!');
  }
  console.log('✓ Hashing and timing-safe verification works.');

  // Test 3: Environment Detection
  console.log('\nTest 3: Testing environment detection...');
  
  // Save original environment
  const origNodeEnv = process.env.NODE_ENV;
  const origOtpMode = process.env.OTP_MODE;

  // Case A: Default (no environment variables set or normal)
  delete process.env.NODE_ENV;
  delete process.env.OTP_MODE;
  console.log(`Default mode isProductionOtpMode(): ${isProductionOtpMode()}`);
  if (isProductionOtpMode() !== true) {
    throw new Error('Default state should be production!');
  }

  // Case B: OTP_MODE=development
  process.env.OTP_MODE = 'development';
  console.log(`OTP_MODE=development isProductionOtpMode(): ${isProductionOtpMode()}`);
  if (isProductionOtpMode() !== false) {
    throw new Error('OTP_MODE=development should enable developer mode!');
  }

  // Case C: NODE_ENV=production overrides OTP_MODE=development
  process.env.NODE_ENV = 'production';
  process.env.OTP_MODE = 'development';
  console.log(`NODE_ENV=production, OTP_MODE=development isProductionOtpMode(): ${isProductionOtpMode()}`);
  if (isProductionOtpMode() !== true) {
    throw new Error('NODE_ENV=production must override development mode!');
  }

  // Case D: OTP_MODE=production overrides development
  delete process.env.NODE_ENV;
  process.env.OTP_MODE = 'production';
  console.log(`OTP_MODE=production isProductionOtpMode(): ${isProductionOtpMode()}`);
  if (isProductionOtpMode() !== true) {
    throw new Error('OTP_MODE=production must enable production mode!');
  }

  // Restore env
  if (origNodeEnv !== undefined) process.env.NODE_ENV = origNodeEnv;
  if (origOtpMode !== undefined) process.env.OTP_MODE = origOtpMode;
  console.log('✓ Environment detection rules checked.');

  // Test 4: Verification Template Customization
  console.log('\nTest 4: Checking verification template...');
  const templateWithUser = getVerificationEmailTemplate(otp, 'Alice Smith');
  const templateWithoutUser = getVerificationEmailTemplate(otp);

  if (!templateWithUser.includes('Alice Smith')) {
    throw new Error('Template should contain user name when available!');
  }
  if (templateWithoutUser.includes('Hello')) {
    throw new Error('Template should not greet when user name is not provided!');
  }
  if (!templateWithUser.includes('Expires in 10 minutes')) {
    throw new Error('Template expiration time should be 10 minutes!');
  }
  if (!templateWithUser.includes("Didn't request this?")) {
    throw new Error('Template should include "Didn\'t request this?" message!');
  }
  console.log('✓ Verification email templates customized correctly.');

  console.log('\n--- ALL OTP TESTS PASSED SUCCESSFULLY! ---');
}

testOtpFlow().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
