import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import { config } from '#src/config/env.js';
import { errorHandler } from '#src/middleware/errorHandler.js';

// Import feature routes
import authRouter from '#src/features/auth/auth.route.js';
import userRouter from './features/users/user.routes.js';
import { protect } from './middleware/auth.js';
// import userRoutes from './features/user/user.routes.js';
// import credentialRoutes from './features/credential/credential.routes.js';
// import learnerRoutes from './features/learner/learner.routes.js';
// import regulatorRoutes from './features/regulator/regulator.routes.js';
// import employerRoutes from './features/employer/employer.routes.js';
// import jobRoutes from './features/job/job.routes.js';
// import chatRoutes from './features/chat/chat.routes.js';
// import notificationRoutes from './features/notification/notification.routes.js';
// import dashboardRoutes from './features/dashboard/dashboard.routes.js';
// import platformRoutes from './features/platform/platform.routes.js';
// import digilockerRoutes from './features/digilocker/routes.js';
// import aiChatRoutes from './features/ai-chat/aiChat.routes.js';
// import organizationRoutes from './features/credential/routes/organization.routes.js';

const app = express();

//cors
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin || origin === config.CLIENT_URL) {
        return callback(null, true);
      }

      // Allow chrome-extension and moz-extension origins
      if (
        origin.startsWith('chrome-extension://') ||
        origin.startsWith('moz-extension://')
      ) {
        return callback(null, true);
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  }),
);
// Security middleware
app.use(helmet());
app.use(compression());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount Organization routes FIRST (more specific path)
// IMPORTANT: This must come before general credential routes to avoid route conflicts
// app.use('/api/v1/certificates/organization', organizationRoutes);

// Mount feature routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/user', protect, userRouter);
// app.use('/api/v1', [
//   userRoutes,
//   credentialRoutes,
//   learnerRoutes,
//   regulatorRoutes,
//   employerRoutes,
//   jobRoutes,
//   chatRoutes,
//   notificationRoutes,
//   dashboardRoutes,
//   platformRoutes,
// ]);

// Mount AI Chat routes
// app.use('/api/v1/ai-chat', aiChatRoutes);

// Mount Digilocker routes separately to handle specific middleware
// app.use('/api/v1/digilocker', digilockerRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler (must be last)
app.use(errorHandler);

export default app;
