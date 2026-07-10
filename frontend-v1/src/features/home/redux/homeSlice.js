import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import homeAPI from '../api/homeApi.js';
import logger from '@/shared/utils/logger.js';

// Helper function to flatten profile data from backend
// After schema consolidation, User objects are already flat (no nested user object)
// Only jobs need flattening for employer references
const flattenProfileData = (profile) => {
  if (!profile) return profile;

  // Jobs have nested employer objects that need flattening
  // Example: { _id, title, employer: { _id, name, email, companyName }, ... }
  if (profile.employer && typeof profile.employer === 'object') {
    const employerName = profile.employer.name;
    const employerEmail = profile.employer.email;
    return {
      ...profile,
      employerName,
      employerEmail,
      companyName: profile.employer.companyName || employerName,
    };
  }

  // User objects from learners/regulators/employers endpoints are already flat
  // No nested 'user' object anymore after schema consolidation
  // Example: { _id, name, email, avatar, role, companyName, institution, ... }
  return profile;
};

// Helper to flatten array of profiles
const flattenProfileArray = (profiles) => {
  if (!Array.isArray(profiles)) return profiles;
  return profiles.map(flattenProfileData);
};

// Initial state
const initialState = {
  // Dashboard statistics
  stats: {
    data: null,
    loading: false,
    error: null,
  },

  // Role-specific data (users, admins, employers)
  roleData: {
    users: { data: [], loading: false, error: null },
    admins: { data: [], loading: false, error: null },
    employers: { data: [], loading: false, error: null },
  },

  // Jobs data
  jobs: {
    data: [],
    loading: false,
    error: null,
  },

  // User-specific data
  myJobs: {
    data: [],
    loading: false,
    error: null,
  },

  myApplications: {
    data: [],
    loading: false,
    error: null,
  },

  credentialHistory: {
    data: [],
    loading: false,
    error: null,
  },

  // External courses data
  externalCourses: {
    data: [],
    pagination: {
      currentPage: 1,
      totalPages: 0,
      totalCourses: 0,
      coursesPerPage: 36,
      hasNextPage: false,
      hasPrevPage: false,
    },
    loading: false,
    error: null,
  },

  courseCategories: {
    data: {},
    loading: false,
    error: null,
  },

  jobStats: {
    data: null,
    loading: false,
    error: null,
  },

  // UI state
  activeTab: 'users',
  filters: {
    users: {},
    admins: {},
    employers: {},
    jobs: {},
  },
};

// Async thunks

