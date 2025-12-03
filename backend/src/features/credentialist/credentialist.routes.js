import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isCredentialist } from '../../core/middleware/roleGuard.js';
import {
  getAllCredentialists,
  getCredentialistById,
  getSettings,
  updateSettings,
  getStats,
} from './credentialist.controller.js';

const router = express.Router();

// Settings routes
router.get('/credentialist/settings', protect, isCredentialist, getSettings);
router.patch('/credentialist/settings', protect, isCredentialist, updateSettings);

// Stats route
router.get('/credentialist/stats', protect, isCredentialist, getStats);

// Public routes - accessible to all authenticated users
router.get('/credentialists', protect, getAllCredentialists);
router.get('/credentialists/:id', protect, getCredentialistById);

export default router;
