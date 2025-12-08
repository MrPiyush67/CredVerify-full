import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { isEmployer, isLearner } from '../../core/middleware/roleGuard.js';
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

// Employer routes (specific routes first)
router.post('/jobs', protect, isEmployer, createJob);
router.get('/jobs/my-jobs', protect, isEmployer, getMyJobs);
router.get('/jobs/stats', protect, isEmployer, getJobStats);

// Learner routes (before public routes to prevent conflicts)
router.get('/jobs/my-applications', protect, isLearner, getMyApplications);

// Public routes
router.get('/jobs', getAllJobs);
router.get('/jobs/:id', getJobById);

// More employer routes
router.patch('/jobs/:id', protect, isEmployer, updateJob);
router.delete('/jobs/:id', protect, isEmployer, deleteJob);
router.get('/jobs/:id/applicants', protect, isEmployer, getApplicants);
router.get(
  '/jobs/:jobId/applicants/:applicantUserId/details',
  protect,
  isEmployer,
  getApplicantDetails
);
router.patch(
  '/jobs/:jobId/applicants/:applicantId',
  protect,
  isEmployer,
  updateApplicantStatus
);

// More learner routes
router.post('/jobs/:id/apply', protect, isLearner, applyToJob);

export default router;
