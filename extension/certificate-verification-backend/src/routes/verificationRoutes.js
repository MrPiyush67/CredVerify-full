import express from 'express';
import {
  verifyCertificate,
  saveVerification,
  getVerifications,
  getVerificationById,
} from '../controllers/verificationController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

/**
 * @route   POST /api/verify-certificate
 * @desc    Verify certificate image with OCR and LLM
 * @access  Public
 * @note    Accepts either file upload OR image_url in body
 */
router.post('/verify-certificate', (req, res, next) => {
  // Only use multer if there's a file in the request
  if (req.headers['content-type']?.includes('multipart/form-data')) {
    upload.single('file')(req, res, next);
  } else {
    next();
  }
}, verifyCertificate);

/**
 * @route   POST /api/save-verification
 * @desc    Save verification to database
 * @access  Public
 */
router.post('/save-verification', saveVerification);

/**
 * @route   GET /api/verifications
 * @desc    Get all verifications (paginated)
 * @access  Public
 */
router.get('/verifications', getVerifications);

/**
 * @route   GET /api/verifications/:id
 * @desc    Get single verification by ID
 * @access  Public
 */
router.get('/verifications/:id', getVerificationById);

export default router;
