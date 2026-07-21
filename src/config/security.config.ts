export const SECURITY_CONFIG = {
  rateLimits: {
    voiceRequestsPerMinute: 60,
    chatRequestsPerMinute: 60,
  },
  encryption: {
    algorithm: 'aes-256-cbc',
    secretKey: process.env.ENCRYPTION_KEY || 'a3c7c25d886bc6a56e01a88b1f5e921d', // must be 32 bytes
  },
  session: {
    ttlMs: 24 * 60 * 60 * 1000, // 24 hours
  }
};
