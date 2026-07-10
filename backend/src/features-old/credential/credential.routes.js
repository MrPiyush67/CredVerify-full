import express from 'express';
import { protect } from '../../middleware/auth.js';
import { optionalAuth } from '../../middleware/optionalAuth.js';
import { isLearner, isRegulator } from '../../middleware/roleGuard.js';
import {
  uploadCredential,
  getMyCredentials,
  getCredentialById,
  updateCredential,
  deleteCredential,
  getVerifiedCredentials,
  getCredentialStats,
  getPublicCredentials,
  createCredentialFromExtension,
  issueBulkCredentials,
  previewCertificate,
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
import {
  getExternalCourses,
  getCourseCategories,
  getCoursesByCategory,
  getExternalJobs,
  getJobSectors,
  getJobsBySector,
} from './credential.controller.js';

const router = express.Router();

// ============================
// Public credential routes
// ============================
router.get('/credentials/public', getPublicCredentials);
router.get('/credentials/trusted-domains', getTrustedDomainsList);

// ============================
// External courses (public)
// ============================
router.get('/credentials/external-courses', getExternalCourses);
router.get('/credentials/course-categories', getCourseCategories);
router.get('/credentials/courses-by-category/:category', getCoursesByCategory);

// ============================
// External jobs (public)
// ============================
router.get('/credentials/external-jobs', getExternalJobs);
router.get('/credentials/job-sectors', getJobSectors);
router.get('/credentials/jobs-by-sector/:sector', getJobsBySector);

// ============================
// Extension routes
// ============================
router.post(
  '/credentials/from-extension',
  protect,
  createCredentialFromExtension,
);

// ============================
// Verification pipeline (OCR + LLM)
// ============================
router.post('/credentials/verify-certificate', optionalAuth, verifyCertificate);
router.post('/credentials/extract-preview', protect, extractCertificatePreview);

// ============================
// Manual verification (QR + scraping)
// ============================
router.post(
  '/credentials/manual-verify',
  uploadCertificateImage,
  optionalAuth,
  manualVerification,
);
router.post(
  '/credentials/test-qr',
  protect,
  uploadCertificateImage,
  testQrExtraction,
);

// ============================
// Regulator routes
// ============================
router.post('/credentials/preview', protect, isRegulator, previewCertificate);
router.post(
  '/credentials/bulk-issue',
  protect,
  isRegulator,
  issueBulkCredentials,
);

// ============================
// Learner credential CRUD
// ============================
router.post('/credentials', protect, isLearner, uploadCredential);
router.get('/credentials/verified', protect, isLearner, getVerifiedCredentials);
router.get('/credentials/stats', protect, isLearner, getCredentialStats);
router.get('/credentials', protect, isLearner, getMyCredentials);
router.get('/credentials/:id', protect, getCredentialById);
router.patch('/credentials/:id', protect, isLearner, updateCredential);
router.delete('/credentials/:id', protect, isLearner, deleteCredential);

export default router;
