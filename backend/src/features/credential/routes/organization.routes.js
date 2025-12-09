import express from 'express';
import { validateApiKey } from '../../../core/middleware/apiKeyAuth.js';
import { protect } from '../../../core/middleware/auth.js';
import * as orgController from '../controllers/organization.controller.js';

const router = express.Router();

/**
 * Organization Certificate Routes
 * Handles both Python script submissions and frontend user verification
 */

// ========================================
// Python Script Endpoints (API Key Auth)
// ========================================

/**
 * @route   POST /api/certificates/organization/submit
 * @desc    Submit a new certificate from random generator or bulk upload
 * @access  Private (API Key)
 * @body    { certificate: { recipientName, certificateId, companyName, issuer, ... } }
 */
router.post('/submit', validateApiKey, orgController.submitCertificate);

/**
 * @route   GET /api/certificates/organization/pending
 * @desc    Get pending certificates for watcher script processing
 * @access  Private (API Key)
 * @query   ?limit=10
 */
router.get('/pending', validateApiKey, orgController.getPendingCertificates);

/**
 * @route   PUT /api/certificates/organization/:id/process
 * @desc    Update certificate after OCR/LLM processing
 * @access  Private (API Key)
 * @params  id - Certificate ID
 * @body    { ocrText, extractedData, processingStatus }
 */
router.put('/:id/process', validateApiKey, orgController.processCertificate);

// ========================================
// Frontend User Endpoints (User Auth)
// ========================================

/**
 * @route   GET /api/certificates/organization/companies
 * @desc    Get list of companies with certificate counts for dropdown
 * @access  Private (Authenticated User)
 */
router.get('/companies', protect, orgController.getCompanies);

/**
 * @route   POST /api/certificates/organization/verify
 * @desc    Verify user-uploaded certificate against organization database
 * @access  Private (Authenticated User)
 * @body    { companyName, certificateImageBase64, courseUrl? }
 */
router.post('/verify', protect, orgController.verifyUserCertificate);

export default router;
