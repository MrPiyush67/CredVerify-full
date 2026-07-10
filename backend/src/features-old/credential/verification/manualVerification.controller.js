import { ApiResponse } from '../../../utils/ApiResponse.js';
/**
 * Manual Verification Controller
 * Handles certificate verification via QR code image upload or direct link
 */

import multer from 'multer';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { AppError } from '../../../core/errors/AppError.js';
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
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, and WEBP images are allowed.',
      ),
      false,
    );
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
 * @access  Private (Learner only)
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
  const { link, courseUrl, autoSave = true, testMode, testUserName } = req.body; // NEW: courseUrl
  const uploadedFile = req.file;

  // Support test mode (no auth required)
  // Handle string values from FormData
  const isTestMode = testMode === true || testMode === 'true';
  const userId = isTestMode ? 'test-user-id' : req.user?._id;

  console.log('🔍 [MANUAL-VERIFY-CONTROLLER] Authentication Debug:');
  console.log(`   isTestMode: ${isTestMode}`);
  console.log(`   req.user exists: ${!!req.user}`);
  console.log(`   req.user._id: ${req.user?._id}`);
  console.log(`   req.user.name: ${req.user?.name}`);
  console.log(`   req.user.email: ${req.user?.email}`);
  console.log(`   userId being used: ${userId}`);

  if (!isTestMode && !req.user) {
    throw new AppError(401, 'Authentication required (or use testMode: true)');
  }

  // Validate input
  if (!uploadedFile && !link) {
    throw new AppError(
      400,
      'Please provide either a certificate image (with QR code) or a direct verification link.',
    );
  }

  console.log('🟢 [MANUAL-VERIFY-CONTROLLER] Starting verification...');
  console.log(
    `   User: ${isTestMode ? testUserName : req.user.name} (${userId})`,
  );
  console.log(`   Input type: ${uploadedFile ? 'QR Image' : 'Direct Link'}`);
  console.log(`   Test mode: ${isTestMode ? 'Yes' : 'No'}`);

  try {
    // Call the orchestrator
    const result = await verifyFromManualInput({
      userId,
      link,
      courseUrl, // NEW: Pass course URL
      certificateImage: uploadedFile?.buffer,
      autoSave,
      testMode: isTestMode,
      testUserName,
    });

    // Handle early rejections (untrusted domain)
    if (!result.success) {
      throw new AppError(400, 'An error occurred');
    }

    // Success - return complete verification result
    const statusCode =
      result.verification.status === 'VERIFIED'
        ? 200
        : result.verification.status === 'REVIEW_REQUIRED'
          ? 200
          : 400;

    return res.status(statusCode).json(
      new ApiResponse(
        statusCode,
        {
          verificationUrl: result.verificationUrl,
          verification: result.verification,
          extractedData: result.extractedData,
          nameValidation: result.nameValidation,
          domainValidation: result.domainValidation,
          credential: result.credential,
          candidatesAnalyzed: result.candidatesAnalyzed,
        },
        `Certificate ${result.verification.status.toLowerCase()} - ${result.verification.reason}`,
      ),
    );
  } catch (error) {
    console.error('❌ [MANUAL-VERIFY-CONTROLLER] Verification failed:', error);

    // Handle duplicate certificate error
    if (error.message === 'DUPLICATE_CERTIFICATE') {
      return res.status(error.statusCode || 409).json({
        success: false,
        message:
          error.data?.message || 'This certificate has already been uploaded',
        error: 'DUPLICATE_CERTIFICATE',
        data: error.data,
      });
    }

    throw new AppError(500, 'Certificate verification failed');
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
    throw new AppError(400, 'Please upload an image file');
  }

  try {
    const url = await verificationService.extractUrlFromImage(
      uploadedFile.buffer,
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          url,
          fileSize: uploadedFile.size,
          mimeType: uploadedFile.mimetype,
        },
        'QR code extracted successfully',
      ),
    );
  } catch (error) {
    throw new AppError(400, 'An error occurred');
  }
});
