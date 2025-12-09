import crypto from 'crypto';
import { extractTextFromImage } from './ocr.service.js';
import { extractCertificateMetadata, categorizeCourse } from './llm.service.js';
import { matchOrganizationCertificate } from './organizationMatching.service.js';
import { uploadToIpfs } from '../../../core/utils/ipfsService.js';
import { registerOnChain } from '../../../core/utils/blockchainService.js';
import Credential from '../credential.model.js';
import OrganizationCertificate from '../models/organizationCertificate.model.js';

/**
 * Calculate similarity score between two names using Levenshtein distance
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} Similarity score (0-100)
 */
const calculateNameSimilarity = (name1, name2) => {
  const normalize = (name) => {
    if (!name || typeof name !== 'string') return '';
    return name.toLowerCase().trim().replace(/\s+/g, ' ').replace(/[^\w\s]/g, '');
  };

  const normalized1 = normalize(name1);
  const normalized2 = normalize(name2);

  if (normalized1 === normalized2) return 100;

  const matrix = [];
  const len1 = normalized1.length;
  const len2 = normalized2.length;

  if (len1 === 0 || len2 === 0) return 0;

  for (let i = 0; i <= len1; i++) matrix[i] = [i];
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
};

/**
 * Main orchestrator for organization certificate verification
 * Coordinates OCR → LLM → Matching → Name Verification → Blockchain/IPFS → Save workflow
 *
 * @param {String} userId - MongoDB ObjectId of the user
 * @param {Object} certificateData - Certificate data object
 * @param {String} certificateData.certificateImageBase64 - Base64 encoded certificate image
 * @param {String} certificateData.fileName - Original filename
 * @param {String} certificateData.fileType - MIME type
 * @param {String} certificateData.courseUrl - Optional course URL
 * @param {String} companyName - Company name to match against
 * @param {String} userName - Logged-in user's name for verification
 * @returns {Object} Verification result with credential data
 */
