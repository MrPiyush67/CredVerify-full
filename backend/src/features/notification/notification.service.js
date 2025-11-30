import Notification from './notification.model.js';

// Create a notification
export const createNotification = async (notificationData) => {
  const notification = await Notification.create(notificationData);
  return notification;
};

// Bulk create notifications (for broadcasting to multiple users)
export const createBulkNotifications = async (notifications) => {
  const createdNotifications = await Notification.insertMany(notifications);
  return createdNotifications;
};

// Get all notifications for a user
export const getMyNotifications = async (userId, filters = {}) => {
  const query = { user: userId };

  // Filter by read status
  if (filters.read !== undefined) {
    query.read = filters.read === 'true' || filters.read === true;
  }

  // Filter by category
  if (filters.category) {
    query.category = filters.category;
  }

  // Filter by type
  if (filters.type) {
    query.type = filters.type;
  }

  const limit = parseInt(filters.limit) || 50;
  const skip = parseInt(filters.skip) || 0;

  const notifications = await Notification.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

  const total = await Notification.countDocuments(query);

  return {
    notifications,
    total,
    limit,
    skip,
  };
};

// Get unread notification count
export const getUnreadCount = async (userId) => {
  const count = await Notification.countDocuments({
    user: userId,
    read: false,
  });
  return count;
};

// Mark single notification as read
export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, user: userId },
    { read: true },
    { new: true }
  );

  if (!notification) {
    throw new Error('Notification not found or unauthorized');
  }

  return notification;
};

// Mark all notifications as read
export const markAllAsRead = async (userId) => {
  const result = await Notification.updateMany(
    { user: userId, read: false },
    { read: true }
  );

  return {
    modifiedCount: result.modifiedCount,
  };
};

// Delete a notification
export const deleteNotification = async (userId, notificationId) => {
  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new Error('Notification not found or unauthorized');
  }

  return notification;
};

// Delete all read notifications
export const deleteAllRead = async (userId) => {
  const result = await Notification.deleteMany({
    user: userId,
    read: true,
  });

  return {
    deletedCount: result.deletedCount,
  };
};

// Get notification by ID
export const getNotificationById = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    user: userId,
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  return notification;
};

// Auto-cleanup old notifications (called by cron job)
export const cleanupOldNotifications = async (daysOld = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await Notification.deleteMany({
    createdAt: { $lt: cutoffDate },
    read: true,
  });

  return {
    deletedCount: result.deletedCount,
  };
};

// Get notification statistics
export const getNotificationStats = async (userId) => {
  const [total, unread, read, byCategory] = await Promise.all([
    Notification.countDocuments({ user: userId }),
    Notification.countDocuments({ user: userId, read: false }),
    Notification.countDocuments({ user: userId, read: true }),
    Notification.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  // Recent notifications (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await Notification.countDocuments({
    user: userId,
    createdAt: { $gte: sevenDaysAgo },
  });

  // Format category stats
  const categories = {};
  byCategory.forEach(item => {
    categories[item._id] = item.count;
  });

  return {
    total,
    unread,
    read,
    recent,
    categories,
  };
};

