class ApiError extends Error {
  constructor(status, message, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code || 'REQUEST_ERROR';
    this.details = details;
    Error.captureStackTrace?.(this, ApiError);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, 'BAD_REQUEST', details);
  }

  static unauthorized(message = 'Authentication is required.') {
    return new ApiError(401, message, 'UNAUTHORIZED');
  }

  static forbidden(message = 'You do not have permission to perform this action.') {
    return new ApiError(403, message, 'FORBIDDEN');
  }

  static notFound(message = 'Resource not found.') {
    return new ApiError(404, message, 'NOT_FOUND');
  }

  static conflict(message = 'The request conflicts with an existing resource.') {
    return new ApiError(409, message, 'CONFLICT');
  }
}

module.exports = ApiError;
module.exports.ApiError = ApiError;