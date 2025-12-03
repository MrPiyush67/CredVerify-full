import { extractTextFromBase64, extractTextFromUrl } from './ocr.service.js';
import { extractCertificateMetadata } from './llm.service.js';
import { findBestNameMatchFromOcr } from './nameMatcher.service.js';
import { validateDomainAndGetIssuer } from './domainValidator.service.js';
import Credential from '../credential.model.js';
import User from '../../user/user.model.js';

// Verification scoring weights (ChatGPT recommended)
const WEIGHTS = {
  NAME: 0.60,      // 60% - Most important
  DOMAIN: 0.30,    // 30% - Second priority
  METADATA: 0.10,  // 10% - Supporting validation
};

// Verification thresholds
const THRESHOLDS = {
  VERIFIED: {
    overall: 85,
    name: 85,
    domain: 70,
  },
  REVIEW: {
    overall: 65,
    name: 65,
    domain: 60,
  },
};

/**
 * Calculate weighted final verification score
 * @param {number} nameConfidence - Name match confidence (0-100)
 * @param {number} domainConfidence - Domain validation confidence (0-100)
 * @param {boolean} metadataValid - Whether metadata passes validation
 * @returns {object} - { finalScore, breakdown }
 */
export function calculateFinalVerificationScore(nameConfidence, domainConfidence, metadataValid) {
  const nameScore = nameConfidence || 0;
  const domainScore = domainConfidence || 0;
  const metadataScore = metadataValid ? 100 : 0;

  const finalScore = Math.round(
    (nameScore * WEIGHTS.NAME) +
    (domainScore * WEIGHTS.DOMAIN) +
    (metadataScore * WEIGHTS.METADATA)
  );

  return {
    finalScore,
    breakdown: {
      name: nameScore,
      domain: domainScore,
      metadata: metadataScore,
      weights: WEIGHTS,
    },
  };
}

/**
 * Determine verification status based on weighted scores
 * @param {number} finalScore - Overall weighted score
 * @param {number} nameConfidence - Name match confidence
 * @param {number} domainConfidence - Domain validation confidence
 * @param {boolean} metadataValid - Metadata validation status
 * @returns {object} - { status, autoApproved, requiresReview, reason, recommendations }
 */
export function determineVerificationStatus(finalScore, nameConfidence, domainConfidence, metadataValid) {
  const recommendations = [];

  // Tier 1: Auto-verify (High confidence)
  if (
    finalScore >= THRESHOLDS.VERIFIED.overall &&
    nameConfidence >= THRESHOLDS.VERIFIED.name &&
    domainConfidence >= THRESHOLDS.VERIFIED.domain &&
    metadataValid
  ) {
    recommendations.push(`✅ Certificate verified with high confidence (${finalScore}%)`);
    recommendations.push(`Name match: ${nameConfidence}% (Excellent)`);
    recommendations.push(`Domain validation: ${domainConfidence}% (Trusted)`);

    return {
      status: 'VERIFIED',
      autoApproved: true,
      requiresReview: false,
      reason: 'High confidence match on all parameters',
      recommendations,
    };
  }

  // Tier 2: Manual review required (Moderate confidence)
  if (
    finalScore >= THRESHOLDS.REVIEW.overall &&
    nameConfidence >= THRESHOLDS.REVIEW.name
  ) {
    recommendations.push(`⚠️ Moderate confidence - manual review recommended (${finalScore}%)`);
    recommendations.push(`Name match: ${nameConfidence}% (${nameConfidence >= 75 ? 'Good' : 'Fair'})`);
    recommendations.push(`Domain validation: ${domainConfidence}% (${domainConfidence >= 70 ? 'Trusted' : 'Verify issuer'})`);

    if (!metadataValid) {
      recommendations.push('⚠️ Some required metadata fields are missing');
    }

    return {
      status: 'REVIEW_REQUIRED',
      autoApproved: false,
      requiresReview: true,
      reason: 'Moderate confidence - manual verification recommended',
      recommendations,
    };
  }

  // Tier 3: Auto-reject (Low confidence)
  recommendations.push(`❌ Low confidence match - verification failed (${finalScore}%)`);

  if (nameConfidence < THRESHOLDS.REVIEW.name) {
    recommendations.push(`Name match: ${nameConfidence}% (Too low - expected ≥${THRESHOLDS.REVIEW.name}%)`);
  }
  if (domainConfidence < THRESHOLDS.REVIEW.domain) {
    recommendations.push(`Domain validation: ${domainConfidence}% (Untrusted source)`);
  }
  if (!metadataValid) {
    recommendations.push('❌ Missing required certificate fields');
  }

  return {
    status: 'REJECTED',
    autoApproved: false,
    requiresReview: false,
    reason: 'Low confidence match - identity verification failed',
    recommendations,
  };
}

/**
 * Process certificate image and extract structured data
 * CLEAN ARCHITECTURE (ChatGPT Recommended)
 * Flow: OCR → Name Match → Domain Validation → LLM Metadata → Build Final Data
 * @param {object} params - { userId, imageData, sourceUrl, imageType }
 * @returns {Promise<object>} - Processed certificate data
 */
