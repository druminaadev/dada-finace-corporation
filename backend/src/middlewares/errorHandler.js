import { logger } from '../utils/logger.js';
import ApiResponse from '../utils/apiResponse.js';

const PRISMA_ERROR_MAP = {
  P2002: { status: 409, message: 'A record with this value already exists.' },
  P2025: { status: 404, message: 'Record not found.' },
  P2003: { status: 400, message: 'Related record not found.' },
  P2014: { status: 400, message: 'Invalid relation data.' },
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  logger.error({
    err,
    requestId: res.locals.requestId,
    url: req.originalUrl,
    method: req.method,
  });

  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  if (err.code && PRISMA_ERROR_MAP[err.code]) {
    const { status, message } = PRISMA_ERROR_MAP[err.code];
    return ApiResponse.error(res, message, status);
  }

  if (err.name === 'JsonWebTokenError') return ApiResponse.error(res, 'Invalid token', 401);
  if (err.name === 'TokenExpiredError') return ApiResponse.error(res, 'Token expired', 401);
  if (err.code === 'LIMIT_FILE_SIZE') return ApiResponse.error(res, 'File too large', 400);
  if (err.code === 'LIMIT_UNEXPECTED_FILE') return ApiResponse.error(res, 'Unexpected file field', 400);

  return ApiResponse.error(res, 'Internal server error', 500);
};

export default errorHandler;
