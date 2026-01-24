/**
 * Request Validation Middleware
 * Handles express-validator validation results
 */

import { validationResult } from 'express-validator';
import { ValidationError } from '../utils/errors.js';

/**
 * Middleware to check validation results
 * Throws ValidationError if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    
    throw ValidationError('Validation failed', errorMessages);
  }
  
  next();
};

export default validate;
