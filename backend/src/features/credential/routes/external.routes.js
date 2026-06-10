import express from 'express';
import { protect } from '../../../core/middleware/auth.js';
import {
  getExternalCourses,
  getCourseCategories,
  getCoursesByCategory,
  getExternalJobs,
  getJobSectors,
  getJobsBySector,
} from '../credential.controller.js';

const router = express.Router();

// External courses routes (public)
router.get('/credentials/external-courses', getExternalCourses);
router.get('/credentials/course-categories', getCourseCategories);
router.get('/credentials/courses-by-category/:category', getCoursesByCategory);

// External jobs routes (public)
router.get('/credentials/external-jobs', getExternalJobs);
router.get('/credentials/job-sectors', getJobSectors);
router.get('/credentials/jobs-by-sector/:sector', getJobsBySector);

export default router;
