import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getCredentials, getPendingCredentials, getCredential, createCredential, updateCredential, deleteCredential, verifyCredential, rejectCredential, getCredentialStats, requestVerification } from '../api/credentialsApi';

// Async thunks
export const fetchCredentials = createAsyncThunk(
  'credentials/fetchAll',
  async ({ page = 1, limit = 10, status, user } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (user) params.user = user;
      const response = await getCredentials(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credentials');
    }
  }
);

// For regulators - fetch pending/past credentials
export const fetchPendingCredentials = createAsyncThunk(
  'credentials/fetchPending',
  async ({ page = 1, limit = 10, status, statusIn, credentialType, issuer } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (status) params.status = status;
      if (statusIn) params.statusIn = statusIn;
      if (credentialType) params.credentialType = credentialType;
      if (issuer) params.issuer = issuer;
      const response = await getPendingCredentials(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending credentials');
    }
  }
);

export const fetchCredentialById = createAsyncThunk(
  'credentials/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getCredential(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch credential');
    }
  }
);

export const addCredential = createAsyncThunk(
  'credentials/add',
  async (credentialData, { rejectWithValue }) => {
    try {
      const response = await createCredential(credentialData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create credential');
    }
  }
);

export const editCredential = createAsyncThunk(
  'credentials/edit',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateCredential(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update credential');
    }
  }
);

export const removeCredential = createAsyncThunk(
  'credentials/remove',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCredential(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete credential');
    }
  }
);

export const verifyCredentialRequest = createAsyncThunk(
  'credentials/verify',
  async (id, { rejectWithValue }) => {
    try {
      const response = await verifyCredential(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to verify credential');
    }
  }
);

export const rejectCredentialRequest = createAsyncThunk(
  'credentials/reject',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await rejectCredential(id, reason);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject credential');
    }
  }
);

export const fetchCredentialStats = createAsyncThunk(
  'credentials/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCredentialStats();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const requestCredentialVerification = createAsyncThunk(
  'credentials/requestVerification',
  async (id, { rejectWithValue }) => {
    try {
      const response = await requestVerification(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to request verification');
    }
  }
);

// Initial state
const initialState = {
  credentials: [],
  selectedCredential: null,
  stats: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
};

// Slice
const credentialsSlice = createSlice({
  name: 'credentials',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCredential: (state) => {
      state.selectedCredential = null;
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch credentials
      .addCase(fetchCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCredentials.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success, message, data: { credentials: [...] } }
        const credentials = action.payload?.data?.credentials || action.payload?.credentials || action.payload?.data || [];
        state.credentials = Array.isArray(credentials) ? credentials : [];
        state.pagination = action.payload?.pagination || action.payload?.data?.pagination || {
          page: 1,
          limit: 10,
          total: credentials.length,
          pages: 1,
        };
      })
      .addCase(fetchCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.credentials = []; // Ensure credentials is always an array
      })

      // Fetch pending credentials (regulator)
      .addCase(fetchPendingCredentials.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingCredentials.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success, message, data: { credentials: [...] } }
        const credentials = action.payload?.data?.credentials || action.payload?.credentials || action.payload?.data || [];
        state.credentials = Array.isArray(credentials) ? credentials : [];
        state.pagination = action.payload?.pagination || action.payload?.data?.pagination || {
          page: 1,
          limit: 10,
          total: credentials.length,
          pages: 1,
        };
      })
      .addCase(fetchPendingCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.credentials = []; // Ensure credentials is always an array
      })

      // Fetch single credential
      .addCase(fetchCredentialById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCredentialById.fulfilled, (state, action) => {
        state.loading = false;
        // Backend returns: { success, message, data: { credential: {...} } }
        state.selectedCredential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data || null;
      })
      .addCase(fetchCredentialById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Add credential
      .addCase(addCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCredential.fulfilled, (state, action) => {
        state.loading = false;
        const credential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data;
        if (credential) {
          state.credentials.unshift(credential);
          state.pagination.total += 1;
        }
      })
      .addCase(addCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Edit credential
      .addCase(editCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(editCredential.fulfilled, (state, action) => {
        state.loading = false;
        const credential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data;
        if (credential) {
          const index = state.credentials.findIndex(c => c._id === credential._id);
          if (index !== -1) {
            state.credentials[index] = credential;
          }
          if (state.selectedCredential?._id === credential._id) {
            state.selectedCredential = credential;
          }
        }
      })
      .addCase(editCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Remove credential
      .addCase(removeCredential.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCredential.fulfilled, (state, action) => {
        state.loading = false;
        state.credentials = state.credentials.filter(c => c._id !== action.payload);
        state.pagination.total -= 1;
      })
      .addCase(removeCredential.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Verify credential
      .addCase(verifyCredentialRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyCredentialRequest.fulfilled, (state, action) => {
        state.loading = false;
        const credential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data;
        if (credential) {
          const index = state.credentials.findIndex(c => c._id === credential._id);
          if (index !== -1) {
            state.credentials[index] = credential;
          }
          if (state.selectedCredential?._id === credential._id) {
            state.selectedCredential = credential;
          }
        }
      })
      .addCase(verifyCredentialRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reject credential
      .addCase(rejectCredentialRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectCredentialRequest.fulfilled, (state, action) => {
        state.loading = false;
        const credential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data;
        if (credential) {
          const index = state.credentials.findIndex(c => c._id === credential._id);
          if (index !== -1) {
            state.credentials[index] = credential;
          }
          if (state.selectedCredential?._id === credential._id) {
            state.selectedCredential = credential;
          }
        }
      })
      .addCase(rejectCredentialRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch stats
      .addCase(fetchCredentialStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCredentialStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload?.data?.stats || action.payload?.stats || action.payload?.data || null;
      })
      .addCase(fetchCredentialStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Request verification
      .addCase(requestCredentialVerification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestCredentialVerification.fulfilled, (state, action) => {
        state.loading = false;
        const credential = action.payload?.data?.credential || action.payload?.credential || action.payload?.data;
        if (credential) {
          const index = state.credentials.findIndex(c => c._id === credential._id);
          if (index !== -1) {
            state.credentials[index] = credential;
          }
          if (state.selectedCredential?._id === credential._id) {
            state.selectedCredential = credential;
          }
        }
      })
      .addCase(requestCredentialVerification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedCredential, setFilter } = credentialsSlice.actions;

// Selectors
export const selectCredentials = (state) => state.credentials.credentials;
export const selectSelectedCredential = (state) => state.credentials.selectedCredential;
export const selectCredentialStats = (state) => state.credentials.stats;
export const selectCredentialsPagination = (state) => state.credentials.pagination;
export const selectCredentialsLoading = (state) => state.credentials.loading;
export const selectCredentialsError = (state) => state.credentials.error;

export default credentialsSlice.reducer;
