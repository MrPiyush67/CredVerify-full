import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isCurator, isCredentialist } from '../../core/middleware/roleGuard.js';
import {
  createJob,
  getMyJobs,
  getAllJobs,
  getJobById,
  updateJob,
  deleteJob,
  getApplicants,
  getApplicantDetails,
  updateApplicantStatus,
  applyToJob,
  getMyApplications,
  getJobStats,
} from './job.controller.js';

const router = express.Router();

// Curator routes (specific routes first)
router.post('/jobs', protect, isCurator, createJob);
router.get('/jobs/my-jobs', protect, isCurator, getMyJobs);
router.get('/jobs/stats', protect, isCurator, getJobStats);

// Credentialist routes (before public routes to prevent conflicts)
router.get('/jobs/my-applications', protect, isCredentialist, getMyApplications);

// Public routes
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobById);

// More curator routes
router.patch('/jobs/:id', protect, isCurator, updateJob);
router.delete('/jobs/:id', protect, isCurator, deleteJob);
router.get('/jobs/:id/applicants', protect, isCurator, getApplicants);
router.get(
  '/jobs/:jobId/applicants/:applicantUserId/details',
  protect,
  isCurator,
  getApplicantDetails
);
router.patch(
  '/jobs/:jobId/applicants/:applicantId',
  protect,
  isCurator,
  updateApplicantStatus
);

// More credentialist routes
router.post('/jobs/:id/apply', protect, isCredentialist, applyToJob);

export default router;
