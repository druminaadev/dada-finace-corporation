import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../../config/database.js';
import config from '../../config/env.js';
import AppError from '../../utils/appError.js';
import { logAuthEvent } from '../../utils/logger.js';

const signAccessToken = (user) =>
  jwt.sign(
    { userId: user.id, role: user.role, branchId: user.branchId },
    config.jwt.accessSecret,
    { expiresIn: config.jwt.accessExpiry, algorithm: 'HS256' }
  );

const signRefreshToken = (userId) =>
  jwt.sign(
    { userId, jti: uuidv4() },
    config.jwt.refreshSecret,
    { expiresIn: config.jwt.refreshExpiry, algorithm: 'HS256' }
  );

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/api/v1/auth/refresh',
};

class AuthService {
  async register(data) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError('Email already registered', 409);

    const hashedPassword = await argon2.hash(data.password);

    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        role: data.role || 'EMPLOYEE',
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
  }

  async login(email, password, ip) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      logAuthEvent('ACCOUNT_LOCKED', { ip, email });
      throw new AppError(`Account locked until ${user.lockedUntil.toISOString()}`, 423);
    }

    // Always verify to prevent timing attacks
    const hash = user?.password || '$argon2id$v=19$m=65536,t=3,p=4$placeholder';
    let isValid = false;
    try {
      isValid = await argon2.verify(hash, password);
    } catch {
      isValid = false;
    }

    if (!user || !user.isActive || !isValid) {
      if (user) {
        const attempts = (user.loginAttempts || 0) + 1;
        const shouldLock = attempts >= config.lockout.maxAttempts;
        await prisma.user.update({
          where: { id: user.id },
          data: {
            loginAttempts: attempts,
            lockedUntil: shouldLock ? new Date(Date.now() + config.lockout.durationMs) : null,
          },
        });
      }
      logAuthEvent('LOGIN_FAILED', { ip, email });
      throw new AppError('Invalid email or password', 401);
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user.id);

    // Store hashed refresh token in session table
    const hashedRefresh = await argon2.hash(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.userSession.create({
        data: {
          userId: user.id,
          refreshToken: hashedRefresh,
          ipAddress: ip,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: { loginAttempts: 0, lockedUntil: null, lastLoginAt: new Date(), lastLoginIp: ip },
      }),
    ]);

    logAuthEvent('LOGIN_SUCCESS', { ip, email, userId: user.id });

    return {
      user: { id: user.id, email: user.email, name: user.name, role: user.role, branchId: user.branchId },
      accessToken,
      refreshToken,
      refreshCookieOptions,
    };
  }

  async refreshToken(token, ip) {
    if (!token) throw new AppError('Refresh token required', 401);

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.refreshSecret, { algorithms: ['HS256'] });
    } catch {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    // Find valid sessions for this user
    const sessions = await prisma.userSession.findMany({
      where: { userId: decoded.userId, isRevoked: false, expiresAt: { gt: new Date() } },
    });

    let matchedSession = null;
    for (const session of sessions) {
      try {
        if (await argon2.verify(session.refreshToken, token)) {
          matchedSession = session;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!matchedSession) {
      // Possible reuse — revoke all sessions
      await prisma.userSession.updateMany({
        where: { userId: decoded.userId },
        data: { isRevoked: true, revokedAt: new Date() },
      });
      logAuthEvent('TOKEN_REUSE_DETECTED', { ip, userId: decoded.userId });
      throw new AppError('Refresh token invalid or reused', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true, branchId: true, isActive: true },
    });

    if (!user?.isActive) throw new AppError('Account deactivated', 401);

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user.id);
    const hashedRefresh = await argon2.hash(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.userSession.update({
        where: { id: matchedSession.id },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
      prisma.userSession.create({
        data: { userId: user.id, refreshToken: hashedRefresh, ipAddress: ip, expiresAt },
      }),
    ]);

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, refreshCookieOptions };
  }

  async logout(userId, sessionToken, ip) {
    if (sessionToken) {
      const sessions = await prisma.userSession.findMany({
        where: { userId, isRevoked: false },
      });
      for (const session of sessions) {
        try {
          if (await argon2.verify(session.refreshToken, sessionToken)) {
            await prisma.userSession.update({
              where: { id: session.id },
              data: { isRevoked: true, revokedAt: new Date() },
            });
            break;
          }
        } catch {
          continue;
        }
      }
    }
    logAuthEvent('LOGOUT', { ip, userId });
  }

  async logoutAll(userId, ip) {
    await prisma.userSession.updateMany({
      where: { userId },
      data: { isRevoked: true, revokedAt: new Date() },
    });
    logAuthEvent('LOGOUT_ALL', { ip, userId });
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const valid = await argon2.verify(user.password, currentPassword);
    if (!valid) throw new AppError('Current password is incorrect', 400);

    const hashed = await argon2.hash(newPassword);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { password: hashed, passwordChangedAt: new Date() },
      }),
      prisma.userSession.updateMany({
        where: { userId },
        data: { isRevoked: true, revokedAt: new Date() },
      }),
    ]);
  }
}

export default new AuthService();
