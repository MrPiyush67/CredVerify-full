import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isLearner } from '../../core/middleware/roleGuard.js';
import {
  getAllLearners,
  getLearnerById,
  getSettings,
  updateSettings,
  getStats,
} from './learner.controller.js';

const router = express.Router();

// Settings routes
router.get('/learner/settings', protect, isLearner, getSettings);
router.patch('/learner/settings', protect, isLearner, updateSettings);

// Stats route
router.get('/learner/stats', protect, isLearner, getStats);

// Public routes - accessible to everyone (no authentication required)
router.get('/learners', getAllLearners);
router.get('/learners/:id', getLearnerById);

export default router;
