import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isCurator } from '../../core/middleware/roleGuard.js';
import {
  getAllCurators,
  getCuratorById,
  getSettings,
  updateSettings,
  getStats,
} from './curator.controller.js';

const router = express.Router();

// Settings routes
router.get('/curator/settings', protect, isCurator, getSettings);
router.patch('/curator/settings', protect, isCurator, updateSettings);

// Stats route
router.get('/curator/stats', protect, isCurator, getStats);

// Public curator routes
router.get('/curators', protect, getAllCurators);
router.get('/curators/:id', protect, getCuratorById);

export default router;