export const verifyOrganizationCertificate = async (userId, certificateData, companyName, userName) => {
  const startTime = Date.now();
  let credential = null;

  try {
    console.log(`[OrgVerification] Starting verification for user ${userId} (${userName}) against ${companyName}`);

    // Step 1: Convert base64 to buffer
    console.log('[OrgVerification] Step 1: Converting base64 to buffer');
    let base64Data = certificateData.certificateImageBase64;

    // Strip data URL prefix if present
    if (base64Data.includes('base64,')) {
      base64Data = base64Data.split('base64,')[1];
    }

    const imageBuffer = Buffer.from(base64Data, 'base64');
    console.log(`[OrgVerification] Image buffer size: ${imageBuffer.length} bytes`);

    // Step 2: Quick initial OCR to extract basic identifiers for database lookup
    console.log('[OrgVerification] Step 2: Quick OCR extraction for database lookup');
    const ocrText = await extractTextFromImage(imageBuffer);

    if (!ocrText || ocrText.trim().length === 0) {
      throw new Error('OCR failed to extract any text from certificate image');
    }

    console.log(`[OrgVerification] OCR extracted ${ocrText.length} characters`);

    // Step 3: Extract minimal metadata for matching (certificateId, recipientName)
    console.log('[OrgVerification] Step 3: Extracting basic identifiers via LLM');
    const basicMetadata = await extractCertificateMetadata(ocrText);

    console.log('[OrgVerification] Basic metadata extracted:', {
      recipientName: basicMetadata.recipientName,
      certificateId: basicMetadata.certificateId,
      companyName: basicMetadata.companyName
    });

    // Step 3.5: Verify certificate recipient name matches logged-in user
    console.log('[OrgVerification] Step 3.5: Verifying recipient name matches user');
    const recipientName = basicMetadata.recipientName;

    if (!recipientName) {
      throw new Error('Could not extract recipient name from certificate. Please ensure the certificate has a clear recipient name.');
    }

    const nameSimilarity = calculateNameSimilarity(recipientName, userName);
    console.log('[OrgVerification] Name comparison:', {
      certificateRecipient: recipientName,
      loggedInUser: userName,
      similarityScore: nameSimilarity
    });

    // Require at least 70% name match (allows for minor spelling differences)
    if (nameSimilarity < 70) {
      throw new Error(
        `Certificate recipient name "${recipientName}" does not match your account name "${userName}". ` +
        `You can only upload certificates that belong to you. (Match score: ${nameSimilarity}%)`
      );
    }

    if (nameSimilarity < 85) {
      console.warn('[OrgVerification] ⚠️ Name match below 85%, but acceptable:', {
        similarity: nameSimilarity,
        certificateRecipient: recipientName,
        loggedInUser: userName
      });
    } else {
      console.log('[OrgVerification] ✅ Name verification passed:', nameSimilarity + '%');
    }

    // Step 4: Try to find matching certificate in organization database FIRST
    console.log('[OrgVerification] Step 4: Checking organization database for existing certificate');
    const matchResult = await matchOrganizationCertificate(basicMetadata, companyName);

    console.log('[OrgVerification] Match result:', {
      isMatch: matchResult.isMatch,
      matchScore: matchResult.matchScore,
      matchedCertificateId: matchResult.matchedCertificate?._id,
      hasDbData: !!matchResult.matchedCertificate
    });

    // Step 5: Build final metadata - use database data where available, extract missing fields
    let finalMetadata = { ...basicMetadata };
    let categoryData = null;

    if (matchResult.isMatch && matchResult.matchedCertificate) {
      // We found a match in database! Use that data instead of re-extracting
      console.log('[OrgVerification] ✅ Certificate found in database, using stored data');
      const dbCert = matchResult.matchedCertificate;

      // Use database values (already extracted and verified)
      finalMetadata = {
        recipientName: dbCert.recipientName || basicMetadata.recipientName,
        certificateId: dbCert.certificateId || basicMetadata.certificateId,
        companyName: dbCert.companyName || basicMetadata.companyName,
        courseTitle: dbCert.courseTitle || basicMetadata.courseTitle,
        issueDate: dbCert.issueDate || basicMetadata.issueDate,
        learningHours: dbCert.learningHours || basicMetadata.learningHours,
        nsqfLevel: dbCert.nsqfLevel || basicMetadata.nsqfLevel,
        skills: dbCert.skills || basicMetadata.skills || [],
        description: dbCert.description || basicMetadata.description,
        duration: dbCert.duration || basicMetadata.duration
      };

      // Run category calculation using database data
      try {
        const courseData = {
          title: finalMetadata.courseTitle || 'Unknown Course',
          description: finalMetadata.description || '',
          what_you_will_learn: finalMetadata.skills || [],
          skill_level: null,
          instructor: finalMetadata.companyName || companyName
        };

        categoryData = await categorizeCourse(courseData);
        console.log('[OrgVerification] Category calculated from DB data:', categoryData.category);
      } catch (error) {
        console.warn('[OrgVerification] Category calculation failed:', error.message);
        categoryData = {
          category: 'Education Training & Research',
          confidence: 0.3,
          reasoning: 'Category calculation failed; defaulted'
        };
      }

      console.log('[OrgVerification] Final metadata from database:', finalMetadata);

    } else {
      // No match found or low confidence - use the extracted metadata from LLM
      console.log('[OrgVerification] ⚠️  No database match, using freshly extracted metadata');
      finalMetadata = basicMetadata;

      // Calculate category from extracted data
      try {
        const courseData = {
          title: finalMetadata.courseTitle || 'Unknown Course',
          description: finalMetadata.description || '',
          what_you_will_learn: finalMetadata.skills || [],
          skill_level: null,
          instructor: finalMetadata.companyName || companyName
        };

        categoryData = await categorizeCourse(courseData);
        console.log('[OrgVerification] Category calculated:', categoryData.category);
      } catch (error) {
        console.warn('[OrgVerification] Category calculation failed:', error.message);
        categoryData = {
          category: 'Education Training & Research',
          confidence: 0.3,
          reasoning: 'Category calculation failed; defaulted'
        };
      }
    }

    // Step 5.5: Validate microcredential duration
    console.log('[OrgVerification] Step 5.5: Validating microcredential duration');
    const learningHours = finalMetadata.learningHours;

    if (learningHours !== null && learningHours !== undefined) {
      if (learningHours < 7.5 || learningHours > 30) {
        console.error(`[OrgVerification] ❌ Duration validation failed: ${learningHours} hours`);
        throw new Error(
          `This certificate does not qualify as a microcredential. ` +
          `Microcredentials must have a duration between 7.5 and 30 hours. ` +
          `This certificate has ${learningHours} hours.`
        );
      }
      console.log(`[OrgVerification] ✅ Duration validation passed: ${learningHours} hours`);
    } else {
      console.warn('[OrgVerification] ⚠️ No learning hours extracted - skipping duration validation');
    }

    // Step 6: Determine verification status based on match score
    let verificationStatus;
    let autoApproved = false;
    let isOrganizationVerified = false;

    if (matchResult.matchScore >= 85) {
      verificationStatus = 'VERIFIED';
      autoApproved = true;
      isOrganizationVerified = true;
      console.log('[OrgVerification] High-confidence match: AUTO-VERIFIED');
    } else if (matchResult.matchScore >= 60) {
      verificationStatus = 'REVIEW_REQUIRED';
      autoApproved = false;
      isOrganizationVerified = false;
      console.log('[OrgVerification] Medium-confidence match: REVIEW_REQUIRED');
    } else {
      verificationStatus = 'PENDING';
      autoApproved = false;
      isOrganizationVerified = false;
      console.log('[OrgVerification] Low-confidence match: PENDING manual review');
    }

    // Step 6: Process matched certificates (score >= 60%)
    let ipfsResult = null;
    let blockchainTxHash = null;
    let fingerprint = null;

    if (matchResult.isMatch && matchResult.matchScore >= 60) {
      try {
        // Step 6a: Generate fingerprint first for duplicate check
        fingerprint = '0x' + crypto
          .createHash('sha256')
          .update(finalMetadata.certificateId || `${userId}-${Date.now()}`)
          .digest('hex');

        // Step 6b: Check for duplicate certificate
        console.log('[OrgVerification] Step 6b: Checking for duplicate certificate');
        const existingCredential = await Credential.findOne({
          certificateFingerprint: fingerprint
        });

        if (existingCredential) {
          console.log(`[OrgVerification] ❌ Duplicate certificate detected: ${fingerprint}`);
          throw new Error(
            `This certificate has already been uploaded and verified. ` +
            `Certificate ID: ${finalMetadata.certificateId}. ` +
            `You cannot upload the same certificate multiple times.`
          );
        }

        console.log('[OrgVerification] ✅ No duplicate found, proceeding with verification');

        // Step 6c: Upload to IPFS
        console.log('[OrgVerification] Step 6c: Uploading to IPFS');
        ipfsResult = await uploadToIpfs(imageBuffer, certificateData.fileName || 'certificate.jpg');
        console.log(`[OrgVerification] IPFS upload successful: ${ipfsResult.cid}`);

        // Step 6d: Register on blockchain
        console.log('[OrgVerification] Step 6d: Registering on blockchain');
        const blockchainResult = await registerOnChain(fingerprint, ipfsResult.cid);
        blockchainTxHash = blockchainResult.txHash;
        console.log(`[OrgVerification] Blockchain registration successful: ${blockchainTxHash}`);

        // Step 6e: Increment verification count on matched certificate
        if (matchResult.matchedCertificate && autoApproved) {
          const orgCert = await OrganizationCertificate.findById(matchResult.matchedCertificate._id);
          if (orgCert) {
            await orgCert.incrementVerificationCount();
            console.log('[OrgVerification] Incremented verification count on matched certificate');
          }
        }

      } catch (error) {
        // Non-critical errors: log but continue
        console.error('[OrgVerification] Warning: IPFS/Blockchain step failed:', error.message);
        // Continue with credential creation even if IPFS/blockchain fails
      }
    }

    // Step 7: Create Credential document
    console.log('[OrgVerification] Step 7: Creating Credential document');

    const credentialData = {
      user: userId,
      legalNameSnapshot: userName, // User's name from account
      certificateName: finalMetadata.recipientName || 'Certificate Holder', // Name from certificate
      nameMatchConfidence: nameSimilarity, // Store name match score
      title: finalMetadata.courseTitle || 'Course Certificate',
      issuer: finalMetadata.companyName || companyName || 'Unknown Issuer',
      issueDate: finalMetadata.issueDate || new Date(),
      verificationMethod: 'organization',
      verificationStatus,
      autoApproved,
      isOrganizationVerified,
      organizationName: matchResult.matchedCertificate?.companyName || companyName,
      organizationVerifiedAt: autoApproved ? new Date() : null,
      credentialCategory: categoryData?.category || null, // NCrF sector category
      organizationVerification: {
        companyId: matchResult.matchedCertificate?._id || null,
        matchedCertificateId: matchResult.matchedCertificate?._id?.toString() || null,
        matchScore: matchResult.matchScore,
        matchedFields: {
          nameMatch: matchResult.matchDetails?.nameMatch || false,
          certificateIdMatch: matchResult.matchDetails?.certificateIdMatch || false,
          companyMatch: matchResult.matchDetails?.companyMatch || false
        }
      },
      file: {
        url: null, // Will be populated after upload to storage service
        fileName: certificateData.fileName || 'certificate',
        fileType: certificateData.fileType || 'image/jpeg',
        uploadedAt: new Date()
      }
    };

    // Add blockchain/IPFS data if available
    if (ipfsResult) {
      credentialData.file.ipfs = {
        cid: ipfsResult.cid,
        provider: ipfsResult.provider || 'pinata'
      };
    }
    if (blockchainTxHash) {
      credentialData.file.blockchain = {
        txHash: blockchainTxHash
      };
    }
    if (fingerprint) {
      credentialData.certificateFingerprint = fingerprint;
    }

    // Add optional fields
    if (certificateData.courseUrl) {
      credentialData.courseUrl = certificateData.courseUrl;
    }
    if (finalMetadata.certificateId) {
      credentialData.credentialId = finalMetadata.certificateId;
    }
    if (finalMetadata.learningHours) {
      credentialData.totalHours = finalMetadata.learningHours;
    }
    if (finalMetadata.nsqfLevel) {
      credentialData.nsqfLevel = finalMetadata.nsqfLevel;
    }

    // Add category metadata for debugging
    if (categoryData) {
      credentialData.meta = {
        categoryConfidence: categoryData.confidence,
        categoryReasoning: categoryData.reasoning,
        categorizedAt: new Date()
      };
    }

    credential = await Credential.create(credentialData);
    console.log(`[OrgVerification] Credential created: ${credential._id}`);

    // Step 8: Return result
    const duration = Date.now() - startTime;
    console.log(`[OrgVerification] Verification completed in ${duration}ms`);

    return {
      verified: matchResult.isMatch,
      autoApproved,
      matchScore: matchResult.matchScore,
      credential,
      processingTime: duration
    };

  } catch (error) {
    console.error('[OrgVerification] Fatal error during verification:', error);

    // Rollback: If credential was created but error occurred, we keep it as PENDING
    // This ensures user data isn't lost

    throw new Error(`Verification failed: ${error.message}`);
  }
};

/**
 * Helper function to validate certificate data
 */
export const validateCertificateData = (certificateData, companyName) => {
  const errors = [];

  if (!companyName || typeof companyName !== 'string' || companyName.trim().length === 0) {
    errors.push('Company name is required');
  }

  if (!certificateData.certificateImageBase64) {
    errors.push('Certificate image is required');
  }

  if (certificateData.certificateImageBase64) {
    // Check if it's valid base64
    const base64Pattern = /^data:image\/(png|jpg|jpeg|gif|webp);base64,|^[A-Za-z0-9+/]+=*$/;
    if (!base64Pattern.test(certificateData.certificateImageBase64)) {
      errors.push('Invalid certificate image format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
