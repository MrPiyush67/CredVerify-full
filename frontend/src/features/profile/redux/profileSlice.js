import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as profileApi from '../api/profileApi.js';

// Async thunks
export const fetchUserProfile = createAsyncThunk(
  'profile/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await profileApi.getUserProfile();
      // Backend returns { user, roleProfile } or { user, profile }
      const data = response.data.data || response.data;
      return {
        user: data.user,
        roleProfile: data.roleProfile || data.profile || null
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch profile');
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'profile/updateUserProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateUserProfile(profileData);
      const data = response.data.data || response.data;
      return data.user;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const updateRoleProfile = createAsyncThunk(
  'profile/updateRoleProfile',
  async (roleData, { rejectWithValue }) => {
    try {
      const response = await profileApi.updateRoleProfile(roleData);
      const data = response.data.data || response.data;
      return data.roleProfile;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update role profile');
    }
  }
);

export const fetchPublicProfile = createAsyncThunk(
  'profile/fetchPublicProfile',
  async ({ userId, role }, { rejectWithValue }) => {
    try {
      const response = await profileApi.getPublicProfile(userId, role);
      // Backend returns { user, roleProfile } or { profile }
      const data = response.data.data || response.data;
      return {
        user: data.user || data.profile || data,
        roleProfile: data.roleProfile || data.profile || null
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch public profile');
    }
  }
);

// Initial state
const initialState = {
  user: null,           // Base user data (name, email, avatar, bio, education, etc.)
  roleProfile: null,    // Role-specific data (socialLinks, companyName, institution, etc.)
  isLoading: false,
  error: null,
  updateSuccess: false
};

// Profile slice
const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
    resetProfile: (state) => {
      state.user = null;
      state.roleProfile = null;
      state.error = null;
      state.updateSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.roleProfile = action.payload.roleProfile;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.error = null;
        state.updateSuccess = true;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Update role profile
      .addCase(updateRoleProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateRoleProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.roleProfile = action.payload;
        state.error = null;
        state.updateSuccess = true;
      })
      .addCase(updateRoleProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })
      // Fetch public profile
      .addCase(fetchPublicProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPublicProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.roleProfile = action.payload.roleProfile;
        state.error = null;
      })
      .addCase(fetchPublicProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { clearError, clearUpdateSuccess, resetProfile } = profileSlice.actions;

// Selectors
export const selectUser = (state) => state.profile?.user || null;
export const selectRoleProfile = (state) => state.profile?.roleProfile || null;
export const selectProfileLoading = (state) => state.profile?.isLoading || false;
export const selectProfileError = (state) => state.profile?.error || null;
export const selectUpdateSuccess = (state) => state.profile?.updateSuccess || false;

// Legacy selector for backward compatibility
export const selectProfile = (state) => state.profile?.user || null;

// Export reducer
export default profileSlice.reducer;
