import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/authApi.js';

const initialState = {
  isAuthenticated: false,
  user: null,
  role: null,
  loading: false,
  error: null,
};

// Thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password, role }, { rejectWithValue }) => {
    try {
      const res = await authApi.login({ email, password, role });
      if (res?.success) {
        // Backend returns: { success, message, data: { user: {...}, token: '...' } }
        // user object contains: _id, name, email, role, avatar
        const d = res.data || {};
        const userData = d.user || d;
        const user = userData?._id ? {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          companyName: userData.companyName
        } : null;
        // Role comes from the user object returned by backend
        const finalRole = userData?.role || role || null;
        return { user, role: finalRole };
      }
      return rejectWithValue(res?.message || 'Login failed');
    } catch (err) {
      return rejectWithValue(err?.message || 'Login failed');
    }
  }
);

export const signup = createAsyncThunk(
  'auth/signup',
  async ({ name, email, password, role, companyName }, { rejectWithValue }) => {
    try {
      const res = await authApi.signup({ name, email, password, role, companyName });
      if (res?.success) {
        // Backend returns: { success, message, data: { user: {...}, token: '...' } }
        // user object contains: _id, name, email, role, avatar
        const d = res.data || {};
        const userData = d.user || d;
        const user = userData?._id ? {
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar,
          companyName: userData.companyName
        } : null;
        // Role comes from the user object returned by backend
        const finalRole = userData?.role || role || null;
        // Cookie set on server; consider the user authenticated
        return { user, role: finalRole };
      }
      return rejectWithValue(res?.message || 'Registration failed');
    } catch (err) {
      return rejectWithValue(err?.message || 'Registration failed');
    }
  }
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async ({ role } = {}, { rejectWithValue }) => {
    try {
      const res = await authApi.me(role);
      if (res?.success) {
        // Backend returns: { success, data: { user: {...}, profile: {...} } }
        // user object contains: _id, name, email, role, avatar
        const payload = res.data || {};
        let user, finalRole;

        if (payload.user) {
          // Extract user data from nested user object
          const userData = payload.user;
          user = {
            _id: userData._id,
            name: userData.name,
            email: userData.email,
            avatar: userData.avatar,
            companyName: userData.companyName
          };
          // Role comes from user object, not from payload root
          finalRole = userData.role || role || null;
        } else if (payload._id) {
          // Fallback: payload is the user object itself
          user = {
            _id: payload._id,
            name: payload.name,
            email: payload.email,
            avatar: payload.avatar,
            companyName: payload.companyName
          };
          finalRole = payload.role || role || null;
        } else {
          user = null;
          finalRole = null;
        }
        return { user, role: finalRole };
      }
      return rejectWithValue(res?.message || 'Unable to fetch profile');
    } catch (err) {
      return rejectWithValue(err?.message || 'Unable to fetch profile');
    }
  }
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.role = null;
      state.loading = false;
      state.error = null;
      // Clear persisted state
      try {
        localStorage.removeItem('authState');
      } catch (_) {
        /* ignore */
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        // cookie is set on server on successful register
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // me
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.role = action.payload.role;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.user = null;
        state.role = null;
        // Clear persisted state if session is invalid
        try {
          localStorage.removeItem('authState');
        } catch (_) {
          /* ignore */
        }
      });
  },
});

export const { clearError, logout } = slice.actions;

// Selectors
export const selectAuthLoading = (state) => state?.auth?.loading;
export const selectAuthError = (state) => state?.auth?.error;
export const selectIsAuthenticated = (state) => state?.auth?.isAuthenticated;
export const selectRole = (state) => state?.auth?.role;
export const selectUser = (state) => state?.auth?.user;

export default slice.reducer;
