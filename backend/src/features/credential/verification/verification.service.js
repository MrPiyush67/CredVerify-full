import { extractTextFromBase64, extractTextFromUrl } from '../ocr/ocr.service.js';
import { extractCertificateData } from '../llm/llm.service.js';
import { postProcessCertificateData, validateExtractedData } from '../processing/postProcessor.service.js';
import { fuzzyMatchName } from '../validation/nameMatcher.service.js';
import { validateDomain } from '../validation/domainValidator.service.js';
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
 * @param {object} params - { userId, imageData, sourceUrl, imageType }
 * @returns {Promise<object>} - Processed certificate data
 */
export async function processCertificateImage(params) {
  const { userId, imageData, sourceUrl, imageType = 'base64' } = params;

  try {
    // Step 1: Get user's legal name from database
    const user = await User.findById(userId).select('name');
    if (!user) {
      throw new Error('User not found');
    }
    const legalName = user.name;

    // Step 2: OCR - Extract text from image
    console.log('Step 1/6: Extracting text via OCR...');
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

    // Step 3: LLM - Extract structured data
    console.log('Step 2/6: Extracting structured data via LLM...');
    const { data: rawData, method } = await extractCertificateData(ocrText);

    // Step 4: Post-processing
    console.log('Step 3/6: Post-processing extracted data...');
    const cleanedData = postProcessCertificateData(rawData);

    // Step 5: Validate minimum required fields
    console.log('Step 4/6: Validating extracted data...');
    const validation = validateExtractedData(cleanedData);
    if (!validation.isValid) {
      throw new Error(`Missing required fields: ${validation.missingFields.join(', ')}`);
    }

    // Log warnings for missing optional fields
    if (validation.warnings && validation.warnings.length > 0) {
      console.warn('⚠️  Warnings:', validation.warnings.join(', '));
    }

    // Step 6: Name matching
    console.log('Step 5/7: Matching certificate name with user legal name...');
    const nameMatch = fuzzyMatchName(legalName, cleanedData.personName);

    // Step 7: Domain validation
    console.log('Step 6/7: Validating source domain...');
    const domainValidation = validateDomain(sourceUrl, cleanedData.issuerName);

    // Step 8: Calculate weighted final score and determine verification status
    console.log('Step 7/7: Calculating final verification score...');
    const scoreResult = calculateFinalVerificationScore(
      nameMatch.confidence,
      domainValidation.confidence,
      validation.isValid
    );

    const verificationDecision = determineVerificationStatus(
      scoreResult.finalScore,
      nameMatch.confidence,
      domainValidation.confidence,
      validation.isValid
    );

    console.log(`✅ Verification complete: ${verificationDecision.status} (Score: ${scoreResult.finalScore}%)`);

    // Compile final result
    const result = {
      success: true,
      extractionMethod: method,
      ocrText,
      extractedData: cleanedData,

      // Verification decision (NEW)
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
        certificateName: cleanedData.personName,
        match: nameMatch.match,
        confidence: nameMatch.confidence,
        reason: nameMatch.reason,
      },
      domainValidation: {
        sourceUrl,
        domain: domainValidation.domain,
        isValid: domainValidation.isValid,
        isTrusted: domainValidation.isTrusted,
        confidence: domainValidation.confidence,
        reason: domainValidation.reason,
      },

      recommendations: verificationDecision.recommendations,
      warnings: [],
    };

    // Add legacy warnings for backward compatibility
    if (verificationDecision.status === 'REVIEW_REQUIRED') {
      result.warnings.push('Manual review required - moderate confidence score');
    } else if (verificationDecision.status === 'REJECTED') {
      result.warnings.push('Verification failed - confidence score too low');
    }

    return result;
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
export async function saveCertificate(userId, processedData, fileData) {
  try {
    const { extractedData, nameValidation, domainValidation, verification } = processedData;

    const credentialData = {
      user: userId,
      legalNameSnapshot: nameValidation.legalName,
      certificateName: extractedData.personName,
      nameMatchConfidence: nameValidation.confidence,

      // New verification fields
      verificationStatus: verification.status,
      finalVerificationScore: verification.finalScore,
      autoApproved: verification.autoApproved,

      title: extractedData.certificateName || 'Untitled Certificate',
      issuer: extractedData.issuerName || 'Unknown Issuer',
      issueDate: extractedData.issueDate ? new Date(extractedData.issueDate) : new Date(),

      type: 'certificate',
      credentialId: extractedData.certificateId,

      nsqfLevel: extractedData.NSQFLevel,
      totalHours: extractedData.learningHours,

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

    const credential = await Credential.create(credentialData);
    return credential;
  } catch (error) {
    console.error('Error saving certificate:', error);
    throw error;
  }
}

/**
 * Complete certificate verification pipeline
 * @param {object} params - { userId, imageData, sourceUrl, imageType, fileData }
 * @returns {Promise<object>} - Saved credential and processing result
 */
export async function verifyCertificateComplete(params) {
  const { userId, imageData, sourceUrl, imageType, fileData } = params;

  // Process image
  const processedData = await processCertificateImage({
    userId,
    imageData,
    sourceUrl,
    imageType,
  });

  // Save to database
  const credential = await saveCertificate(userId, processedData, fileData);

  return {
    credential,
    processingResult: processedData,
  };
}
