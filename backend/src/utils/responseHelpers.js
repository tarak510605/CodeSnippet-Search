/**
 * Response Helper Utilities
 * Standardizes API response format
 */

/**
 * Send a success response
 * @param {Object} res - Express response object
 * @param {Object} data - Data to send
 * @param {string} message - Success message
 * @param {number} statusCode - HTTP status code
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data && { data })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response
 * @param {Object} res - Express response object
 * @param {Array} results - Array of results
 * @param {Object} pagination - Pagination metadata
 * @param {string} message - Success message
 */
export const sendPaginated = (res, results, pagination, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data: results,
    pagination
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {Object} errors - Additional error details
 */
export const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};
