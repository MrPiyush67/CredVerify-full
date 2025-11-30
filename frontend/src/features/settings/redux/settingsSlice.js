import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as settingsApi from '../api/settingsApi.js';

// Async thunks
export const fetchUserSettings = createAsyncThunk(
  'settings/fetchUserSettings',
  async (_, { rejectWithValue, getState }) => {
    try {
      const role = getState().auth?.role || 'credentialist';
      const response = await settingsApi.getUserSettings(role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateUserSettings = createAsyncThunk(
  'settings/updateUserSettings',
  async (settingsData, { rejectWithValue, getState }) => {
    try {
      const role = getState().auth?.role || 'credentialist';
      const response = await settingsApi.updateUserSettings(settingsData, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

// Initial state
const initialState = {
  settingsData: null,
  isLoading: false,
  error: null,
  updateSuccess: false
};

// Settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetSettings: (state) => {
      state.settingsData = null;
      state.error = null;
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch settings
      .addCase(fetchUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settingsData = action.payload;
        state.error = null;
      })
      .addCase(fetchUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update settings
      .addCase(updateUserSettings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserSettings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.settingsData = action.payload;
        state.error = null;
        state.updateSuccess = true;
      })
      .addCase(updateUserSettings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      });
  }
});

// Actions
export const { clearError, clearUpdateSuccess, resetSettings } = settingsSlice.actions;

// Selectors
export const selectSettings = (state) => state.settings?.settingsData || null;
export const selectSettingsLoading = (state) => state.settings?.isLoading || false;
export const selectSettingsError = (state) => state.settings?.error || null;
export const selectUpdateSuccess = (state) => state.settings?.updateSuccess || false;

// Export reducer
export default settingsSlice.reducer;

