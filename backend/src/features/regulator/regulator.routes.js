import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isRegulator } from '../../core/middleware/roleGuard.js';
import {
  getPendingCredentials,
  verifyCredential,
  rejectCredential,
  getStats,
  getAllRegulators,
  getRegulatorById,
  getSettings,
  updateSettings,
} from './regulator.controller.js';

const router = express.Router();

// Settings routes
router.get('/regulator/settings', protect, isRegulator, getSettings);
router.patch('/regulator/settings', protect, isRegulator, updateSettings);

// Verification routes
router.get('/regulator/credentials/pending', protect, isRegulator, getPendingCredentials);
router.post('/regulator/credentials/:id/verify', protect, isRegulator, verifyCredential);
router.post('/regulator/credentials/:id/reject', protect, isRegulator, rejectCredential);

// Stats
router.get('/regulator/stats', protect, isRegulator, getStats);

// Public regulator routes (no authentication required)
router.get('/regulators', getAllRegulators);
router.get('/regulators/:id', getRegulatorById);

export default router;
