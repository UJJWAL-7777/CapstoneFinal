export class ApiError extends Error {
  constructor(statusCode, message, { code, errors } = {}) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.errors = errors;
    this.isOperational = true;
  }

  static badRequest(msg, opts) { return new ApiError(400, msg, opts); }
  static unauthorized(msg = 'Authentication required', opts) { return new ApiError(401, msg, { code: 'UNAUTHENTICATED', ...opts }); }
  static forbidden(msg = 'You do not have permission to do that', opts) { return new ApiError(403, msg, { code: 'FORBIDDEN', ...opts }); }
  static notFound(msg = 'Resource not found', opts) { return new ApiError(404, msg, { code: 'NOT_FOUND', ...opts }); }
  static conflict(msg, opts) { return new ApiError(409, msg, { code: 'CONFLICT', ...opts }); }
}
