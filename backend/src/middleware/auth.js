/**
 * Authentication Middleware
 * JWT verification for protected routes
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../utils/index.js';

/**
 * Verify Bearer token and attach user to req.user
 */
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw UnauthorizedError('Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw UnauthorizedError('Access denied. Invalid token format.');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(UnauthorizedError('Token has expired. Please log in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(UnauthorizedError('Invalid token. Please log in again.'));
    }
    if (error.statusCode) {
      return next(error);
    }
    return next(UnauthorizedError('Authentication failed.'));
  }
};

/**
 * Optionally attach user if valid token is present
 */
export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      username: decoded.username,
      email: decoded.email
    };
  } catch {
    // Ignore invalid tokens for optional auth
  }

  next();
};
