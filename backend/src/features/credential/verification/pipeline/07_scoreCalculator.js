/**
 * Score Calculation Pipeline
 * Calculates weighted verification score and determines final status
 * 
 * Reuses: verification.service.js scoring logic
 */

// Verification scoring weights (same as existing system)
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
 * Calculate final verification score
 * 
 * @param {Object} params
 * @param {number} params.nameConfidence - Name match confidence (0-100)
 * @param {number} params.domainConfidence - Domain validation confidence (0-100)
 * @param {boolean} params.metadataValid - Whether metadata passes validation
 * @returns {Object} - { finalScore, status, breakdown, recommendations }
 * 
 * @example
 * const result = calculateScore({
 *   nameConfidence: 95,
 *   domainConfidence: 100,
 *   metadataValid: true
 * });
 * // Returns: { finalScore: 96, status: 'VERIFIED', ... }
 */
export function calculateScore(params) {
  const { nameConfidence, domainConfidence, metadataValid } = params;

  console.log(`🧮 [SCORE-CALCULATOR] Calculating verification score...`);
  console.log(`   Name:     ${nameConfidence}% (weight: ${WEIGHTS.NAME * 100}%)`);
  console.log(`   Domain:   ${domainConfidence}% (weight: ${WEIGHTS.DOMAIN * 100}%)`);
  console.log(`   Metadata: ${metadataValid ? '100' : '0'}% (weight: ${WEIGHTS.METADATA * 100}%)`);

  const nameScore = nameConfidence || 0;
  const domainScore = domainConfidence || 0;
  const metadataScore = metadataValid ? 100 : 0;

  // Calculate weighted final score
  const finalScore = Math.round(
    (nameScore * WEIGHTS.NAME) +
    (domainScore * WEIGHTS.DOMAIN) +
    (metadataScore * WEIGHTS.METADATA)
  );

  console.log(`📊 [SCORE-CALCULATOR] Final weighted score: ${finalScore}%`);

  // Determine status
  const statusResult = determineStatus({
    finalScore,
    nameConfidence,
    domainConfidence,
    metadataValid,
  });

  return {
    finalScore,
    status: statusResult.status,
    autoApproved: statusResult.autoApproved,
    requiresReview: statusResult.requiresReview,
    breakdown: {
      name: nameScore,
      domain: domainScore,
      metadata: metadataScore,
      weights: WEIGHTS,
    },
    recommendations: statusResult.recommendations,
    reason: statusResult.reason,
  };
}

/**
 * Determine verification status based on scores
 * 
 * @param {Object} params
 * @returns {Object} - { status, autoApproved, requiresReview, reason, recommendations }
 */
function determineStatus(params) {
  const { finalScore, nameConfidence, domainConfidence, metadataValid } = params;

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

    console.log(`✅ [SCORE-CALCULATOR] Status: VERIFIED (auto-approved)`);

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
    recommendations.push(`⚠️  Moderate confidence - manual review recommended (${finalScore}%)`);
    recommendations.push(`Name match: ${nameConfidence}% (${nameConfidence >= 75 ? 'Good' : 'Fair'})`);
    recommendations.push(`Domain validation: ${domainConfidence}% (${domainConfidence >= 70 ? 'Trusted' : 'Verify issuer'})`);

    if (!metadataValid) {
      recommendations.push('⚠️  Some required metadata fields are missing');
    }

    console.log(`⚠️  [SCORE-CALCULATOR] Status: REVIEW_REQUIRED`);

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

  console.log(`❌ [SCORE-CALCULATOR] Status: REJECTED`);

  return {
    status: 'REJECTED',
    autoApproved: false,
    requiresReview: false,
    reason: 'Low confidence match - identity verification failed',
    recommendations,
  };
}

/**
 * Get threshold values (for reference)
 * 
 * @returns {Object} - Threshold configuration
 */
export function getThresholds() {
  return THRESHOLDS;
}
