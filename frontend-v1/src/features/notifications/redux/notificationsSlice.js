import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notificationApi from '../api/notificationApi.js';

const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  },
  filters: {
    type: null,
    category: null,
    priority: null,
    read: null
  }
};

// Async thunks
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchNotifications',
  async ({ role, params = {} }, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getNotifications(role, params);
      return response;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch notifications');
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/fetchUnreadCount',
  async (role, { rejectWithValue }) => {
    try {
      const response = await notificationApi.getUnreadCount(role);
      // Backend returns: { success, message, data: { count: number } }
      return response?.data?.count || response?.count || 0;
    } catch (error) {
      // Include status code for better error handling
      return rejectWithValue({
        message: error?.message || 'Failed to fetch unread count',
        status: error?.response?.status
      });
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ role, notificationId }, { rejectWithValue }) => {
    try {
      const response = await notificationApi.markAsRead(role, notificationId);
      return { notificationId, data: response.data };
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllAsRead',
  async (role, { rejectWithValue }) => {
    try {
      await notificationApi.markAllAsRead(role);
      return role;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to mark all notifications as read');
    }
  }
);

export const deleteNotification = createAsyncThunk(
  'notifications/deleteNotification',
  async ({ role, notificationId }, { rejectWithValue }) => {
    try {
      await notificationApi.deleteNotification(role, notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to delete notification');
    }
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearError: (state) => {
      state.error = null;
    },
    // Optimistic updates for real-time notifications
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      if (!action.payload.read) {
        state.unreadCount += 1;
      }
    },
    updateNotificationStatus: (state, action) => {
      const { notificationId, read } = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && notification.read !== read) {
        notification.read = read;
        if (read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        } else {
          state.unreadCount += 1;
        }
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      const notification = state.notifications.find(n => n._id === notificationId);
      if (notification && !notification.read) {
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
      state.notifications = state.notifications.filter(n => n._id !== notificationId);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success, message, data: { notifications: [...], total, limit, skip } }
        const notifications = action.payload?.data?.notifications || action.payload?.notifications || [];
        state.notifications = Array.isArray(notifications) ? notifications : [];

        // Update pagination if available
        if (action.payload?.data) {
          const data = action.payload.data;
          if (data.total !== undefined) {
            state.pagination = {
              page: Math.floor((data.skip || 0) / (data.limit || 20)) + 1,
              limit: data.limit || 20,
              total: data.total || 0,
              pages: Math.ceil((data.total || 0) / (data.limit || 20))
            };
          }
        }
        if (action.payload?.pagination) {
          state.pagination = action.payload.pagination;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.notifications = []; // Ensure notifications is always an array
      })

      // Fetch unread count
      .addCase(fetchUnreadCount.pending, (state) => {
        // Don't set loading for unread count as it's often called in background
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(fetchUnreadCount.rejected, (state, action) => {
        // Silently ignore 401 errors (user not authenticated) - this is expected
        // Only log other errors
        if (action.payload?.status !== 401) {
          console.warn('Failed to fetch unread count:', action.payload?.message || action.payload);
        }
      })

      // Mark as read
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const { notificationId } = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })

      // Mark all as read
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.notifications.forEach(notification => {
          notification.read = true;
        });
        state.unreadCount = 0;
      })

      // Delete notification
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const notificationId = action.payload;
        const notification = state.notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications = state.notifications.filter(n => n._id !== notificationId);
      });
  },
});

export const {
  setFilters,
  clearFilters,
  clearError,
  addNotification,
  updateNotificationStatus,
  removeNotification,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state?.notifications?.notifications || [];
export const selectUnreadCount = (state) => state?.notifications?.unreadCount || 0;
export const selectNotificationLoading = (state) => state?.notifications?.loading || false;
export const selectNotificationError = (state) => state?.notifications?.error;
export const selectNotificationPagination = (state) => state?.notifications?.pagination || initialState.pagination;
export const selectNotificationFilters = (state) => state?.notifications?.filters || initialState.filters;

// Derived selectors
export const selectUnreadNotifications = (state) =>
  selectNotifications(state).filter(notification => !notification.read);

export const selectNotificationsByType = (type) => (state) =>
  selectNotifications(state).filter(notification => notification.type === type);

export const selectNotificationsByCategory = (category) => (state) =>
  selectNotifications(state).filter(notification => notification.category === category);

export const selectHighPriorityNotifications = (state) =>
  selectNotifications(state).filter(notification =>
    notification.priority === 'high' || notification.priority === 'urgent'
  );

export default notificationsSlice.reducer;
