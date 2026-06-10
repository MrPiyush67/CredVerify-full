import express from 'express';
import { protect } from '../../../core/middleware/auth.js';
import { optionalAuth } from '../../../core/middleware/optionalAuth.js';
import { isLearner, isRegulator } from '../../../core/middleware/roleGuard.js';
import {
  verifyCertificate,
  getTrustedDomainsList,
  extractCertificatePreview,
} from '../verification/verification.controller.js';
import {
  manualVerification,
  testQrExtraction,
  uploadCertificateImage,
} from '../verification/manualVerification.controller.js';

const router = express.Router();

// Public routes
router.get('/credentials/trusted-domains', getTrustedDomainsList);

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

// Regulator routes (for bulk issuance and certificate preview)
router.post('/credentials/preview', protect, isRegulator, previewCertificate);
router.post('/credentials/bulk-issue', protect, isRegulator, issueBulkCredentials);

export default router;
