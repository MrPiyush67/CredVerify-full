import { axiosClient } from '@/shared';
import ENDPOINTS from '@/shared/services/endpoints.js';

const jobsApi = {
  getJobs(filters = {}) {
    return axiosClient.get(ENDPOINTS.JOBS.LIST, { params: filters });
  },
  getJob(jobId) {
    return axiosClient.get(ENDPOINTS.JOBS.GET(jobId));
  },
  getMyJobs() {
    return axiosClient.get(ENDPOINTS.JOBS.MY_JOBS);
  },
  getMyApplications() {
    return axiosClient.get(ENDPOINTS.JOBS.MY_APPLICATIONS);
  },
  getJobApplicants(jobId) {
    return axiosClient.get(ENDPOINTS.JOBS.APPLICANTS(jobId));
  },
  getApplicantDetails(jobId, applicantUserId) {
    return axiosClient.get(
      ENDPOINTS.JOBS.APPLICANT_DETAILS(jobId, applicantUserId),
    );
  },
  createJob(jobData) {
    return axiosClient.post(ENDPOINTS.JOBS.CREATE, jobData);
  },
  updateJob(jobId, jobData) {
    return axiosClient.patch(ENDPOINTS.JOBS.UPDATE(jobId), jobData);
  },
  deleteJob(jobId) {
    return axiosClient.delete(ENDPOINTS.JOBS.DELETE(jobId));
  },
  applyForJob(jobId) {
    return axiosClient.post(ENDPOINTS.JOBS.APPLY(jobId));
  },
  updateApplicantStatus(jobId, applicantId, status) {
    return axiosClient.patch(
      ENDPOINTS.JOBS.UPDATE_APPLICANT(jobId, applicantId),
      { status },
    );
  },
  getJobStats() {
    return axiosClient.get(ENDPOINTS.JOBS.STATS);
  },
};

export default jobsApi;

// Named exports for convenience
export const {
  getJobs,
  getJob,
  getMyJobs,
  getMyApplications,
  getJobApplicants,
  getApplicantDetails,
  createJob,
  updateJob,
  deleteJob,
  applyForJob,
  updateApplicantStatus,
  getJobStats,
} = jobsApi;
