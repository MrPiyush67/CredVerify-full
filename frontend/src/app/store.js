import { configureStore } from '@reduxjs/toolkit';
import auth from '@features/auth/redux/authSlice.js';
import jobs from '@features/jobs/redux/jobsSlice.js';
import home from '@features/home/redux/homeSlice.js';
import chat from '@features/chat/redux/chatSlice.js';
import profile from '@features/profile/redux/profileSlice.js';
import notifications from '@features/notifications/redux/notificationsSlice.js';
import settings from '@features/settings/redux/settingsSlice.js';
import dashboard from '@features/dashboard/redux/dashboardSlice.js';
import credentials from '@features/credentials/redux/credentialsSlice.js';
import platforms from '@features/platforms/redux/platformsSlice.js';

// Load persisted auth state from localStorage
const loadAuthState = () => {
  try {
    const serializedState = localStorage.getItem('authState');
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Error loading auth state:', err);
    return undefined;
  }
};

// Save auth state to localStorage
const saveAuthState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem('authState', serializedState);
  } catch (err) {
    console.error('Error saving auth state:', err);
  }
};

export const store = configureStore({
  reducer: {
    auth,
    jobs,
    home,
    chat,
    profile,
    notifications,
    settings,
    dashboard,
    credentials,
    platforms
  },
  preloadedState: {
    auth: loadAuthState()
  }
});

// Subscribe to store changes and persist auth state
store.subscribe(() => {
  const state = store.getState();
  saveAuthState(state.auth);
});

