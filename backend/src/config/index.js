/**
 * Central Configuration Export
 * Aggregates all configuration modules
 */

import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const config = {
  // Server settings
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Database settings
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/code_snippets',
  
  // AI API settings (Groq)
  groqApiKey: process.env.GROQ_API_KEY,

  // Google Gemini (embeddings)
  geminiApiKey: process.env.GEMINI_API_KEY,

  // JWT settings
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Pagination defaults
  pagination: {
    defaultLimit: 10,
    maxLimit: 50
  }
};

export { connectDB, disconnectDB } from './database.js';
