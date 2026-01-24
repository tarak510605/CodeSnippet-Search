/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors and pass to error middleware
 */

/**
 * Wraps an async function and catches any errors
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Alternative syntax using try-catch
 * @param {Function} fn - Async function to wrap
 * @returns {Function} - Express middleware function
 */
export const tryCatch = (fn) => async (req, res, next) => {
  try {
    await fn(req, res, next);
  } catch (error) {
    next(error);
  }
};

export default asyncHandler;
