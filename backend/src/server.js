/**
 * Server Entry Point
 * Starts the Express server and connects to MongoDB
 */

import app from './app.js';
import { config, connectDB } from './config/index.js';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

/**
 * Start the server
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express server
    const server = app.listen(config.port, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Code Snippet Search API                             ║
║                                                          ║
║   Server running on: http://localhost:${config.port}              ║
║   Environment: ${config.nodeEnv.padEnd(40)}║
║   AI Provider: ${(config.aiProvider || 'none').padEnd(39)}║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('❌ UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle SIGTERM signal
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('Process terminated');
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Start the server
startServer();
