/**
 * Centralized Error Handling Middleware
 * Catches all errors and sends appropriate responses
 */

import { config } from '../config/index.js';

/**
 * Handle MongoDB CastError (invalid ObjectId)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { statusCode: 400, message };
};

/**
 * Handle MongoDB Duplicate Key Error
 */
const handleDuplicateKeyError = (err) => {
  const value = err.errmsg?.match(/(["'])(\\?.)*?\1/)?.[0] || 'unknown';
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return { statusCode: 400, message };
};

/**
 * Handle Mongoose Validation Error
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return { statusCode: 400, message, errors };
};

/**
 * Main error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Log error in development
  if (config.nodeEnv === 'development') {
    console.error('❌ Error:', {
      name: err.name,
      message: err.message,
      stack: err.stack,
      statusCode
    });
  }

  // Handle specific error types
  if (err.name === 'CastError') {
    const handled = handleCastError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  }

  if (err.code === 11000) {
    const handled = handleDuplicateKeyError(err);
    statusCode = handled.statusCode;
    message = handled.message;
  }

  if (err.name === 'ValidationError') {
    const handled = handleValidationError(err);
    statusCode = handled.statusCode;
    message = handled.message;
    errors = handled.errors;
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(config.nodeEnv === 'development' && { stack: err.stack })
  });
};

/**
 * Handle 404 Not Found for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
};
