/**
 * Custom API Error Class
 * Extends Error with HTTP status code and additional metadata
 */

export class ApiError extends Error {
  constructor(message, statusCode, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.errors = errors;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Factory functions for common HTTP errors
 */

export const BadRequestError = (message = 'Bad Request', errors = null) => 
  new ApiError(message, 400, errors);

export const UnauthorizedError = (message = 'Unauthorized') => 
  new ApiError(message, 401);

export const ForbiddenError = (message = 'Forbidden') => 
  new ApiError(message, 403);

export const NotFoundError = (message = 'Resource not found') => 
  new ApiError(message, 404);

export const ConflictError = (message = 'Conflict') => 
  new ApiError(message, 409);

export const ValidationError = (message = 'Validation failed', errors = null) => 
  new ApiError(message, 422, errors);

export const InternalServerError = (message = 'Internal Server Error') => 
  new ApiError(message, 500);
