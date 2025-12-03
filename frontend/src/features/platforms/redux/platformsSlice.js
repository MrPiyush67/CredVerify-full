import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as platformsApi from '../api/platformsApi';

// Async thunks
export const fetchPlatformProfile = createAsyncThunk(
  'platforms/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await platformsApi.getPlatformProfile();
      return response.data.data.profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch platform profile');
    }
  }
);

export const submitPlatformHandle = createAsyncThunk(
  'platforms/submitHandle',
  async ({ platform, handle }, { rejectWithValue }) => {
    try {
      const response = await platformsApi.submitHandle(platform, handle);
      return response.data.data.profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit handle');
    }
  }
);

export const requestPlatformVerification = createAsyncThunk(
  'platforms/requestVerification',
  async (platform, { rejectWithValue }) => {
    try {
      const response = await platformsApi.requestVerification(platform);
      return {
        platform,
        ...response.data.data,
        profile: response.data.data.profile,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request verification');
    }
  }
);

export const verifyPlatformOwnership = createAsyncThunk(
  'platforms/verify',
  async (platform, { rejectWithValue }) => {
    try {
      const response = await platformsApi.verifyPlatform(platform);
      return response.data.data.profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Verification failed');
    }
  }
);

export const refreshPlatformStats = createAsyncThunk(
  'platforms/refreshStats',
  async (platform, { rejectWithValue }) => {
    try {
      const response = await platformsApi.refreshStats(platform);
      return response.data.data.profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh stats');
    }
  }
);

export const deletePlatform = createAsyncThunk(
  'platforms/delete',
  async (platform, { rejectWithValue }) => {
    try {
      const response = await platformsApi.removePlatform(platform);
      return response.data.data.profile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove platform');
    }
  }
);

// Initial state
const initialState = {
  profile: null,
  isLoading: false,
  error: null,
  verificationData: null, // Stores verification code and instructions
  successMessage: null,
};

// Slice
const platformsSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    clearVerificationData: (state) => {
      state.verificationData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchPlatformProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPlatformProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchPlatformProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Submit handle
      .addCase(submitPlatformHandle.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(submitPlatformHandle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Handle submitted successfully';
      })
      .addCase(submitPlatformHandle.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Request verification
      .addCase(requestPlatformVerification.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(requestPlatformVerification.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.profile) {
          state.profile = action.payload.profile;
        }
        state.verificationData = {
          code: action.payload.code,
          platform: action.payload.platform,
          handle: action.payload.handle,
          expiresAt: action.payload.expiresAt,
          instructions: action.payload.instructions,
        };
        state.successMessage = action.payload.code 
          ? 'Verification code generated' 
          : 'Platform verified automatically';
      })
      .addCase(requestPlatformVerification.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Verify ownership
      .addCase(verifyPlatformOwnership.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyPlatformOwnership.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.verificationData = null;
        state.successMessage = 'Platform verified successfully!';
      })
      .addCase(verifyPlatformOwnership.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Refresh stats
      .addCase(refreshPlatformStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshPlatformStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Stats refreshed successfully';
      })
      .addCase(refreshPlatformStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Delete platform
      .addCase(deletePlatform.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePlatform.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
        state.successMessage = 'Platform removed successfully';
      })
      .addCase(deletePlatform.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// Actions
export const { clearError, clearSuccess, clearVerificationData } = platformsSlice.actions;

// Selectors
export const selectPlatformProfile = (state) => state.platforms?.profile || null;
export const selectPlatformsLoading = (state) => state.platforms?.isLoading || false;
export const selectPlatformsError = (state) => state.platforms?.error || null;
export const selectVerificationData = (state) => state.platforms?.verificationData || null;
export const selectSuccessMessage = (state) => state.platforms?.successMessage || null;

// Export reducer
export default platformsSlice.reducer;
