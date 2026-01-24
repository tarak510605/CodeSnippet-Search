/**
 * Express Application Setup
 * Configures middleware and routes
 */

import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Enable CORS for all origins (configure for production)
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} | ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// ROUTES
// ============================================

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Code Snippet Search API',
    version: '1.0.0',
    documentation: '/api/health'
  });
});

// ============================================
// ERROR HANDLING
// ============================================

// Handle 404 for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
