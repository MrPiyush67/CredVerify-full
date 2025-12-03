/**
 * Credential Saver Pipeline
 * Handles image upload to ImageKit and saves verified credentials to MongoDB
 * 
 * Reuses: imagekitService.js and credential.model.js
 */

import { uploadCredentialFile } from '../../../../core/utils/imagekitService.js';
import Credential from '../../credential.model.js';
import User from '../../../user/user.model.js';

/**
 * Upload certificate image to ImageKit
 * 
 * @param {Buffer} imageBuffer - Certificate image buffer
 * @param {Object} metadata - Additional metadata for the upload
 * @returns {Promise<Object>} - { url, fileId, fileName }
 */
export async function uploadCertificateImage(imageBuffer, metadata = {}) {
  console.log(`📤 [CREDENTIAL-SAVER] Uploading certificate to ImageKit...`);

  try {
    const uploadResult = await uploadCredentialFile(imageBuffer, {
      fileName: metadata.fileName || `certificate-${Date.now()}.jpg`,
      userName: metadata.userName || 'unknown',
      issuer: metadata.issuer || 'unknown',
      tags: metadata.tags || ['certificate', 'verified'],
    });

    console.log(`✅ [CREDENTIAL-SAVER] Image uploaded: ${uploadResult.url}`);

    return {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      fileName: uploadResult.fileName,
      fileType: uploadResult.fileType || 'image/jpeg',
    };

  } catch (error) {
    console.error(`❌ [CREDENTIAL-SAVER] ImageKit upload failed:`, error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }
}

/**
 * Save verified credential to MongoDB
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {Object} params.verificationData - Complete verification result
 * @param {Object} params.certificateImage - Uploaded image data
 * @returns {Promise<Object>} - Saved credential document
 */
export async function saveCredential(params) {
  const { userId, verificationData, certificateImage, user } = params;

  console.log(`💾 [CREDENTIAL-SAVER] Saving credential to database...`);
  console.log(`   User ID: ${userId}`);
  console.log(`   Status: ${verificationData.verification.status}`);

  try {
    // Extract data from verification result
    const {
      verificationUrl,
      domainValidation,
      extractedData,
      nameValidation,
      verification,
    } = verificationData;

    // Get user name for legalNameSnapshot
    const legalName = user?.name || 'Unknown User';

    // Create credential document
    const credentialData = {
      user: userId,

      // REQUIRED: Name fields
      legalNameSnapshot: legalName,
      certificateName: extractedData.recipientName || nameValidation.extractedName || legalName,
      nameMatchConfidence: nameValidation.confidence || 0,

      // REQUIRED: New verification system
      verificationStatus: verification.status,
      finalVerificationScore: verification.finalScore,
      autoApproved: verification.status === 'VERIFIED',

      // REQUIRED: Basic info
      title: extractedData.courseTitle || 'Certificate',
      issuer: domainValidation.issuer?.name || 'Unknown Issuer',
      issueDate: extractedData.issueDate ? new Date(extractedData.issueDate) : new Date(),

      // Optional metadata
      type: 'certificate',
      credentialId: extractedData.certificateId || null,
      duration: extractedData.duration || null,
      totalHours: extractedData.learningHours || null,
      grade: extractedData.grade || null,
      nsqfLevel: extractedData.NSQFLevel || null,
      skills: extractedData.skills || [],
      description: extractedData.description || null,

      // REQUIRED: File info
      file: {
        url: certificateImage.url,
        fileName: certificateImage.fileName,
        fileType: certificateImage.fileType,
        storageId: certificateImage.fileId,
        uploadedAt: new Date(),
      },

      // Source info
      sourceUrl: verificationUrl,
      sourceDomain: domainValidation.domain || null,
      isDomainTrusted: domainValidation.isTrusted,
      isIssuerVerified: domainValidation.isTrusted,

      // Public/Private
      isPublic: false,

      // Metadata storage
      meta: {
        verificationDetails: {
          nameMatch: {
            extractedName: nameValidation.extractedName,
            confidence: nameValidation.confidence,
            reason: nameValidation.reason,
          },
          domainValidation: {
            isTrusted: domainValidation.isTrusted,
            confidence: domainValidation.confidence,
            issuer: domainValidation.issuer,
          },
          scoreBreakdown: verification.breakdown,
          recommendations: verification.recommendations,
        },
        platform: {
          id: domainValidation.issuer?.id || 'unknown',
          name: domainValidation.issuer?.name || 'Unknown',
          category: domainValidation.issuer?.category || 'unknown',
        },
      },

      // Legacy status field
      status: verification.status === 'VERIFIED' ? 'verified' :
        verification.status === 'REVIEW_REQUIRED' ? 'pending' : 'rejected',

      verifiedAt: verification.status === 'VERIFIED' ? new Date() : null,
    };

    const credential = await Credential.create(credentialData);

    console.log(`✅ [CREDENTIAL-SAVER] Credential saved with ID: ${credential._id}`);

    return credential;

  } catch (error) {
    console.error(`❌ [CREDENTIAL-SAVER] Failed to save credential:`, error.message);
    console.error('Full error:', error);
    throw new Error(`Database save failed: ${error.message}`);
  }
}

/**
 * Complete workflow: Upload image + Save credential
 * 
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {Buffer} params.imageBuffer - Certificate image
 * @param {Object} params.verificationData - Verification results
 * @param {Object} params.user - User object (optional)
 * @returns {Promise<Object>} - Saved credential
 */
export async function uploadAndSaveCredential(params) {
  const { userId, imageBuffer, verificationData, user } = params;

  console.log(`🔄 [CREDENTIAL-SAVER] Starting complete save workflow...`);

  // Step 1: Upload image
  const uploadedImage = await uploadCertificateImage(imageBuffer, {
    userName: user?.name || 'User',
    issuer: verificationData.domainValidation?.issuer?.name || 'Unknown',
    tags: [
      'certificate',
      verificationData.verification?.status?.toLowerCase() || 'pending',
      verificationData.domainValidation?.issuer?.id || 'unknown',
    ],
  });

  // Step 2: Save to database
  const credential = await saveCredential({
    userId,
    verificationData,
    certificateImage: uploadedImage,
  });

  console.log(`✅ [CREDENTIAL-SAVER] Complete workflow finished successfully`);

  return credential;
}
