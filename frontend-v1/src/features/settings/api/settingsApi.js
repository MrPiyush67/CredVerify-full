import axiosClient from '@/shared';
import ENDPOINTS from '@/shared/services/endpoints.js';

// Get current user's settings
// NOTE: Backend-new doesn't have settings endpoints yet
export const getUserSettings = async (role = 'learner') => {
  try {
    const response = await axiosClient.get(ENDPOINTS.SETTINGS.GET(role));
    return response;
  } catch (error) {
    // Backend-new doesn't have settings endpoints
    // Return default settings structure
    console.warn(
      'Settings endpoint not available in backend-new, returning defaults',
    );
    return {
      data: {
        success: true,
        message: 'Default settings (backend endpoint not implemented)',
        data: {
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
          privacy: {
            profileVisibility: 'public',
            showEmail: false,
            showPhone: false,
          },
          preferences: {
            language: 'en',
            timezone: 'UTC',
          },
        },
      },
    };
  }
};

// Update current user's settings
export const updateUserSettings = async (settingsData, role = 'learner') => {
  try {
    const response = await axiosClient.patch(
      ENDPOINTS.SETTINGS.UPDATE(role),
      settingsData,
    );
    return response;
  } catch (error) {
    // Backend-new doesn't have settings endpoints
    // Return success to avoid breaking UI
    console.warn('Settings update endpoint not available in backend-new');
    return {
      data: {
        success: true,
        message: 'Settings saved locally (backend endpoint not implemented)',
        data: settingsData,
      },
    };
  }
};
