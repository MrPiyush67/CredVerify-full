import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import * as notificationService from './notification.service.js';

// @desc    Get my notifications
// @route   GET /api/notifications
// @access  Private
export const getMyNotifications = asyncHandler(async (req, res) => {
  const { read, category, type, limit, skip } = req.query;
  const filters = { read, category, type, limit, skip };

  const result = await notificationService.getMyNotifications(req.user._id, filters);

  return sendSuccess(res, 200, 'Notifications fetched successfully', result);
});

// @desc    Get unread notification count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);

  return sendSuccess(res, 200, 'Unread count fetched successfully', { count });
});

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = asyncHandler(async (req, res) => {
  const notification = await notificationService.getNotificationById(
    req.user._id,
    req.params.id
  );

  return sendSuccess(res, 200, 'Notification fetched successfully', { notification });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.user._id,
    req.params.id
  );

  return sendSuccess(res, 200, 'Notification marked as read', { notification });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/mark-all-read
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res) => {
  const result = await notificationService.markAllAsRead(req.user._id);

  return sendSuccess(res, 200, 'All notifications marked as read', result);
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.id);

  return sendSuccess(res, 200, 'Notification deleted successfully');
});

// @desc    Delete all read notifications
// @route   DELETE /api/notifications/read
// @access  Private
export const deleteAllRead = asyncHandler(async (req, res) => {
  const result = await notificationService.deleteAllRead(req.user._id);

  return sendSuccess(res, 200, 'Read notifications deleted successfully', result);
});

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = asyncHandler(async (req, res) => {
  const stats = await notificationService.getNotificationStats(req.user._id);

  return sendSuccess(res, 200, 'Notification stats fetched successfully', stats);
});
