export const DATABASE_CONFIG = {
  caching: {
    redisUrl: process.env.REDIS_URL || null,
    ttlSec: 300, // 5 minutes cache TTL
  },
  pooling: {
    maxConnections: 10,
    idleTimeoutMs: 10000,
  }
};
