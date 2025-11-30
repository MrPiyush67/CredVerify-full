import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import {
  getMyNotifications,
  getUnreadCount,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationStats,
} from './notification.controller.js';

const router = express.Router();

// All notification routes require authentication
router.use(protect);

// Get notifications
router.get('/notifications', getMyNotifications);
router.get('/notifications/unread-count', getUnreadCount);
router.get('/notifications/stats', getNotificationStats);
router.get('/notifications/:id', getNotificationById);

// Update notifications
router.patch('/notifications/:id/read', markAsRead);
router.patch('/notifications/mark-all-read', markAllAsRead);
router.patch('/notifications/read', markAllAsRead); // Alternative endpoint

// Delete notifications
router.delete('/notifications/:id', deleteNotification);
router.delete('/notifications/read', deleteAllRead);

export default router;
