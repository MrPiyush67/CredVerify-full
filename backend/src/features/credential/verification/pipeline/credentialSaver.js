import { uploadCredentialFile } from '../../../../core/utils/imagekitService.js';
import { uploadToIpfs } from '../../../../core/utils/ipfsService.js';
import { computeFingerprintFromUrl, registerOnChain } from '../../../../core/utils/blockchainService.js';
import Credential from '../../credential.model.js';


// DEPRECATED: ImageKit upload - Now using IPFS instead
// export async function uploadCertificateImage(imageBuffer, metadata = {}) {
//   console.log(`📤 [CREDENTIAL-SAVER] Uploading certificate to ImageKit...`);
//
//   try {
//     const uploadResult = await uploadCredentialFile(imageBuffer, {
//       fileName: metadata.fileName || `certificate-${Date.now()}.jpg`,
//       userName: metadata.userName || 'unknown',
//       issuer: metadata.issuer || 'unknown',
//       tags: metadata.tags || ['certificate', 'verified'],
//     });
//
//     console.log(`✅ [CREDENTIAL-SAVER] Image uploaded: ${uploadResult.url}`);
//
//     return {
//       url: uploadResult.url,
//       fileId: uploadResult.fileId,
//       fileName: uploadResult.fileName,
//       fileType: uploadResult.fileType || 'image/jpeg',
//     };
//
//   } catch (error) {
//     console.error(`❌ [CREDENTIAL-SAVER] ImageKit upload failed:`, error.message);
//     throw new Error(`Image upload failed: ${error.message}`);
//   }
// }

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
        ipfs: certificateImage.ipfs || null,
        blockchain: certificateImage.blockchain || null,
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
        blockchain: {
          ipfs: certificateImage.ipfs || null,
          onChainTx: certificateImage.blockchain?.txHash || null,
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

  // Step 1: Upload to IPFS (primary storage)
  console.log(`📤 [CREDENTIAL-SAVER] Uploading certificate to IPFS...`);

  const fileName = `certificate-${Date.now()}.jpg`;
  let ipfsResult = null;
  let chainResult = null;
  let pageUrl = null;

  try {
    ipfsResult = await uploadToIpfs(imageBuffer, fileName);
    console.log(`✅ [CREDENTIAL-SAVER] IPFS upload successful: ${ipfsResult.cid}`);

    if (ipfsResult && ipfsResult.cid) {
      // Compute fingerprint from verification URL
      pageUrl = verificationData.verificationUrl || verificationData.sourceUrl || '';
      const fingerprint = computeFingerprintFromUrl(pageUrl);

      if (fingerprint && pageUrl) {
        console.log(`🔑 [CREDENTIAL-SAVER] Registering on blockchain...`);
        console.log(`   Page URL: ${pageUrl}`);
        console.log(`   Fingerprint: ${fingerprint}`);
        chainResult = await registerOnChain(fingerprint, ipfsResult.cid);
        console.log(`✅ [CREDENTIAL-SAVER] On-chain registration successful: ${chainResult.txHash}`);
      } else {
        console.warn('⚠️  [CREDENTIAL-SAVER] No page URL available for fingerprint generation');
      }
    }
  } catch (err) {
    console.error('❌ [CREDENTIAL-SAVER] IPFS or on-chain registration failed:', err.message || err);
  }

  // Create certificate image object with IPFS data
  const uploadedImage = {
    url: ipfsResult ? `https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}` : '',
    fileName: fileName,
    fileType: 'image/jpeg',
    fileId: ipfsResult?.cid || null,
    ipfs: ipfsResult || null,
    blockchain: chainResult ? { txHash: chainResult.txHash } : null,
    pageUrl: pageUrl || null,
  };

  // Step 2: Save to database
  const credential = await saveCredential({
    userId,
    verificationData,
    certificateImage: uploadedImage,
  });

  console.log(`✅ [CREDENTIAL-SAVER] Complete workflow finished successfully`);

  return credential;
}
