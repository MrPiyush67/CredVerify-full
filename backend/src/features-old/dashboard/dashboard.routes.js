import express from 'express';
import { getDashboardStats } from './dashboard.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

// GET /api/dashboard/stats - Get role-specific dashboard statistics
router.get('/dashboard/stats', protect, getDashboardStats);

export default router;
