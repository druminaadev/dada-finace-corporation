import { Redis } from 'ioredis';
import config from './env.js';

const redisOptions = {
  lazyConnect: true,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  retryStrategy: (times) => Math.min(times * 100, 3000),
};

if (config.redis.password) {
  redisOptions.password = config.redis.password;
}

const redis = new Redis(config.redis.url, redisOptions);

redis.on('error', (err) => {
  // Log connection errors but don't crash — app degrades gracefully
  console.error('[Redis] Connection error:', err.message);
});

redis.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('[Redis] Connected');
  }
});

export default redis;
