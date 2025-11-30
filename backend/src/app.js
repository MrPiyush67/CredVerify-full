import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import { connectDB } from './core/config/db.js';
import { errorHandler } from './core/middleware/errorHandler.js';

// Import feature routes
import userRoutes from './features/user/user.routes.js';
import credentialRoutes from './features/credential/credential.routes.js';
import credentialistRoutes from './features/credentialist/credentialist.routes.js';
import validantRoutes from './features/validant/validant.routes.js';
import curatorRoutes from './features/curator/curator.routes.js';
import jobRoutes from './features/job/job.routes.js';
import chatRoutes from './features/chat/chat.routes.js';
import notificationRoutes from './features/notification/notification.routes.js';
import dashboardRoutes from './features/dashboard/dashboard.routes.js';

const app = express();

// Connect to database
connectDB();

// Security middleware
app.use(helmet());
app.use(mongoSanitize());

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser
app.use(cookieParser());

// CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'https://credverify.vercel.app',
  'http://localhost:5173',
  'http://localhost:3001',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // Allow chrome-extension and moz-extension origins
      if (origin.startsWith('chrome-extension://') || origin.startsWith('moz-extension://')) {
        return callback(null, true);
      }

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount feature routes
app.use('/api', [
  userRoutes,
  credentialRoutes,
  credentialistRoutes,
  validantRoutes,
  curatorRoutes,
  jobRoutes,
  chatRoutes,
  notificationRoutes,
  dashboardRoutes,
]);

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
