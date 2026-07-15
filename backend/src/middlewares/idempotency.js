import redis from '../config/redis.js';
import AppError from '../utils/appError.js';

const TTL_SECONDS = 86400; // 24 hours

/**
 * Idempotency middleware for payment/collection endpoints.
 * Requires X-Idempotency-Key header.
 */
export const idempotency = (prefix = 'idem') => async (req, res, next) => {
  const key = req.headers['x-idempotency-key'];
  if (!key) return next(new AppError('X-Idempotency-Key header required', 400));

  const redisKey = `${prefix}:${req.user?.id}:${key}`;

  try {
    const cached = await redis.get(redisKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      return res.status(parsed.status).json(parsed.body);
    }

    // Intercept response to cache it
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      if (res.statusCode < 500) {
        redis
          .setex(redisKey, TTL_SECONDS, JSON.stringify({ status: res.statusCode, body }))
          .catch(() => {});
      }
      return originalJson(body);
    };

    next();
  } catch {
    // Redis failure — allow request through (degrade gracefully)
    next();
  }
};
