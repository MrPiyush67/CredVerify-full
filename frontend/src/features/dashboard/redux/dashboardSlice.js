import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as dashboardApi from '../api/dashboardApi.js';

// Async thunk
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchDashboardStats',
  async (_, { rejectWithValue, getState }) => {
    try {
      const role = getState().auth?.role || 'learner';
      const response = await dashboardApi.getDashboardStats();
      return {
        role,
        stats: response.data.data
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }
);

// Initial state
const initialState = {
  stats: null,
  role: null,
  isLoading: false,
  error: null,
  lastUpdated: null
};

// Dashboard slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    resetDashboard: (state) => {
      state.stats = null;
      state.error = null;
      state.lastUpdated = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch dashboard stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.stats = action.payload.stats;
        state.role = action.payload.role;
        state.error = null;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

// Actions
export const { clearError, resetDashboard } = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state) => state.dashboard?.stats;
export const selectDashboardRole = (state) => state.dashboard?.role;
export const selectDashboardLoading = (state) => state.dashboard?.isLoading;
export const selectDashboardError = (state) => state.dashboard?.error;
export const selectLastUpdated = (state) => state.dashboard?.lastUpdated;

export default dashboardSlice.reducer;
