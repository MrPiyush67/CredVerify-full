import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import * as jobService from './job.service.js';

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private (Employer only)
export const createJob = asyncHandler(async (req, res) => {
  const job = await jobService.createJob(req.user._id, req.body);
  return res.status(201).json(new ApiResponse(201, { job }, 'Job posted successfully'));
});

// @desc    Get my posted jobs
// @route   GET /api/jobs/my-jobs
// @access  Private (Employer only)
export const getMyJobs = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const jobs = await jobService.getJobsByEmployer(req.user._id, status);
  return res.status(200).json(new ApiResponse(200, { jobs }, 'Jobs fetched successfully'));
});

// @desc    Get all active jobs (browse/search)
// @route   GET /api/jobs
// @access  Public
export const getAllJobs = asyncHandler(async (req, res) => {
  const { jobType, experienceLevel, location } = req.query;
  const filters = {};

  if (jobType) filters.jobType = jobType;
  if (experienceLevel) filters.experienceLevel = experienceLevel;
  if (location) filters.location = location;

  const jobs = await jobService.getAllJobs(filters);
  return res.status(200).json(new ApiResponse(200, { jobs }, 'Jobs fetched successfully'));
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = asyncHandler(async (req, res) => {
  const job = await jobService.getJobById(req.params.id);
  return res.status(200).json(new ApiResponse(200, { job }, 'Job fetched successfully'));
});

// @desc    Update a job
// @route   PATCH /api/jobs/:id
// @access  Private (Employer only)
export const updateJob = asyncHandler(async (req, res) => {
  const job = await jobService.updateJob(req.user._id, req.params.id, req.body);
  return res.status(200).json(new ApiResponse(200, { job }, 'Job updated successfully'));
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private (Employer only)
export const deleteJob = asyncHandler(async (req, res) => {
  await jobService.deleteJob(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, null, 'Job deleted successfully'));
});

// @desc    Get applicants for a job
// @route   GET /api/jobs/:id/applicants
// @access  Private (Employer only)
export const getApplicants = asyncHandler(async (req, res) => {
  const applicants = await jobService.getApplicants(req.user._id, req.params.id);
  return res.status(200).json(new ApiResponse(200, { applicants }, 'Applicants fetched successfully'));
});

// @desc    Get full applicant details (profile + credentials)
// @route   GET /api/jobs/:jobId/applicants/:applicantUserId/details
// @access  Private (Employer only)
export const getApplicantDetails = asyncHandler(async (req, res) => {
  const details = await jobService.getApplicantDetails(
    req.user._id,
    req.params.jobId,
    req.params.applicantUserId
  );
  return res.status(200).json(new ApiResponse(200, details, 'Applicant details fetched successfully'));
});

// @desc    Update applicant status
// @route   PATCH /api/jobs/:jobId/applicants/:applicantId
// @access  Private (Employer only)
export const updateApplicantStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const job = await jobService.updateApplicantStatus(
    req.user._id,
    req.params.jobId,
    req.params.applicantId,
    status
  );
  return res.status(200).json(new ApiResponse(200, { job }, 'Applicant status updated successfully'));
});

// @desc    Apply to a job
// @route   POST /api/jobs/:id/apply
// @access  Private (Learner only)
export const applyToJob = asyncHandler(async (req, res) => {
  const job = await jobService.applyToJob(req.params.id, req.user._id);
  return res.status(200).json(new ApiResponse(200, { job }, 'Application submitted successfully'));
});

// @desc    Get my applications (learner)
// @route   GET /api/jobs/my-applications
// @access  Private (Learner only)
export const getMyApplications = asyncHandler(async (req, res) => {
  const applications = await jobService.getMyApplications(req.user._id);
  return res.status(200).json(new ApiResponse(200, { applications }, 'Applications fetched successfully'));
});

// @desc    Get job statistics (employer dashboard)
// @route   GET /api/jobs/stats
// @access  Private (Employer only)
export const getJobStats = asyncHandler(async (req, res) => {
  const stats = await jobService.getJobStats(req.user._id);
  return res.status(200).json(new ApiResponse(200, { stats }, 'Job stats fetched successfully'));
});
