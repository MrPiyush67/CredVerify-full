import express from 'express';
import { protect } from '../../core/middleware/auth.js';
import { optionalAuth } from '../../core/middleware/optionalAuth.js';
import { isCredentialist, isValidant } from '../../core/middleware/roleGuard.js';
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

// Extension routes (requires auth but not role-specific)
router.post('/credentials/from-extension', protect, createCredentialFromExtension);

// Certificate verification endpoints (OCR + LLM pipeline)
// Note: verify-certificate supports testMode for training/testing
// Uses optionalAuth middleware to handle both authenticated requests and test mode
router.post('/credentials/verify-certificate', optionalAuth, verifyCertificate);
router.post('/credentials/extract-preview', protect, extractCertificatePreview);

// Manual verification endpoints (QR code + web scraping)
router.post('/credentials/manual-verify', protect, isCredentialist, uploadCertificateImage, manualVerification);
router.post('/credentials/test-qr', protect, uploadCertificateImage, testQrExtraction);

// Validant routes (specific routes first)
router.get('/credentials/pending', protect, isValidant, getPendingCredentials);
router.post('/credentials/preview', protect, isValidant, previewCertificate);
router.post('/credentials/bulk-issue', protect, isValidant, issueBulkCredentials);

// Credentialist routes (specific routes before parameterized)
router.post('/credentials', protect, isCredentialist, uploadCredential);
router.get('/credentials/verified', protect, isCredentialist, getVerifiedCredentials);
router.get('/credentials/stats', protect, isCredentialist, getCredentialStats);
router.get('/credentials', protect, isCredentialist, getMyCredentials);
router.get('/credentials/:id', protect, getCredentialById);
router.patch('/credentials/:id', protect, isCredentialist, updateCredential);
router.delete('/credentials/:id', protect, isCredentialist, deleteCredential);
router.post(
  '/credentials/:id/request-verification',
  protect,
  isCredentialist,
  requestVerification
);

// More validant routes
router.post('/credentials/:id/verify', protect, isValidant, verifyCredential);
router.post('/credentials/:id/reject', protect, isValidant, rejectCredential);

export default router;
