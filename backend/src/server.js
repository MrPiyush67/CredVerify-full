// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`❌ Uncaught Exception: ${err.message}`);
  process.exit(1);
});

import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import http from 'http';
import app from './app.js';
import { initializeSocket } from '#src/features-old/chat/socket.js';

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDB();

    initializeSocket(server);

    server.listen(config.PORT, () => {
      console.log(`🚀 Server running on port ${config.PORT}`);
    });
  } catch (error) {
    console.log('❌ failed to start the server', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Intercept graceful termination sequences
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing server components...');
  server.close(() => {
    console.log('📦 Server process terminated securely.');
    process.exit(0);
  });
});

startServer();
