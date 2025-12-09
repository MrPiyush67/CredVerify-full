import { uploadCredentialFile } from '../../../../core/utils/imagekitService.js';
import { uploadToIpfs } from '../../../../core/utils/ipfsService.js';
import { computeFingerprintFromUrl, registerOnChain } from '../../../../core/utils/blockchainService.js';
import Credential from '../../credential.model.js';

/**
 * Check if certificate already exists using fingerprint
 * @param {string} fingerprint - Certificate fingerprint (keccak256 hash of URL)
 * @returns {Promise<Object|null>} - Existing credential or null
 */
export async function checkDuplicateCertificate(fingerprint) {
  if (!fingerprint) return null;

  console.log(`🔍 [DUPLICATE-CHECK] Checking for existing certificate with fingerprint: ${fingerprint}`);

  try {
    const existing = await Credential.findOne({ certificateFingerprint: fingerprint })
      .populate('user', 'name email')
      .lean();

    if (existing) {
      console.log(`⚠️  [DUPLICATE-CHECK] Found existing certificate:`);
      console.log(`   Certificate ID: ${existing._id}`);
      console.log(`   Owner: ${existing.user?.name || 'Unknown'} (${existing.user?.email || 'N/A'})`);
      console.log(`   Title: ${existing.title}`);
      console.log(`   Issuer: ${existing.issuer}`);
      console.log(`   Issue Date: ${existing.issueDate}`);
      console.log(`   Uploaded At: ${existing.createdAt}`);
      return existing;
    }

    console.log(`✅ [DUPLICATE-CHECK] No duplicate found - proceeding with upload`);
    return null;
  } catch (error) {
    console.error(`❌ [DUPLICATE-CHECK] Error checking for duplicates:`, error.message);
    // Don't block the upload if duplicate check fails
    return null;
  }
}


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
      courseAnalysis, // NEW: Course analysis results
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
      nsqfLevel: courseAnalysis?.nsqf?.level || extractedData.NSQFLevel || null, // Prefer course-calculated NSQF
      skills: extractedData.skills || [],
      description: extractedData.description || null,

      // NEW: Course link and NCrF/NSQF data
      courseUrl: courseAnalysis?.courseUrl || null,
      ncrfScore: courseAnalysis?.ncrf?.credits_rounded || null,
      ncrfScoreRaw: courseAnalysis?.ncrf?.credits_raw || null,
      credentialCategory: courseAnalysis?.category || null,

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
      certificateFingerprint: certificateImage.fingerprint || null,
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
        // NEW: Store complete course analysis
        courseAnalysis: courseAnalysis || null,
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

  // Step 0: Check for duplicates BEFORE uploading to IPFS/blockchain
  const pageUrl = verificationData.verificationUrl || verificationData.sourceUrl || '';
  const fingerprint = computeFingerprintFromUrl(pageUrl);

  if (fingerprint) {
    const existingCertificate = await checkDuplicateCertificate(fingerprint);

    if (existingCertificate) {
      const error = new Error('DUPLICATE_CERTIFICATE');
      error.statusCode = 409; // Conflict
      error.data = {
        message: 'This certificate has already been uploaded to the platform',
        existingCertificate: {
          id: existingCertificate._id,
          title: existingCertificate.title,
          issuer: existingCertificate.issuer,
          issueDate: existingCertificate.issueDate,
          uploadedAt: existingCertificate.createdAt,
          owner: {
            name: existingCertificate.user?.name,
            email: existingCertificate.user?.email,
          },
          verificationStatus: existingCertificate.verificationStatus,
          sourceUrl: existingCertificate.sourceUrl,
        },
        fingerprint: fingerprint,
      };
      throw error;
    }
  }

  // Step 1: Upload to IPFS (primary storage)
  console.log(`📤 [CREDENTIAL-SAVER] Uploading certificate to IPFS...`);

  const fileName = `certificate-${Date.now()}.jpg`;
  let ipfsResult = null;
  let chainResult = null;

  try {
    ipfsResult = await uploadToIpfs(imageBuffer, fileName);
    console.log(`✅ [CREDENTIAL-SAVER] IPFS upload successful: ${ipfsResult.cid}`);

    if (ipfsResult && ipfsResult.cid) {

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
    fingerprint: fingerprint || null,
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