export async function processCertificateImage(params) {
  const { userId, imageData, sourceUrl, imageType = 'base64', testMode, testUserName } = params;

  try {
    // ========================================
    // Step 1: Get user's legal name from database (or test mode)
    // ========================================
    console.log('Step 1/7: Fetching user legal name...');
    let legalName;

    if (testMode) {
      // Test mode: use provided test name
      legalName = testUserName || 'Test User';
      console.log(`[TEST MODE] Using test name: ${legalName}`);
    } else {
      // Production mode: fetch from database
      const user = await User.findById(userId).select('name');
      if (!user) {
        throw new Error('User not found');
      }
      legalName = user.name;
    }

    // ========================================
    // Step 2: OCR - Extract text from image
    // ========================================
    console.log('Step 2/7: Extracting text via OCR...');
    let ocrText;
    if (imageType === 'base64') {
      ocrText = await extractTextFromBase64(imageData);
    } else if (imageType === 'url') {
      ocrText = await extractTextFromUrl(imageData);
    } else {
      throw new Error('Invalid image type. Use "base64" or "url".');
    }

    if (!ocrText || ocrText.trim().length < 10) {
      throw new Error('OCR failed to extract meaningful text from image');
    }

    // ========================================
    // Step 3: Domain Validation (BEFORE LLM)
    // ========================================
    console.log('Step 3/7: Validating source domain...');
    const domainValidation = validateDomainAndGetIssuer(sourceUrl);

    // Early rejection: Unknown domain
    if (!domainValidation.isTrusted) {
      return {
        success: false,
        error: 'UNTRUSTED_DOMAIN',
        message: domainValidation.reason,
        verification: {
          status: 'REJECTED',
          finalScore: 0,
          autoApproved: false,
          requiresReview: false,
          reason: 'Certificate from untrusted source',
        },
        domainValidation,
      };
    }

    // ========================================
    // Step 4: Name Matching (BEFORE LLM)
    // ========================================
    console.log('Step 4/7: Matching name from OCR with legal name...');
    const nameMatch = findBestNameMatchFromOcr(ocrText, legalName);

    // Early rejection: Name mismatch
    if (nameMatch.confidence < 85) {
      return {
        success: false,
        error: 'NAME_MISMATCH',
        message: 'Name on certificate does not match your profile',
        verification: {
          status: 'REJECTED',
          finalScore: 0,
          autoApproved: false,
          requiresReview: false,
          reason: nameMatch.reason,
        },
        nameValidation: {
          legalName,
          recipientName: nameMatch.bestMatch,
          match: false,
          confidence: nameMatch.confidence,
          reason: nameMatch.reason,
        },
        domainValidation,
      };
    }

    // ========================================
    // Step 5: LLM - Extract metadata ONLY
    // ========================================
    console.log('Step 5/7: Extracting certificate metadata via LLM...');
    const llmMetadata = await extractCertificateMetadata(ocrText);

    // ========================================
    // Step 5.5: DUAL DOMAIN VALIDATION (Certificate URL)
    // ========================================
    console.log('Step 5.5/7: Validating certificate verification URL...');
    let certificateUrlValidation = null;

    if (llmMetadata.certificateUrl) {
      console.log('Certificate URL found:', llmMetadata.certificateUrl);
      certificateUrlValidation = validateDomainAndGetIssuer(llmMetadata.certificateUrl);

      // Early rejection: Certificate URL doesn't match trusted domain
      if (!certificateUrlValidation.isTrusted) {
        console.warn('⚠️ Certificate URL domain is not trusted:', certificateUrlValidation.domain);
        return {
          success: false,
          error: 'CERTIFICATE_URL_MISMATCH',
          message: 'Certificate verification URL is not from a trusted platform',
          verification: {
            status: 'FAILED',
            finalScore: 0,
            autoApproved: false,
            confidence: { name: 0, domain: 0, metadata: 0 },
          },
          nameValidation: {
            legalName: legalName,
          },
          domainValidation: {
            sourceUrl,
            domain: domainValidation.domain,
            isTrusted: domainValidation.isTrusted,
            issuer: domainValidation.issuer,
          },
          certificateUrlValidation: {
            url: llmMetadata.certificateUrl,
            domain: certificateUrlValidation.domain,
            isTrusted: false,
            reason: certificateUrlValidation.reason,
          },
        };
      }

      // Check if certificate URL domain matches pageUrl domain
      if (certificateUrlValidation.domain !== domainValidation.domain) {
        console.warn('⚠️ Domain mismatch - PageUrl:', domainValidation.domain, 'Certificate URL:', certificateUrlValidation.domain);
        // This is a warning but not automatic rejection - could be subdomain variation
      }
    } else {
      console.log('ℹ️ No certificate URL found on certificate image');
    }

    // ========================================
    // Step 6: Build final extracted data
    // ========================================
    console.log('Step 6/7: Building final certificate data...');

    // Use YOUR code's decisions, NOT LLM's
    const extractedData = {
      // Critical fields - from YOUR validation (NOT LLM)
      recipientName: nameMatch.bestMatch,
      issuerName: domainValidation.issuer.name,
      verificationLink: sourceUrl,
      certificateUrl: llmMetadata.certificateUrl || null, // URL found on certificate

      // Non-critical fields - from LLM
      courseTitle: llmMetadata.courseTitle || llmMetadata.certificateName || 'Certificate',  // Support both old and new field names
      duration: llmMetadata.duration,
      learningHours: llmMetadata.learningHours,
      grade: llmMetadata.grade,
      NSQFLevel: llmMetadata.NSQFLevel,
      issueDate: llmMetadata.issueDate,
      completionDate: llmMetadata.completionDate,
      skills: llmMetadata.skills || [],
      description: llmMetadata.description,

      // Certificate ID: can try to extract from OCR (optional)
      certificateId: null, // Can add regex extraction if needed
    };

    // ========================================
    // Step 7: Calculate verification score
    // ========================================
    console.log('Step 7/7: Calculating verification score...');

    const scoreResult = calculateFinalVerificationScore(
      nameMatch.confidence,
      domainValidation.confidence,
      true // metadata is valid (we have required fields)
    );

    const verificationDecision = determineVerificationStatus(
      scoreResult.finalScore,
      nameMatch.confidence,
      domainValidation.confidence,
      true
    );

    console.log(`✅ Verification complete: ${verificationDecision.status} (Score: ${scoreResult.finalScore}%)`);

    // ========================================
    // Step 8: Return final result
    // ========================================
    return {
      success: true,
      extractionMethod: 'clean-architecture',
      ocrText,
      extractedData,

      verification: {
        status: verificationDecision.status,
        finalScore: scoreResult.finalScore,
        autoApproved: verificationDecision.autoApproved,
        requiresReview: verificationDecision.requiresReview,
        reason: verificationDecision.reason,
        confidence: scoreResult.breakdown,
      },

      nameValidation: {
        legalName,
        recipientName: extractedData.recipientName,
        match: true,
        confidence: nameMatch.confidence,
        reason: nameMatch.reason,
        candidates: nameMatch.candidates,
      },

      domainValidation: {
        sourceUrl,
        domain: domainValidation.domain,
        isValid: domainValidation.isValid,
        isTrusted: domainValidation.isTrusted,
        issuer: domainValidation.issuer,
        confidence: domainValidation.confidence,
        reason: domainValidation.reason,
      },

      recommendations: verificationDecision.recommendations,
      warnings: verificationDecision.status === 'REVIEW_REQUIRED'
        ? ['Manual review recommended - moderate confidence']
        : [],
    };
  } catch (error) {
    console.error('Certificate processing error:', error);
    throw error;
  }
}

