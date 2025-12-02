import { processCertificateImage, verifyCertificateComplete } from '../verification/verification.service.js';
import { getTrustedDomains } from '../validation/domainValidator.service.js';
import { uploadCredentialFile } from '../../../core/utils/imagekitService.js';

// Request deduplication map (prevent duplicate uploads within 5 seconds)
const recentRequests = new Map();

/**
 * POST /api/credentials/verify-certificate
 * Verify certificate from extension
 */
export async function verifyCertificate(req, res) {
  try {
    const { imageData, sourceUrl, imageType = 'base64', fileData, autoSave = true, testMode, testUserName } = req.body;

    // Support test mode (no auth required)
    const userId = testMode ? 'test-user-id' : req.user?._id;

    if (!testMode && !req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required (or use testMode: true)',
      });
    }

    // Deduplicate requests (prevent double-click or loop issues)
    const requestKey = `${userId}-${imageData.substring(0, 50)}`;
    const now = Date.now();
    const lastRequest = recentRequests.get(requestKey);

    if (lastRequest && (now - lastRequest) < 5000) {
      console.log('⚠️ Duplicate request detected within 5 seconds - ignoring');
      return res.status(429).json({
        success: false,
        message: 'Duplicate request detected. Please wait before retrying.',
      });
    }

    recentRequests.set(requestKey, now);

    // Cleanup old entries (older than 10 seconds)
    for (const [key, timestamp] of recentRequests.entries()) {
      if (now - timestamp > 10000) {
        recentRequests.delete(key);
      }
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

    console.log('🔵 [VERIFY] Starting verification for user:', userId);
    console.log('🔵 [VERIFY] Source URL:', sourceUrl);
    console.log('🔵 [VERIFY] Image data length:', imageData.length);

    // Process certificate
    const processedData = await processCertificateImage({
      userId,
      imageData,
      sourceUrl,
      imageType,
      testMode,
      testUserName, // Simulate user's legal name for name matching in test mode
    });

    // Handle early rejections (domain/name validation failures)
    if (!processedData.success) {
      return res.status(400).json({
        success: false,
        message: processedData.message || 'Certificate verification failed',
        error: processedData.error,
        data: {
          verification: processedData.verification,
          nameValidation: processedData.nameValidation,
          domainValidation: processedData.domainValidation,
          certificateUrlValidation: processedData.certificateUrlValidation, // Include certificate URL validation details
          extractedData: processedData.extractedData, // Include extracted data for debugging
        },
      });
    }

    // Auto-save if VERIFIED and autoSave is true
    const shouldAutoSave = autoSave && processedData.verification?.status === 'VERIFIED';

    if (shouldAutoSave || fileData) {
      // Upload image to ImageKit first
      let uploadedFileData = fileData;

      if (!fileData) {
        try {
          console.log('📤 [IMAGEKIT] Uploading certificate image to ImageKit...');

          // Convert base64 to buffer
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to ImageKit
          const uploadResult = await uploadCredentialFile(buffer, {
            fileName: `certificate-${Date.now()}.jpg`,
            userName: req.user?.name || 'unknown',
            issuer: processedData.extractedData?.issuerName || 'unknown',
            tags: ['certificate', 'verified'],
          });

          uploadedFileData = {
            url: uploadResult.url,
            fileName: uploadResult.fileName,
            fileType: uploadResult.fileType,
            storageId: uploadResult.fileId,
            uploadedAt: new Date(),
          };

          console.log('✅ Certificate image uploaded to ImageKit:', uploadResult.url);
        } catch (uploadError) {
          console.error('❌ ImageKit upload failed:', uploadError);
          // Continue with source URL as fallback
          uploadedFileData = {
            url: sourceUrl,
            fileName: `certificate-${Date.now()}.jpg`,
            fileType: 'image/jpeg',
            storageId: `ext-${userId}-${Date.now()}`,
            uploadedAt: new Date(),
          };
        }
      }

      // Save to database directly (don't re-process)
      const credential = await verifyCertificateComplete({
        userId,
        processedData, // Pass already processed data instead of re-processing
        fileData: uploadedFileData,
      });

      return res.status(201).json({
        success: true,
        message: 'Certificate verified and saved successfully',
        data: {
          credential: credential,
          verification: processedData.verification,
          extractedData: processedData.extractedData,
          nameValidation: processedData.nameValidation,
          domainValidation: processedData.domainValidation,
          certificateUrlValidation: processedData.certificateUrlValidation,
          warnings: processedData.warnings,
          saved: true,
        },
      });
    }

    // Otherwise, just return processed data without saving
    return res.status(200).json({
      success: true,
      message: 'Certificate processed successfully',
      data: {
        ...processedData,
        saved: false,
      },
    });
  } catch (error) {
    console.error('Verify certificate error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Certificate verification failed',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined,
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

    const processedData = await processCertificateImage({
      userId,
      imageData,
      sourceUrl: sourceUrl || 'https://unknown.com',
      imageType,
    });

    return res.status(200).json({
      success: true,
      message: 'Certificate data extracted successfully',
      data: {
        extractedData: processedData.extractedData,
        nameValidation: processedData.nameValidation,
        domainValidation: processedData.domainValidation,
        warnings: processedData.warnings,
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
