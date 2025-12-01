import { processCertificateImage, verifyCertificateComplete } from '../verification/verification.service.js';
import { getTrustedDomains } from '../validation/domainValidator.service.js';
import { uploadCredentialFile } from '../../../core/utils/imagekitService.js';

/**
 * POST /api/credentials/verify-certificate
 * Verify certificate from extension
 */
export async function verifyCertificate(req, res) {
  try {
    const { imageData, sourceUrl, imageType = 'base64', fileData, autoSave = true } = req.body;
    const userId = req.user._id;

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

    // Process certificate
    const processedData = await processCertificateImage({
      userId,
      imageData,
      sourceUrl,
      imageType,
    });

    // Auto-save if VERIFIED and autoSave is true
    const shouldAutoSave = autoSave && processedData.verification?.status === 'VERIFIED';

    if (shouldAutoSave || fileData) {
      // Upload image to ImageKit first
      let uploadedFileData = fileData;

      if (!fileData) {
        try {
          console.log('Uploading certificate image to ImageKit...');

          // Convert base64 to buffer
          const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');

          // Upload to ImageKit
          const uploadResult = await uploadCredentialFile(buffer, {
            fileName: `certificate-${Date.now()}.jpg`,
            userName: req.user.name || 'unknown',
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

      const result = await verifyCertificateComplete({
        userId,
        imageData,
        sourceUrl,
        imageType,
        fileData: uploadedFileData,
      });

      return res.status(201).json({
        success: true,
        message: 'Certificate verified and saved successfully',
        data: {
          credential: result.credential,
          processing: result.processingResult,
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
