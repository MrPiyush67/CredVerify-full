import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import {
  getPlatformProfile,
  submitHandle,
  requestVerification,
  verifyOwnership,
  refreshStats,
  removePlatform,
} from './platform.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's platform profile
router.get('/platforms/profile', getPlatformProfile);

// Submit handle for a platform
router.post('/platforms/:platform/submit', submitHandle);

// Request verification code
router.post('/platforms/:platform/request-verification', requestVerification);

// Verify ownership
router.post('/platforms/:platform/verify', verifyOwnership);

// Refresh stats
router.post('/platforms/:platform/refresh', refreshStats);

// Remove platform
router.delete('/platforms/:platform', removePlatform);

export default router;
