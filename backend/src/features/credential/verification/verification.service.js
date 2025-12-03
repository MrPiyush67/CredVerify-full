import { extractTextFromBase64, extractTextFromUrl } from '../ocr/ocr.service.js';
import { extractCertificateMetadata } from '../llm/llm.service.js';
import { findBestNameMatchFromOcr } from '../validation/nameMatcher.service.js';
import { validateDomainAndGetIssuer } from '../validation/domainValidator.service.js';
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
 * IMPROVED FLOW: OCR → LLM Extraction → Name Validation → Domain Validation
 * @param {object} params - { userId, imageData, sourceUrl, imageType }
 * @returns {Promise<object>} - Processed certificate data
 */
export async function processCertificateImage(params) {
  const { userId, imageData, sourceUrl, imageType = 'base64', testMode, testUserName } = params;

  try {
    // ========================================
    // Step 1: Get user's legal name from database (or test mode)
    // ========================================
    console.log('Step 1/6: Fetching user legal name...');
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
    console.log('Step 2/6: Extracting text via OCR...');
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

    // Debug: Show raw OCR text
    console.log('========== RAW OCR TEXT START ==========');
    console.log(ocrText);
    console.log('========== RAW OCR TEXT END ==========');

    // ========================================
    // Step 3: Domain Validation
    // ========================================
    console.log('Step 3/6: Validating source domain...');
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
    // Step 4: LLM - Extract metadata INCLUDING recipient name
    // ========================================
    console.log('Step 4/6: Extracting certificate metadata via LLM...');
    const llmMetadata = await extractCertificateMetadata(ocrText);

    // Debug LLM metadata
    try {
      console.log('LLM metadata extracted:', JSON.stringify({
        recipientName: llmMetadata.recipientName || null,
        certificateUrl: llmMetadata.certificateUrl || null,
        certificateName: llmMetadata.certificateName || llmMetadata.courseTitle || null,
        issueDate: llmMetadata.issueDate || null,
        completionDate: llmMetadata.completionDate || null,
        grade: llmMetadata.grade || null
      }, null, 2));
    } catch (e) {
      console.log('LLM metadata debug error:', e);
    }

    // ========================================
    // Step 5: Validate LLM-extracted name against legal name
    // ========================================
    console.log('Step 5/6: Validating extracted name against legal name...');

    if (!llmMetadata.recipientName) {
      return {
        success: false,
        error: 'NAME_NOT_FOUND',
        message: 'Could not extract recipient name from certificate',
        verification: {
          status: 'REJECTED',
          finalScore: 0,
          autoApproved: false,
          requiresReview: false,
          reason: 'Recipient name not found on certificate',
        },
        nameValidation: {
          legalName,
          recipientName: null,
          match: false,
          confidence: 0,
          reason: 'LLM could not extract recipient name',
        },
        domainValidation,
      };
    }

    // Validate the LLM-extracted name against legal name
    const extractedNameLower = llmMetadata.recipientName.toLowerCase().trim();
    const legalNameLower = legalName.toLowerCase().trim();

    // Split into words for comparison
    const extractedWords = extractedNameLower.split(/\s+/);
    const legalWords = legalNameLower.split(/\s+/);

    let nameConfidence = 0;
    let nameMatchReason = '';
    let nameMatch = false;

    // Security Rule 1: First name MUST match
    if (extractedWords.length >= 1 && legalWords.length >= 1) {
      const firstNameMatch = extractedWords[0] === legalWords[0];

      if (!firstNameMatch) {
        console.warn(`⚠️ NAME SECURITY: First name mismatch - Legal: "${legalWords[0]}" vs Certificate: "${extractedWords[0]}"`);
        return {
          success: false,
          error: 'NAME_MISMATCH',
          message: 'Name on certificate does not match your profile',
          verification: {
            status: 'REJECTED',
            finalScore: 0,
            autoApproved: false,
            requiresReview: false,
            reason: `First name mismatch: "${extractedWords[0]}" does not match "${legalWords[0]}"`,
          },
          nameValidation: {
            legalName,
            recipientName: llmMetadata.recipientName,
            match: false,
            confidence: 0,
            reason: `First name mismatch: "${extractedWords[0]}" does not match "${legalWords[0]}"`,
          },
          domainValidation,
        };
      }
    }

    // Security Rule 2: Last name MUST match (if both names have 2+ words)
    if (extractedWords.length >= 2 && legalWords.length >= 2) {
      const extractedLast = extractedWords[extractedWords.length - 1];
      const legalLast = legalWords[legalWords.length - 1];
      const lastNameMatch = extractedLast === legalLast;

      if (!lastNameMatch) {
        console.warn(`⚠️ NAME SECURITY: Last name mismatch - Legal: "${legalLast}" vs Certificate: "${extractedLast}"`);
        return {
          success: false,
          error: 'NAME_MISMATCH',
          message: 'Name on certificate does not match your profile',
          verification: {
            status: 'REJECTED',
            finalScore: 0,
            autoApproved: false,
            requiresReview: false,
            reason: `Last name mismatch: "${extractedLast}" does not match "${legalLast}"`,
          },
          nameValidation: {
            legalName,
            recipientName: llmMetadata.recipientName,
            match: false,
            confidence: 0,
            reason: `Last name mismatch: "${extractedLast}" does not match "${legalLast}"`,
          },
          domainValidation,
        };
      }
    }

    // Calculate confidence using string similarity
    const stringSimilarity = (await import('string-similarity')).default;
    const similarity = stringSimilarity.compareTwoStrings(extractedNameLower, legalNameLower);
    nameConfidence = Math.round(similarity * 100);

    if (nameConfidence >= 90) {
      nameMatch = true;
      nameMatchReason = 'Excellent name match';
    } else if (nameConfidence >= 75) {
      nameMatch = true;
      nameMatchReason = 'Good name match (possible middle name variation)';
    } else if (nameConfidence >= 60) {
      nameMatch = true;
      nameMatchReason = 'Acceptable match with variations';
    } else {
      nameMatch = false;
      nameMatchReason = 'Name similarity too low';
    }

    console.log(`✅ Name validation passed: "${llmMetadata.recipientName}" matches "${legalName}" (${nameConfidence}%)`);

    // ========================================
    // Step 5.5: Certificate URL validation
    // ========================================
    // ========================================
    // Step 5.5: Certificate URL validation
    // ========================================
    console.log('Step 5.5/6: Validating certificate verification URL...');
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
            legalName,
            recipientName: llmMetadata.recipientName,
            match: nameMatch,
            confidence: nameConfidence,
            reason: nameMatchReason,
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
      // Debug certificate URL validation details
      try {
        console.log('Certificate URL validation:', JSON.stringify(certificateUrlValidation, null, 2));
      } catch (e) {
        console.log('Certificate URL validation debug error:', e);
      }
    } else {
      console.log('ℹ️ No certificate URL found on certificate image');
    }

    // ========================================
    // Step 6: Build final extracted data and calculate score
    // ========================================
    console.log('Step 6/6: Building final certificate data and calculating score...');

    // Use LLM-extracted data
    const extractedData = {
      // Critical fields - from LLM and validation
      recipientName: llmMetadata.recipientName,
      issuerName: domainValidation.issuer.name,
      verificationLink: sourceUrl,
      certificateUrl: llmMetadata.certificateUrl || null,

      // Non-critical fields - from LLM
      courseTitle: llmMetadata.courseTitle || llmMetadata.certificateName || 'Certificate',
      duration: llmMetadata.duration,
      learningHours: llmMetadata.learningHours,
      grade: llmMetadata.grade,
      NSQFLevel: llmMetadata.NSQFLevel,
      issueDate: llmMetadata.issueDate,
      completionDate: llmMetadata.completionDate,
      skills: llmMetadata.skills || [],
      description: llmMetadata.description,
      certificateId: null,
    };

    // Calculate verification score
    const scoreResult = calculateFinalVerificationScore(
      nameConfidence,
      domainValidation.confidence,
      true // metadata is valid (we have required fields)
    );

    const verificationDecision = determineVerificationStatus(
      scoreResult.finalScore,
      nameConfidence,
      domainValidation.confidence,
      true
    );

    // Debug score breakdown
    try {
      console.log('Score breakdown:', JSON.stringify(scoreResult, null, 2));
      console.log('Domain validation details:', JSON.stringify(domainValidation, null, 2));
    } catch (e) {
      console.log('Score debug error:', e);
    }

    console.log(`✅ Verification complete: ${verificationDecision.status} (Score: ${scoreResult.finalScore}%)`);

    // ========================================
    // Step 7: Return final result
    // ========================================
    return {
      success: true,
      extractionMethod: 'llm-first-validation',
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
        recipientName: llmMetadata.recipientName,
        match: nameMatch,
        confidence: nameConfidence,
        reason: nameMatchReason,
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
