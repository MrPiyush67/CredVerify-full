import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isValidant } from '../../core/middleware/roleGuard.js';
import {
  getPendingCredentials,
  verifyCredential,
  rejectCredential,
  getStats,
  getAllValidants,
  getValidantById,
  getSettings,
  updateSettings,
} from './validant.controller.js';

const router = express.Router();

// Settings routes
router.get('/validant/settings', protect, isValidant, getSettings);
router.patch('/validant/settings', protect, isValidant, updateSettings);

// Verification routes
router.get('/validant/credentials/pending', protect, isValidant, getPendingCredentials);
router.post('/validant/credentials/:id/verify', protect, isValidant, verifyCredential);
router.post('/validant/credentials/:id/reject', protect, isValidant, rejectCredential);

// Stats
router.get('/validant/stats', protect, isValidant, getStats);

// Public validant routes
router.get('/validants', protect, getAllValidants);
router.get('/validants/:id', protect, getValidantById);

export default router;
