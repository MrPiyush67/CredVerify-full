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
      return res.status(401).json({
        success: false,
        message: 'Authentication required (or use testMode: true)',
      });
    }

    // Validate required fields
    if (!imageData) {
      return res.status(400).json({
        success: false,
        message: 'Image data is required',
      });
    }

    if (!sourceUrl) {
      return res.status(400).json({
        success: false,
        message: 'Source URL is required',
      });
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
      return res.status(400).json({
        success: false,
        message: result.message || 'Certificate verification failed',
        error: result.error,
        data: {
          verificationUrl: result.verificationUrl,
          domainValidation: result.domainValidation,
        },
      });
    }

    // Success - return complete verification result
    const statusCode = result.verification.status === 'VERIFIED' ? 201 :
      result.verification.status === 'REVIEW_REQUIRED' ? 200 : 400;

    return res.status(statusCode).json({
      success: true,
      message: `Certificate ${result.verification.status.toLowerCase()} - ${result.verification.reason}`,
      data: {
        credential: result.credential,
        verification: result.verification,
        extractedData: result.extractedData,
        nameValidation: result.nameValidation,
        domainValidation: result.domainValidation,
        courseAnalysis: result.courseAnalysis, // Include course analysis if available
      },
    });

  } catch (error) {
    console.error('❌ [EXTENSION-VERIFY-CONTROLLER] Verification failed:', error);

    return res.status(500).json({
      success: false,
      message: 'Certificate verification failed',
      error: error.message,
    });
  }
}

/**
 * GET /api/credentials/trusted-domains
 * Get list of trusted certificate domains
 */
export async function getTrustedDomainsList(req, res) {
  try {
    const domains = getTrustedDomains();

    return res.status(200).json({
      success: true,
      data: {
        domains,
        count: domains.length,
      },
    });
  } catch (error) {
    console.error('Get trusted domains error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch trusted domains',
    });
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
      return res.status(400).json({
        success: false,
        message: 'Image data is required',
      });
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
      return res.status(400).json({
        success: false,
        message: result.message,
        data: {
          domainValidation: result.domainValidation,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Certificate data extracted successfully',
      data: {
        extractedData: result.extractedData,
        nameValidation: result.nameValidation,
        domainValidation: result.domainValidation,
        verification: result.verification,
      },
    });
  } catch (error) {
    console.error('Extract preview error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to extract certificate data',
    });
  }
}
