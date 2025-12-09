import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { optionalAuth } from '../../core/middleware/optionalAuth.js';
import { isLearner, isRegulator } from '../../core/middleware/roleGuard.js';
import {
  uploadCredential,
  getMyCredentials,
  getCredentialById,
  updateCredential,
  deleteCredential,
  requestVerification,
  getVerifiedCredentials,
  getCredentialStats,
  getPublicCredentials,
  getPendingCredentials,
  verifyCredential,
  rejectCredential,
  createCredentialFromExtension,
  issueBulkCredentials,
  previewCertificate,
  getExternalCourses,
  getCourseCategories,
  getCoursesByCategory,
  getExternalJobs,
  getJobSectors,
  getJobsBySector,
} from './credential.controller.js';
import {
  verifyCertificate,
  getTrustedDomainsList,
  extractCertificatePreview,
} from './verification/verification.controller.js';
import {
  manualVerification,
  testQrExtraction,
  uploadCertificateImage,
} from './verification/manualVerification.controller.js';

const router = express.Router();

// Public routes
router.get('/credentials/public', getPublicCredentials);
router.get('/credentials/trusted-domains', getTrustedDomainsList);

// External courses routes (public)
router.get('/credentials/external-courses', getExternalCourses);
router.get('/credentials/course-categories', getCourseCategories);
router.get('/credentials/courses-by-category/:category', getCoursesByCategory);

// External jobs routes (public)
router.get('/credentials/external-jobs', getExternalJobs);
router.get('/credentials/job-sectors', getJobSectors);
router.get('/credentials/jobs-by-sector/:sector', getJobsBySector);

// Extension routes (requires auth but not role-specific)
router.post('/credentials/from-extension', protect, createCredentialFromExtension);

// Certificate verification endpoints (OCR + LLM pipeline)
// Note: verify-certificate supports testMode for training/testing
// Uses optionalAuth middleware to handle both authenticated requests and test mode
router.post('/credentials/verify-certificate', optionalAuth, verifyCertificate);
router.post('/credentials/extract-preview', protect, extractCertificatePreview);

// Manual verification endpoints (QR code + web scraping)
// Note: manual-verify supports testMode for training/testing
// Uses optionalAuth middleware to handle both authenticated requests and test mode
router.post('/credentials/manual-verify', uploadCertificateImage, optionalAuth, manualVerification);
router.post('/credentials/test-qr', protect, uploadCertificateImage, testQrExtraction);

// Regulator routes (specific routes first)
router.get('/credentials/pending', protect, isRegulator, getPendingCredentials);
router.post('/credentials/preview', protect, isRegulator, previewCertificate);
router.post('/credentials/bulk-issue', protect, isRegulator, issueBulkCredentials);

// Learner routes (specific routes before parameterized)
router.post('/credentials', protect, isLearner, uploadCredential);
router.get('/credentials/verified', protect, isLearner, getVerifiedCredentials);
router.get('/credentials/stats', protect, isLearner, getCredentialStats);
router.get('/credentials', protect, isLearner, getMyCredentials);
router.get('/credentials/:id', protect, getCredentialById);
router.patch('/credentials/:id', protect, isLearner, updateCredential);
router.delete('/credentials/:id', protect, isLearner, deleteCredential);
router.post(
  '/credentials/:id/request-verification',
  protect,
  isLearner,
  requestVerification
);

// More regulator routes
router.post('/credentials/:id/verify', protect, isRegulator, verifyCredential);
router.post('/credentials/:id/reject', protect, isRegulator, rejectCredential);

export default router;
