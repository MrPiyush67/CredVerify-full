/**
 * Manual Verification Controller
 * Handles certificate verification via QR code image upload or direct link
 */

import multer from 'multer';
import { asyncHandler } from '../../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../../core/utils/response.js';
import * as verificationService from '../services/manualVerification.service.js';
import { verifyFromManualInput } from './orchestrators/manualVerification.js';

// ============================================
// MULTER CONFIGURATION
// ============================================

/**
 * Configure multer for in-memory storage
 * Files are stored as Buffer in req.file.buffer
 */
const storage = multer.memoryStorage();

/**
 * File filter - only accept images
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'), false);
  }
};

/**
 * Multer upload middleware
 * - Single file field named 'certificateImage'
 * - Max file size: 10MB
 */
export const uploadCertificateImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
}).single('certificateImage');

// ============================================
// CONTROLLER METHODS
// ============================================

/**
 * @desc    Manual certificate verification via QR code or direct link
 * @route   POST /api/credentials/manual-verify
 * @access  Private (Credentialist only)
 * 
 * @body    {
 *            certificateImage?: File,  // Image file containing QR code
 *            link?: string,            // Direct verification URL
 *            autoSave?: boolean        // Auto-save if verified (default: true)
 *          }
 * 
 * @returns {
 *            success: boolean,
 *            message: string,
 *            data: {
 *              verificationUrl: string,
 *              verification: { status, finalScore, ... },
 *              extractedData: { recipientName, courseTitle, ... },
 *              credential: { _id, ... } (if saved)
 *            }
 *          }
 */
export const manualVerification = asyncHandler(async (req, res) => {
  const { link, autoSave = true, testMode, testUserName } = req.body;
  const uploadedFile = req.file;

  // Support test mode (no auth required)
  // Handle string values from FormData
  const isTestMode = testMode === true || testMode === 'true';
  const userId = isTestMode ? 'test-user-id' : req.user?._id;

  if (!isTestMode && !req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required (or use testMode: true)',
    });
  }

  // Validate input
  if (!uploadedFile && !link) {
    return res.status(400).json({
      success: false,
      message: 'Please provide either a certificate image (with QR code) or a direct verification link.',
    });
  }

  console.log('🟢 [MANUAL-VERIFY-CONTROLLER] Starting verification...');
  console.log(`   User: ${isTestMode ? testUserName : req.user.name} (${userId})`);
  console.log(`   Input type: ${uploadedFile ? 'QR Image' : 'Direct Link'}`);
  console.log(`   Test mode: ${isTestMode ? 'Yes' : 'No'}`);

  try {
    // Call the orchestrator
    const result = await verifyFromManualInput({
      userId,
      link,
      certificateImage: uploadedFile?.buffer,
      autoSave,
      testMode: isTestMode,
      testUserName,
    });

    // Handle early rejections (untrusted domain)
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message,
        error: result.error,
        data: {
          verificationUrl: result.verificationUrl,
          domainValidation: result.domainValidation,
        },
      });
    }

    // Success - return complete verification result
    const statusCode = result.verification.status === 'VERIFIED' ? 200 :
      result.verification.status === 'REVIEW_REQUIRED' ? 200 : 400;

    return res.status(statusCode).json({
      success: true,
      message: `Certificate ${result.verification.status.toLowerCase()} - ${result.verification.reason}`,
      data: {
        verificationUrl: result.verificationUrl,
        verification: result.verification,
        extractedData: result.extractedData,
        nameValidation: result.nameValidation,
        domainValidation: result.domainValidation,
        credential: result.credential,
        candidatesAnalyzed: result.candidatesAnalyzed,
      },
    });

  } catch (error) {
    console.error('❌ [MANUAL-VERIFY-CONTROLLER] Verification failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Certificate verification failed',
      error: error.message,
    });
  }
});

/**
 * @desc    Test endpoint for QR code extraction only
 * @route   POST /api/credentials/test-qr
 * @access  Private (for testing)
 */
export const testQrExtraction = asyncHandler(async (req, res) => {
  const uploadedFile = req.file;

  if (!uploadedFile) {
    return res.status(400).json({
      success: false,
      message: 'Please upload an image file',
    });
  }

  try {
    const url = await verificationService.extractUrlFromImage(uploadedFile.buffer);

    return sendSuccess(res, 200, 'QR code extracted successfully', {
      url,
      fileSize: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
