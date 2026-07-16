/**
 * Routes Index
 * Central export and registration for all routes
 */

import { Router } from 'express';
import snippetRoutes from './snippetRoutes.js';
import authRoutes from './auth.js';
import analyticsRoutes from './analytics.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Register route modules
router.use('/auth', authRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/snippets', snippetRoutes);

export default router;
