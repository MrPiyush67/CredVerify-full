/**
 * Name Matching Pipeline
 * Matches extracted certificate name with user's legal name using fuzzy matching
 * 
 * Reuses: nameMatcher.service.js from /validation/
 */

import { findBestNameMatchFromOcr } from '../../services/nameMatcher.service.js';

/**
 * Match extracted name with user's legal name
 * 
 * @param {Object} params
 * @param {string} params.extractedName - Name extracted from certificate by LLM
 * @param {string} params.legalName - User's legal name from database
 * @param {string} params.ocrText - Original OCR text (for fallback matching)
 * @returns {Object} - { match, confidence, reason, extractedName }
 * 
 * @example
 * const result = await matchName({
 *   extractedName: "John M. Smith",
 *   legalName: "John Smith",
 *   ocrText: "..."
 * });
 * // Returns: { match: true, confidence: 95, reason: "Strong match", ... }
 */
export function matchName(params) {
  const { extractedName, legalName, ocrText } = params;

  console.log(`👤 [NAME-MATCHER] Matching names...`);
  console.log(`   Extracted: "${extractedName}"`);
  console.log(`   Legal:     "${legalName}"`);

  // Use OCR-based matching (more robust)
  const matchResult = findBestNameMatchFromOcr(ocrText, legalName);

  console.log(`📊 [NAME-MATCHER] Best match: "${matchResult.bestMatch}" (${matchResult.confidence}%)`);
  console.log(`📊 [NAME-MATCHER] Reason: ${matchResult.reason}`);

  // Determine if this is an acceptable match
  const MIN_CONFIDENCE = 65; // From existing thresholds
  const isMatch = matchResult.confidence >= MIN_CONFIDENCE;

  return {
    match: isMatch,
    confidence: matchResult.confidence,
    reason: matchResult.reason,
    extractedName: matchResult.bestMatch || extractedName,
    candidates: matchResult.candidates || [],
    threshold: MIN_CONFIDENCE,
  };
}

/**
 * Simple direct name comparison (fallback if OCR not available)
 * 
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {Object} - { match, confidence, reason }
 */
export function compareNames(name1, name2) {
  console.log(`👤 [NAME-MATCHER] Direct comparison: "${name1}" vs "${name2}"`);

  if (!name1 || !name2) {
    return {
      match: false,
      confidence: 0,
      reason: 'Missing name for comparison',
    };
  }

  // Normalize names (lowercase, trim)
  const normalized1 = name1.toLowerCase().trim();
  const normalized2 = name2.toLowerCase().trim();

  // Exact match
  if (normalized1 === normalized2) {
    return {
      match: true,
      confidence: 100,
      reason: 'Exact match',
    };
  }

  // Use string-similarity for fuzzy matching
  const stringSimilarity = require('string-similarity');
  const similarity = stringSimilarity.compareTwoStrings(normalized1, normalized2);
  const confidence = Math.round(similarity * 100);

  const MIN_CONFIDENCE = 65;
  const isMatch = confidence >= MIN_CONFIDENCE;

  return {
    match: isMatch,
    confidence,
    reason: isMatch ? `Similar names (${confidence}%)` : `Low similarity (${confidence}%)`,
  };
}
