const isProduction = process.env.NODE_ENV === 'production';

export class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      meta: null,
      requestId: res.locals.requestId,
    });
  }

  static paginated(res, data, pagination, message = 'Success') {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: { pagination },
      requestId: res.locals.requestId,
    });
  }

  static error(res, message = 'An error occurred', statusCode = 500, errors = null) {
    const body = {
      success: false,
      message: isProduction && statusCode === 500 ? 'Internal server error' : message,
      requestId: res.locals.requestId,
    };
    if (errors && statusCode < 500) body.errors = errors;
    return res.status(statusCode).json(body);
  }
}

export default ApiResponse;
