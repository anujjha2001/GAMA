import crypto from 'crypto';

/**
 * Generates a cryptographically secure 6-digit OTP string.
 */
export function generateOtp(): string {
  // Generates integer between 100000 and 999999
  const val = crypto.randomInt(100000, 1000000);
  return val.toString();
}

/**
 * Hashes the plaintext OTP using SHA-256.
 * @param otp The plaintext 6-digit OTP
 */
export function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp.trim()).digest('hex');
}

/**
 * Checks if the submitted plaintext OTP matches the stored hash in a timing-safe manner.
 * @param submittedOtp Plaintext OTP from user
 * @param storedHash Hashed OTP from database
 */
export function verifyOtp(submittedOtp: string, storedHash: string): boolean {
  const submittedHash = hashOtp(submittedOtp);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'hex'),
      Buffer.from(storedHash, 'hex')
    );
  } catch {
    return false;
  }
}
