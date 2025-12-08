import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isEmployer } from '../../core/middleware/roleGuard.js';
import {
  getAllEmployers,
  getEmployerById,
  getSettings,
  updateSettings,
  getStats,
} from './employer.controller.js';

const router = express.Router();

// Settings routes
router.get('/employer/settings', protect, isEmployer, getSettings);
router.patch('/employer/settings', protect, isEmployer, updateSettings);

// Stats route
router.get('/employer/stats', protect, isEmployer, getStats);

// Public employer routes (no authentication required)
router.get('/employers', getAllEmployers);
router.get('/employers/:id', getEmployerById);

export default router;
