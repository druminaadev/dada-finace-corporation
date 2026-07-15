import AppError from '../utils/appError.js';

const METHODS_REQUIRING_JSON = ['POST', 'PUT', 'PATCH'];

const enforceJsonContentType = (req, _res, next) => {
  if (!METHODS_REQUIRING_JSON.includes(req.method)) return next();
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) return next();
  if (!contentType.includes('application/json')) {
    return next(new AppError('Content-Type must be application/json', 415));
  }
  next();
};

export default enforceJsonContentType;
