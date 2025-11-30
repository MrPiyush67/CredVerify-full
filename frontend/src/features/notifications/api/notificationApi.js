import axiosClient from '@services/axiosClient';
import ENDPOINTS from '@services/endpoints';

/**
 * Notification API functions following the established pattern
 * Backend uses unified /notifications endpoint for all roles
 */

// Get notifications for current user (unified endpoint)
export const getNotifications = async (role, params = {}) => {
  try {
    const { page = 1, limit = 20, type, category, priority, read } = params;
    const queryParams = { page, limit };

    if (type) queryParams.type = type;
    if (category) queryParams.category = category;
    if (priority) queryParams.priority = priority;
    if (read !== undefined) queryParams.read = read;

    const res = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.LIST, { params: queryParams });
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// Get unread notification count
export const getUnreadCount = async (role) => {
  try {
    const res = await axiosClient.get(ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// Mark a specific notification as read
export const markAsRead = async (role, notificationId) => {
  try {
    const res = await axiosClient.patch(`notifications/${notificationId}/read`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// Mark all notifications as read
export const markAllAsRead = async (role) => {
  try {
    const res = await axiosClient.patch('notifications/mark-all-read');
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// Delete a notification
export const deleteNotification = async (role, notificationId) => {
  try {
    const res = await axiosClient.delete(`notifications/${notificationId}`);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};

// Create a notification (admin/system use)
export const createNotification = async (role, notificationData) => {
  try {
    const res = await axiosClient.post(ENDPOINTS.NOTIFICATIONS.CREATE, notificationData);
    return res.data;
  } catch (error) {
    throw error?.response?.data || error;
  }
};