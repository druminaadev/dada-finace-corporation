import { ZodError } from 'zod';
import AppError from '../utils/appError.js';

/**
 * Recursively sanitize strings to prevent XSS (no external dep needed).
 */
const sanitize = (obj) => {
  if (typeof obj === 'string') {
    return obj.trim().replace(/[<>]/g, (c) => (c === '<' ? '&lt;' : '&gt;'));
  }
  if (Array.isArray(obj)) return obj.map(sanitize);
  if (obj !== null && typeof obj === 'object') {
    return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, sanitize(v)]));
  }
  return obj;
};

/**
 * Validate and sanitize request data using a Zod schema.
 * @param {import('zod').ZodSchema} schema
 * @param {'body'|'query'|'params'} target
 */
export const validate = (schema, target = 'body') => {
  return (req, _res, next) => {
    try {
      const sanitized = sanitize(req[target]);
      req[target] = schema.parse(sanitized);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
        return next(new AppError('Validation failed', 400, errors));
      }
      next(err);
    }
  };
};
