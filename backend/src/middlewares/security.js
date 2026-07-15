import helmet from 'helmet';
import cors from 'cors';
import { rateLimit } from 'express-rate-limit';
import config from '../config/env.js';

export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'none'"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
  frameguard: { action: 'deny' },
  hidePoweredBy: true,
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  noSniff: true,
  referrerPolicy: { policy: 'no-referrer' },
};

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      if (config.isProduction) return callback(new Error('Origin required'), false);
      return callback(null, true);
    }
    if (config.cors.origins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS: Origin '${origin}' not allowed`), false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id', 'X-Idempotency-Key'],
  exposedHeaders: ['X-Request-Id'],
  credentials: true,
  maxAge: 86400,
};

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts. Try again in 15 minutes.' },
  keyGenerator: (req) => `${req.ip}:${req.body?.email || ''}`,
});