// Fetch dashboard statistics
export const fetchDashboardStats = createAsyncThunk(
  'home/fetchDashboardStats',
  async (role, { rejectWithValue }) => {
    try {
      logger.debug('Fetching dashboard stats', { role });
      const data = await homeAPI.getDashboardStats(role);
      return { role, data };
    } catch (error) {
      logger.error('Failed to fetch dashboard stats', {
        role,
        error: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch users data
export const fetchUsers = createAsyncThunk(
  'home/fetchUsers',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching users', { params });
      const data = await homeAPI.getUsers(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch users', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch admins data
export const fetchAdmins = createAsyncThunk(
  'home/fetchAdmins',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching admins', { params });
      const data = await homeAPI.getAdmins(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch admins', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch employers data
export const fetchEmployers = createAsyncThunk(
  'home/fetchEmployers',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching employers', { params });
      const data = await homeAPI.getEmployers(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch employers', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch jobs data
export const fetchJobs = createAsyncThunk(
  'home/fetchJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching jobs', { params });
      const data = await homeAPI.getJobs(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch jobs', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch my jobs (employer only)
export const fetchMyJobs = createAsyncThunk(
  'home/fetchMyJobs',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching my jobs', { params });
      const data = await homeAPI.getMyJobs(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch my jobs', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch my applications (user only)
export const fetchMyApplications = createAsyncThunk(
  'home/fetchMyApplications',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching my applications', { params });
      const data = await homeAPI.getMyApplications(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch my applications', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch credential history (user only)
export const fetchCredentialHistory = createAsyncThunk(
  'home/fetchCredentialHistory',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching credential history', { params });
      const data = await homeAPI.getCredentialHistory(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch credential history', {
        error: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch job statistics (employer only)
export const fetchJobStats = createAsyncThunk(
  'home/fetchJobStats',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('Fetching job stats');
      const data = await homeAPI.getJobStats();
      return data;
    } catch (error) {
      logger.error('Failed to fetch job stats', { error: error.message });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch external courses from all platforms
export const fetchExternalCourses = createAsyncThunk(
  'home/fetchExternalCourses',
  async (params = {}, { rejectWithValue }) => {
    try {
      logger.debug('Fetching external courses', { params });
      const data = await homeAPI.getExternalCourses(params);
      return data;
    } catch (error) {
      logger.error('Failed to fetch external courses', {
        error: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch course categories
export const fetchCourseCategories = createAsyncThunk(
  'home/fetchCourseCategories',
  async (_, { rejectWithValue }) => {
    try {
      logger.debug('Fetching course categories');
      const data = await homeAPI.getCourseCategories();
      return data;
    } catch (error) {
      logger.error('Failed to fetch course categories', {
        error: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Fetch courses by category
export const fetchCoursesByCategory = createAsyncThunk(
  'home/fetchCoursesByCategory',
  async (category, { rejectWithValue }) => {
    try {
      logger.debug('Fetching courses by category', { category });
      const data = await homeAPI.getCoursesByCategory(category);
      return data;
    } catch (error) {
      logger.error('Failed to fetch courses by category', {
        category,
        error: error.message,
      });
      return rejectWithValue(error.response?.data || error.message);
    }
  },
);

// Helper thunk to fetch role-specific data
export const fetchRoleData = createAsyncThunk(
  'home/fetchRoleData',
  async ({ role, params = {} }, { rejectWithValue, dispatch }) => {
    try {
      logger.debug('Fetching role data', { role, params });

      switch (role) {
        case 'users':
          return dispatch(fetchUsers(params));
        case 'admins':
          return dispatch(fetchAdmins(params));
        case 'employers':
          return dispatch(fetchEmployers(params));
        default:
          throw new Error(`Invalid role: ${role}`);
      }
    } catch (error) {
      logger.error('Failed to fetch role data', { role, error: error.message });
      return rejectWithValue(error.message);
    }
  },
);

// Home slice
const homeSlice = createSlice({
  name: 'home',
  initialState,
  reducers: {
    // UI actions
    setActiveTab: (state, action) => {
      state.activeTab = action.payload;
    },

    setFilter: (state, action) => {
      const { section, filters } = action.payload;
      state.filters[section] = { ...state.filters[section], ...filters };
    },

    clearFilter: (state, action) => {
      const { section, key } = action.payload;
      if (key) {
        delete state.filters[section][key];
      } else {
        state.filters[section] = {};
      }
    },

    // Reset actions
    resetStats: (state) => {
      state.stats = initialState.stats;
    },

    resetRoleData: (state, action) => {
      const role = action.payload;
      if (role && state.roleData[role]) {
        state.roleData[role] = initialState.roleData[role];
      } else {
        state.roleData = initialState.roleData;
      }
    },

    resetJobs: (state) => {
      state.jobs = initialState.jobs;
    },

    resetMyJobs: (state) => {
      state.myJobs = initialState.myJobs;
    },

    resetMyApplications: (state) => {
      state.myApplications = initialState.myApplications;
    },

    resetCredentialHistory: (state) => {
      state.credentialHistory = initialState.credentialHistory;
    },

    resetExternalCourses: (state) => {
      state.externalCourses = initialState.externalCourses;
    },

    resetCourseCategories: (state) => {
      state.courseCategories = initialState.courseCategories;
    },

    resetJobStats: (state) => {
      state.jobStats = initialState.jobStats;
    },

    resetAll: () => initialState,
  },
  extraReducers: (builder) => {
    // Dashboard stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.stats.loading = true;
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.stats.loading = false;
        state.stats.data = action.payload.data;
        state.stats.error = null;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.stats.loading = false;
        state.stats.error = action.payload;
      });

    // Users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.roleData.users.loading = true;
        state.roleData.users.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.roleData.users.loading = false;
        // Handle backend API response format and flatten nested user data
        const rawData =
          action.payload.data || action.payload.users || action.payload;
        state.roleData.users.data = flattenProfileArray(rawData);
        state.roleData.users.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.roleData.users.loading = false;
        state.roleData.users.error = action.payload;
      });

    // Admins
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.roleData.admins.loading = true;
        state.roleData.admins.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.roleData.admins.loading = false;
        // Handle backend API response format and flatten nested user data
        const rawData =
          action.payload.data || action.payload.admins || action.payload;
        state.roleData.admins.data = flattenProfileArray(rawData);
        state.roleData.admins.error = null;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.roleData.admins.loading = false;
        state.roleData.admins.error = action.payload;
      });

    // Employers
    builder
      .addCase(fetchEmployers.pending, (state) => {
        state.roleData.employers.loading = true;
        state.roleData.employers.error = null;
      })
      .addCase(fetchEmployers.fulfilled, (state, action) => {
        state.roleData.employers.loading = false;
        // Handle backend API response format and flatten nested user data
        const rawData =
          action.payload.data || action.payload.employers || action.payload;
        state.roleData.employers.data = flattenProfileArray(rawData);
        state.roleData.employers.error = null;
      })
      .addCase(fetchEmployers.rejected, (state, action) => {
        state.roleData.employers.loading = false;
        state.roleData.employers.error = action.payload;
      });

    // Jobs
    builder
      .addCase(fetchJobs.pending, (state) => {
        state.jobs.loading = true;
        state.jobs.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.jobs.loading = false;
        // Handle backend API response format and flatten nested employer data
        const rawData =
          action.payload.data || action.payload.jobs || action.payload;
        state.jobs.data = flattenProfileArray(rawData);
        state.jobs.error = null;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.jobs.loading = false;
        state.jobs.error = action.payload;
      });

    // My Jobs
    builder
      .addCase(fetchMyJobs.pending, (state) => {
        state.myJobs.loading = true;
        state.myJobs.error = null;
      })
      .addCase(fetchMyJobs.fulfilled, (state, action) => {
        state.myJobs.loading = false;
        // Handle backend API response format: { success: true, data: [...] }
        state.myJobs.data =
          action.payload.data || action.payload.jobs || action.payload;
        state.myJobs.error = null;
      })
      .addCase(fetchMyJobs.rejected, (state, action) => {
        state.myJobs.loading = false;
        state.myJobs.error = action.payload;
      });

    // My Applications
    builder
      .addCase(fetchMyApplications.pending, (state) => {
        state.myApplications.loading = true;
        state.myApplications.error = null;
      })
      .addCase(fetchMyApplications.fulfilled, (state, action) => {
        state.myApplications.loading = false;
        // Handle backend API response format: { success: true, data: [...] }
        state.myApplications.data =
          action.payload.data || action.payload.applications || action.payload;
        state.myApplications.error = null;
      })
      .addCase(fetchMyApplications.rejected, (state, action) => {
        state.myApplications.loading = false;
        state.myApplications.error = action.payload;
      });

    // Credential History
    builder
      .addCase(fetchCredentialHistory.pending, (state) => {
        state.credentialHistory.loading = true;
        state.credentialHistory.error = null;
      })
      .addCase(fetchCredentialHistory.fulfilled, (state, action) => {
        state.credentialHistory.loading = false;
        // Handle backend API response format: { success: true, data: [...] }
        state.credentialHistory.data =
          action.payload.data || action.payload.credentials || action.payload;
        state.credentialHistory.error = null;
      })
      .addCase(fetchCredentialHistory.rejected, (state, action) => {
        state.credentialHistory.loading = false;
        state.credentialHistory.error = action.payload;
      });

    // Job Stats
    builder
      .addCase(fetchJobStats.pending, (state) => {
        state.jobStats.loading = true;
        state.jobStats.error = null;
      })
      .addCase(fetchJobStats.fulfilled, (state, action) => {
        state.jobStats.loading = false;
        state.jobStats.data = action.payload;
        state.jobStats.error = null;
      })
      .addCase(fetchJobStats.rejected, (state, action) => {
        state.jobStats.loading = false;
        state.jobStats.error = action.payload;
      });

    // External Courses
    builder
      .addCase(fetchExternalCourses.pending, (state) => {
        state.externalCourses.loading = true;
        state.externalCourses.error = null;
      })
      .addCase(fetchExternalCourses.fulfilled, (state, action) => {
        state.externalCourses.loading = false;
        state.externalCourses.data = action.payload.courses || [];
        state.externalCourses.pagination =
          action.payload.pagination || state.externalCourses.pagination;
        state.externalCourses.error = null;
      })
      .addCase(fetchExternalCourses.rejected, (state, action) => {
        state.externalCourses.loading = false;
        state.externalCourses.error = action.payload;
      });

    // Course Categories
    builder
      .addCase(fetchCourseCategories.pending, (state) => {
        state.courseCategories.loading = true;
        state.courseCategories.error = null;
      })
      .addCase(fetchCourseCategories.fulfilled, (state, action) => {
        state.courseCategories.loading = false;
        state.courseCategories.data = action.payload;
        state.courseCategories.error = null;
      })
      .addCase(fetchCourseCategories.rejected, (state, action) => {
        state.courseCategories.loading = false;
        state.courseCategories.error = action.payload;
      });

    // Courses by Category
    builder
      .addCase(fetchCoursesByCategory.pending, (state) => {
        state.externalCourses.loading = true;
        state.externalCourses.error = null;
      })
      .addCase(fetchCoursesByCategory.fulfilled, (state, action) => {
        state.externalCourses.loading = false;
        state.externalCourses.data = action.payload;
        state.externalCourses.error = null;
      })
      .addCase(fetchCoursesByCategory.rejected, (state, action) => {
        state.externalCourses.loading = false;
        state.externalCourses.error = action.payload;
      });
  },
});

// Export actions
export const {
  setActiveTab,
  setFilter,
  clearFilter,
  resetStats,
  resetRoleData,
  resetJobs,
  resetMyJobs,
  resetMyApplications,
  resetCredentialHistory,
  resetExternalCourses,
  resetCourseCategories,
  resetJobStats,
  resetAll,
} = homeSlice.actions;

// Selectors
export const selectHomeStats = (state) => state.home.stats;
export const selectRoleData = (state, role) => state.home.roleData[role];
export const selectJobs = (state) => state.home.jobs;
export const selectMyJobs = (state) => state.home.myJobs;
export const selectMyApplications = (state) => state.home.myApplications;
export const selectCredentialHistory = (state) => state.home.credentialHistory;
export const selectExternalCourses = (state) => state.home.externalCourses;
export const selectCourseCategories = (state) => state.home.courseCategories;
export const selectJobStats = (state) => state.home.jobStats;
export const selectActiveTab = (state) => state.home.activeTab;
export const selectFilters = (state, section) => state.home.filters[section];

// Complex selectors
export const selectIsLoading = (state) => {
  return (
    state.home.stats.loading ||
    state.home.roleData.users.loading ||
    state.home.roleData.admins.loading ||
    state.home.roleData.employers.loading ||
    state.home.jobs.loading ||
    state.home.myJobs.loading ||
    state.home.myApplications.loading ||
    state.home.credentialHistory.loading ||
    state.home.externalCourses.loading ||
    state.home.courseCategories.loading ||
    state.home.jobStats.loading
  );
};

export const selectHasErrors = (state) => {
  return (
    state.home.stats.error ||
    state.home.roleData.users.error ||
    state.home.roleData.admins.error ||
    state.home.roleData.employers.error ||
    state.home.jobs.error ||
    state.home.myJobs.error ||
    state.home.myApplications.error ||
    state.home.credentialHistory.error ||
    state.home.externalCourses.error ||
    state.home.courseCategories.error ||
    state.home.jobStats.error
  );
};

export default homeSlice.reducer;
