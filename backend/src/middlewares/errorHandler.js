const Logger = require('../utils/logger');
const ApiResponse = require('../utils/apiResponse');

const errorHandler = (err, req, res, next) => {
  Logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
  });

  if (err.isOperational) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, 'Validation Error', 400, err.details);
  }

  if (err.code === 'P2002') {
    return ApiResponse.error(res, 'Duplicate entry found', 409);
  }

  if (err.code === 'P2025') {
    return ApiResponse.error(res, 'Record not found', 404);
  }

  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Token expired', 401);
  }

  return ApiResponse.error(res, 'Internal server error', 500);
};

module.exports = errorHandler;
