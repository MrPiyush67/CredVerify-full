import { getTrustedDomains } from '../services/domainValidator.service.js';
import { verifyFromExtension } from './orchestrators/extensionVerification.js';

/**
 * POST /api/credentials/verify-certificate
 * Verify certificate from extension
 */
export async function verifyCertificate(req, res) {
  try {
    const { imageData, sourceUrl, imageType = 'base64', fileData, autoSave = true, testMode, testUserName, extractedText, courseUrl } = req.body;

    // Support test mode (no auth required)
    const userId = testMode ? 'test-user-id' : req.user?._id;

    if (!testMode && !req.user) {
      throw new AppError(401, 'Authentication required (or use testMode: true)');
    }

    // Validate required fields
    if (!imageData) {
      throw new AppError(400, 'Image data is required');
    }

    if (!sourceUrl) {
      throw new AppError(400, 'Source URL is required');
    }

    console.log('🔵 [EXTENSION-VERIFY-CONTROLLER] Starting verification for user:', userId);
    console.log('🔵 [EXTENSION-VERIFY-CONTROLLER] Source URL:', sourceUrl);
    console.log('🔵 [EXTENSION-VERIFY-CONTROLLER] Course URL received:', courseUrl || 'NOT PROVIDED');
    console.log('🔵 [EXTENSION-VERIFY-CONTROLLER] Request body:', JSON.stringify({
      imageData: imageData ? `${imageData.substring(0, 50)}...` : 'none',
      sourceUrl,
      courseUrl,
      autoSave,
      testMode
    }));

    // Call the orchestrator
    const result = await verifyFromExtension({
      userId,
      imageData,
      sourceUrl,
      extractedText,
      autoSave,
      testMode,
      testUserName,
      courseUrl,
    });

    // Handle early rejections (untrusted domain)
    if (!result.success) {
      throw new AppError(400, 'An error occurred');
    }

    // Success - return complete verification result
    const statusCode = result.verification.status === 'VERIFIED' ? 201 :
      result.verification.status === 'REVIEW_REQUIRED' ? 200 : 400;

    return res.status(statusCode).json(new ApiResponse(statusCode, {
        credential: result.credential,
        verification: result.verification,
        extractedData: result.extractedData,
        nameValidation: result.nameValidation,
        domainValidation: result.domainValidation,
        courseAnalysis: result.courseAnalysis, // Include course analysis if available
      }, `Certificate ${result.verification.status.toLowerCase()} - ${result.verification.reason}`));

  } catch (error) {
    console.error('❌ [EXTENSION-VERIFY-CONTROLLER] Verification failed:', error);

    // Handle duplicate certificate error
    if (error.message === 'DUPLICATE_CERTIFICATE') {
      return res.status(error.statusCode || 409).json({
        success: false,
        message: error.data?.message || 'This certificate has already been uploaded',
        error: 'DUPLICATE_CERTIFICATE',
        data: error.data,
      });
    }

    // Handle other errors
    throw new AppError(500, 'Certificate verification failed');
  }
}

/**
 * GET /api/credentials/trusted-domains
 * Get list of trusted certificate domains
 */
export async function getTrustedDomainsList(req, res) {
  try {
    const domains = getTrustedDomains();

    return res.status(200).json(new ApiResponse(200, {
        domains,
        count: domains.length,
      }, 'Success'));
  } catch (error) {
    console.error('Get trusted domains error:', error);
    throw new AppError(500, 'Failed to fetch trusted domains');
  }
}

/**
 * POST /api/credentials/extract-preview
 * Extract and preview certificate data without saving
 */
export async function extractCertificatePreview(req, res) {
  try {
    const { imageData, sourceUrl, imageType = 'base64' } = req.body;
    const userId = req.user._id;

    if (!imageData) {
      throw new AppError(400, 'Image data is required');
    }

    // Use new orchestrator for preview (no auto-save)
    const result = await verifyFromExtension({
      userId,
      imageData,
      sourceUrl: sourceUrl || 'https://unknown.com',
      autoSave: false,
      testMode: false,
    });

    // Handle early rejections
    if (!result.success) {
      throw new AppError(400, 'An error occurred');
    }

    return res.status(200).json(new ApiResponse(200, {
        extractedData: result.extractedData,
        nameValidation: result.nameValidation,
        domainValidation: result.domainValidation,
        verification: result.verification,
      }, 'Certificate data extracted successfully'));
  } catch (error) {
    console.error('Extract preview error:', error);
    throw new AppError(500, 'An error occurred');
  }
}
