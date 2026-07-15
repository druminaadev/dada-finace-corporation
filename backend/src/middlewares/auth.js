import jwt from 'jsonwebtoken';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/appError.js';
import prisma from '../config/database.js';
import config from '../config/env.js';

/**
 * Verifies Bearer access token and attaches user to req.user.
 */
export const authenticate = asyncHandler(async (req, _res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) throw new AppError('Access token required', 401);

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret, { algorithms: ['HS256'] });
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new AppError('Access token expired', 401);
    throw new AppError('Invalid access token', 401);
  }

  if (!decoded.userId || !decoded.role) throw new AppError('Malformed token payload', 401);

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, email: true, name: true, role: true, branchId: true, isActive: true },
  });

  if (!user || !user.isActive) throw new AppError('User not found or deactivated', 401);

  req.user = user;
  next();
});

/**
 * Role-based access control.
 * @param {...string} roles
 */
export const authorize = (...roles) => {
  return (req, _res, next) => {
    if (!req.user) return next(new AppError('Authentication required', 401));
    if (!roles.includes(req.user.role)) {
      return next(new AppError('Insufficient permissions', 403));
    }
    next();
  };
};