/**
 * Save processed certificate to database
 * @param {string} userId - User ID
 * @param {object} processedData - Result from processCertificateImage
 * @param {object} fileData - { url, fileName, fileType, storageId }
 * @returns {Promise<object>} - Saved credential
 */
async function saveCertificate(userId, processedData, fileData) {
  const { extractedData, nameValidation, domainValidation, verification } = processedData;

  const credentialData = {
    user: userId,
    legalNameSnapshot: nameValidation.legalName,
    certificateName: extractedData.recipientName,
    nameMatchConfidence: nameValidation.confidence,
    verificationStatus: verification.status,
    finalVerificationScore: verification.finalScore,
    autoApproved: verification.autoApproved,
    title: extractedData.courseTitle || 'Untitled Certificate',
    issuer: extractedData.issuerName || 'Unknown Issuer',
    issueDate: extractedData.issueDate ? new Date(extractedData.issueDate) : new Date(),
    type: 'certificate',
    credentialId: extractedData.certificateId,
    ...(extractedData.NSQFLevel && extractedData.NSQFLevel >= 1 && { nsqfLevel: extractedData.NSQFLevel }),
    ...(extractedData.learningHours && extractedData.learningHours > 0 && { totalHours: extractedData.learningHours }),
    skills: extractedData.skills || [],
    description: extractedData.description,
    file: fileData,
    sourceUrl: domainValidation.sourceUrl,
    sourceDomain: domainValidation.domain,
    isDomainTrusted: domainValidation.isTrusted,
    isIssuerVerified: domainValidation.isValid && domainValidation.isTrusted,
    isPublic: false,
    meta: {
      extractionMethod: processedData.extractionMethod,
      ocrText: processedData.ocrText,
      rawExtractedData: extractedData,
      nameMatch: nameValidation,
      domainValidation: domainValidation,
      processedAt: new Date(),
    },
  };

  return await Credential.create(credentialData);
}

/**
 * Complete certificate verification pipeline
 * @param {object} params - { userId, imageData, sourceUrl, imageType, fileData }
 * @returns {Promise<object>} - Saved credential and processing result
 */
export async function verifyCertificateComplete(params) {
  const { userId, processedData, fileData } = params;

  // Save to database using already processed data
  const credential = await saveCertificate(userId, processedData, fileData);

  return credential;
}
