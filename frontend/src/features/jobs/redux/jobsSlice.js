import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import jobsApi from '../api/jobsApi.js';

const initialState = {
  jobs: [],
  myJobs: [],
  myApplications: [],
  selectedJob: null,
  jobApplicants: [],
  loading: { jobs: false, myJobs: false, applications: false, jobApplicants: false, action: false },
  errors: { jobs: null, myJobs: null, applications: null, jobApplicants: null, action: null },
};

export const fetchJobs = createAsyncThunk('jobs/fetchJobs', async (filters = {}, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getJobs(filters);
    const ok = res?.data?.success ?? true;
    // Backend returns { success: true, data: { jobs: [...] } }
    const list = res?.data?.data?.jobs ?? res?.data?.jobs ?? res?.data?.data ?? res?.data ?? [];
    if (!ok && !Array.isArray(list)) return rejectWithValue('Failed to fetch jobs');
    const transformed = (Array.isArray(list) ? list : []).map((j) => ({
      id: j._id || j.id,
      _id: j._id || j.id,
      title: j.title,
      company: j.curator?.companyName || j.employerId?.companyName || j.company || 'Unknown Company',
      curator: j.curator,
      location: j.location,
      skills: j.skills || [],
      status: j.status,
      salary: j.salary,
      description: j.description,
      employmentType: j.employmentType,
      jobType: j.jobType,
      experienceLevel: j.experienceLevel,
      requirements: j.requirements || [],
      applicationDeadline: j.applicationDeadline,
      createdAt: j.createdAt,
    }));
    return transformed;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const fetchMyJobs = createAsyncThunk('jobs/fetchMyJobs', async (_, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getMyJobs();
    const ok = res?.data?.success ?? true;
    // Backend returns { success: true, data: { jobs: [...] } }
    const list = res?.data?.data?.jobs ?? res?.data?.jobs ?? res?.data?.data ?? res?.data ?? [];
    if (!ok && !Array.isArray(list)) return rejectWithValue('Failed to fetch my jobs');
    const transformed = (Array.isArray(list) ? list : []).map((j) => ({
      id: j._id || j.id,
      _id: j._id || j.id,
      title: j.title,
      location: j.location,
      skills: j.skills || [],
      status: j.status,
      salary: j.salary,
      description: j.description,
      employmentType: j.employmentType,
      jobType: j.jobType,
      experienceLevel: j.experienceLevel,
      requirements: j.requirements || [],
      applicationDeadline: j.applicationDeadline,
      applicants: j.applicants || [],
      applicantCount: j.applicants?.length || j.applicantCount || 0,
      createdAt: j.createdAt,
    }));
    return transformed;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const fetchMyApplications = createAsyncThunk('jobs/fetchMyApplications', async (_, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getMyApplications();
    const ok = res?.data?.success ?? true;
    const list = res?.data?.data ?? res?.data ?? [];
    if (!ok && !Array.isArray(list)) return rejectWithValue('Failed to fetch applications');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const fetchJobApplicants = createAsyncThunk('jobs/fetchJobApplicants', async (jobId, { rejectWithValue }) => {
  try {
    const res = await jobsApi.getJobApplicants(jobId);
    const ok = res?.data?.success ?? true;
    // Backend returns { success, data: { applicants: [...] } }
    const list = res?.data?.data?.applicants ?? res?.data?.applicants ?? res?.data?.data ?? res?.data ?? [];
    if (!ok && !Array.isArray(list)) return rejectWithValue('Failed to fetch applicants');
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const createJob = createAsyncThunk('jobs/create', async (jobData, { rejectWithValue }) => {
  try {
    const res = await jobsApi.createJob(jobData);
    const ok = res?.data?.success ?? true;
    if (!ok) return rejectWithValue(res?.data?.message || 'Failed to create job');
    // Backend returns { success, data: { job: {...} } }
    const job = res?.data?.data?.job ?? res?.data?.job ?? res?.data?.data ?? res?.data;
    return job;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const updateJob = createAsyncThunk('jobs/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await jobsApi.updateJob(id, data);
    const ok = res?.data?.success ?? true;
    if (!ok) return rejectWithValue(res?.data?.message || 'Failed to update job');
    return res?.data?.data ?? res?.data;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const deleteJob = createAsyncThunk('jobs/delete', async (jobId, { rejectWithValue }) => {
  try {
    const res = await jobsApi.deleteJob(jobId);
    const ok = res?.data?.success ?? true;
    if (!ok) return rejectWithValue(res?.data?.message || 'Failed to delete job');
    return jobId;
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const updateJobStatus = createAsyncThunk('jobs/updateStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    // Use the main updateJob endpoint to update just the status
    const res = await jobsApi.updateJob(id, { status });
    const ok = res?.data?.success ?? true;
    if (!ok) return rejectWithValue(res?.data?.message || 'Failed to update status');
    return { id, status };
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

export const applyToJob = createAsyncThunk('jobs/applyToJob', async (jobId, { rejectWithValue }) => {
  try {
    const res = await jobsApi.applyForJob(jobId);
    const ok = res?.data?.success ?? true;
    if (!ok) return rejectWithValue(res?.data?.message || 'Failed to apply');
    return { jobId, application: res?.data?.data ?? res?.data };
  } catch (e) {
    return rejectWithValue(e?.response?.data?.message || e.message);
  }
});

const slice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.errors = { jobs: null, myJobs: null, applications: null, jobApplicants: null, action: null };
    },
    setSelectedJob: (state, action) => {
      state.selectedJob = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (s) => {
        s.loading.jobs = true; s.errors.jobs = null;
      })
      .addCase(fetchJobs.fulfilled, (s, a) => {
        s.loading.jobs = false; s.jobs = a.payload;
      })
      .addCase(fetchJobs.rejected, (s, a) => {
        s.loading.jobs = false; s.errors.jobs = a.payload;
      })

      // Fetch my jobs
      .addCase(fetchMyJobs.pending, (s) => {
        s.loading.myJobs = true; s.errors.myJobs = null;
      })
      .addCase(fetchMyJobs.fulfilled, (s, a) => {
        s.loading.myJobs = false; s.myJobs = a.payload;
      })
      .addCase(fetchMyJobs.rejected, (s, a) => {
        s.loading.myJobs = false; s.errors.myJobs = a.payload;
      })

      // Fetch applications
      .addCase(fetchMyApplications.pending, (s) => {
        s.loading.applications = true; s.errors.applications = null;
      })
      .addCase(fetchMyApplications.fulfilled, (s, a) => {
        s.loading.applications = false; s.myApplications = a.payload;
      })
      .addCase(fetchMyApplications.rejected, (s, a) => {
        s.loading.applications = false; s.errors.applications = a.payload;
      })

      // Fetch job applicants
      .addCase(fetchJobApplicants.pending, (s) => {
        s.loading.jobApplicants = true; s.errors.jobApplicants = null;
      })
      .addCase(fetchJobApplicants.fulfilled, (s, a) => {
        s.loading.jobApplicants = false; s.jobApplicants = a.payload;
      })
      .addCase(fetchJobApplicants.rejected, (s, a) => {
        s.loading.jobApplicants = false; s.errors.jobApplicants = a.payload;
      })

      // Create job
      .addCase(createJob.pending, (s) => {
        s.loading.action = true; s.errors.action = null;
      })
      .addCase(createJob.fulfilled, (s, a) => {
        s.loading.action = false;
        s.myJobs.unshift(a.payload);
      })
      .addCase(createJob.rejected, (s, a) => {
        s.loading.action = false; s.errors.action = a.payload;
      })

      // Update job
      .addCase(updateJob.pending, (s) => {
        s.loading.action = true; s.errors.action = null;
      })
      .addCase(updateJob.fulfilled, (s, a) => {
        s.loading.action = false;
        const index = s.myJobs.findIndex(j => j._id === a.payload._id);
        if (index !== -1) s.myJobs[index] = a.payload;
      })
      .addCase(updateJob.rejected, (s, a) => {
        s.loading.action = false; s.errors.action = a.payload;
      })

      // Delete job
      .addCase(deleteJob.pending, (s) => {
        s.loading.action = true; s.errors.action = null;
      })
      .addCase(deleteJob.fulfilled, (s, a) => {
        s.loading.action = false;
        s.myJobs = s.myJobs.filter(j => j._id !== a.payload);
      })
      .addCase(deleteJob.rejected, (s, a) => {
        s.loading.action = false; s.errors.action = a.payload;
      })

      // Update job status
      .addCase(updateJobStatus.pending, (s) => {
        s.loading.action = true; s.errors.action = null;
      })
      .addCase(updateJobStatus.fulfilled, (s, a) => {
        s.loading.action = false;
        const index = s.myJobs.findIndex(j => j._id === a.payload.id);
        if (index !== -1) s.myJobs[index].status = a.payload.status;
      })
      .addCase(updateJobStatus.rejected, (s, a) => {
        s.loading.action = false; s.errors.action = a.payload;
      })

      // Apply to job
      .addCase(applyToJob.pending, (s) => {
        s.loading.applications = true;
      })
      .addCase(applyToJob.fulfilled, (s, a) => {
        s.loading.applications = false; s.myApplications.unshift(a.payload.application);
      })
      .addCase(applyToJob.rejected, (s, a) => {
        s.loading.applications = false; s.errors.applications = a.payload;
      });
  }
});

export const { clearErrors, setSelectedJob } = slice.actions;
export default slice.reducer;

// selectors
export const selectJobs = (state) => state.jobs?.jobs ?? [];
export const selectMyJobs = (state) => state.jobs?.myJobs ?? [];
export const selectMyApplications = (state) => state.jobs?.myApplications ?? [];
export const selectJobApplicants = (state) => state.jobs?.jobApplicants ?? [];
export const selectSelectedJob = (state) => state.jobs?.selectedJob;
export const selectJobsLoading = (state) => state.jobs?.loading ?? {};
export const selectJobsErrors = (state) => state.jobs?.errors ?? {};
