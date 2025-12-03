import stringSimilarity from 'string-similarity';

// ============================================================================
// NEW CLEAN ARCHITECTURE - OCR-based Name Matching (ChatGPT Recommended)
// ============================================================================

/**
 * Find best name match from OCR text (ChatGPT recommended approach)
 * Extracts name candidates from OCR text and finds best match with legal name
 * This should be called BEFORE LLM extraction
 * 
 * @param {string} ocrText - Raw OCR text from certificate
 * @param {string} legalName - User's legal name from database
 * @returns {object} - { bestMatch, confidence, reason, candidates }
 */
export function findBestNameMatchFromOcr(ocrText, legalName) {
  if (!ocrText || !legalName) {
    return {
      bestMatch: null,
      confidence: 0,
      reason: 'Missing input data',
      candidates: [],
    };
  }

  const candidates = new Set();

  // ========================================
  // Step 1: Extract name-like patterns from OCR text
  // ========================================

  const lines = ocrText.split(/\n/);

  console.log('🔍 [NAME MATCHER] Starting candidate extraction...');

  // Pattern 1: Look for capitalized name patterns (2-4 words)
  for (const line of lines) {
    // Match 2-4 capitalized words (typical name pattern)
    const matches = line.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3}\b/g);
    if (matches) {
      matches.forEach((match) => {
        const trimmed = match.trim();
        // Filter out common non-name words
        const excludeWords = ['Certificate', 'Completion', 'Achievement', 'Instructors', 'Instructor', 'Course', 'Date', 'By', 'From', 'Issued', 'Authorized'];
        const hasExcluded = excludeWords.some(word => trimmed.includes(word));
        if (!hasExcluded && trimmed.split(' ').length >= 2) {
          console.log(`  ✓ Pattern 1 (capitalized): "${trimmed}" from line: "${line}"`);
          candidates.add(trimmed);
        }
      });
    }
  }

  // Pattern 2: Names after common certificate phrases
  const nameIndicators = [
    /(?:awarded to|presented to|certifies that|hereby certifies that)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /(?:this is to certify that|is awarded to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})/i,
    /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\s+has\s+(?:successfully\s+)?completed/i,
  ];

  for (const pattern of nameIndicators) {
    const match = ocrText.match(pattern);
    if (match && match[1]) {
      console.log(`  ✓ Pattern 2 (phrase): "${match[1].trim()}" using pattern: ${pattern}`);
      candidates.add(match[1].trim());
    }
  }

  console.log(`🔍 [NAME MATCHER] Total candidates found: ${candidates.size}`);

  // ========================================
  // Step 2: Find best match using fuzzy matching
  // ========================================

  const candidateArray = Array.from(candidates);

  if (candidateArray.length === 0) {
    return {
      bestMatch: null,
      confidence: 0,
      reason: 'No name-like candidates found in certificate',
      candidates: [],
    };
  }

  // Use string-similarity to find best match
  const { bestMatch, ratings } = stringSimilarity.findBestMatch(
    legalName.toLowerCase(),
    candidateArray.map(c => c.toLowerCase())
  );

  // Get the original casing from candidateArray
  const bestMatchIndex = ratings.findIndex(r => r.target === bestMatch.target);
  const bestMatchOriginal = candidateArray[bestMatchIndex];

  let confidence = Math.round(bestMatch.rating * 100);

  // ========================================
  // Step 2.5: CRITICAL SECURITY CHECK
  // Validate that the best match is actually the user's name
  // ========================================

  // Check if bestMatch actually matches the legal name components
  const legalLower = legalName.toLowerCase().trim();
  const matchLower = bestMatchOriginal.toLowerCase().trim();

  // Split into words
  const legalWords = legalLower.split(/\s+/);
  const matchWords = matchLower.split(/\s+/);

  // Security Rule 1: First name MUST match
  if (legalWords.length >= 1 && matchWords.length >= 1) {
    const firstNameMatch = legalWords[0] === matchWords[0];
    if (!firstNameMatch) {
      // First names don't match - this is likely a different person
      console.warn(`⚠️ NAME SECURITY: First name mismatch - Legal: "${legalWords[0]}" vs Match: "${matchWords[0]}"`);
      return {
        bestMatch: bestMatchOriginal,
        confidence: 0, // Force rejection
        reason: `First name mismatch: "${matchWords[0]}" does not match "${legalWords[0]}"`,
        candidates: candidateArray,
        securityReject: true,
      };
    }
  }

  // Security Rule 2: Last name MUST match (if both names have 2+ words)
  if (legalWords.length >= 2 && matchWords.length >= 2) {
    const legalLast = legalWords[legalWords.length - 1];
    const matchLast = matchWords[matchWords.length - 1];
    const lastNameMatch = legalLast === matchLast;

    if (!lastNameMatch) {
      console.warn(`⚠️ NAME SECURITY: Last name mismatch - Legal: "${legalLast}" vs Match: "${matchLast}"`);
      return {
        bestMatch: bestMatchOriginal,
        confidence: 0, // Force rejection
        reason: `Last name mismatch: "${matchLast}" does not match "${legalLast}"`,
        candidates: candidateArray,
        securityReject: true,
      };
    }
  }

  // ========================================
  // Step 3: Determine match quality
  // ========================================

  let reason;
  if (confidence >= 90) {
    reason = 'Very strong name match';
  } else if (confidence >= 80) {
    reason = 'Good name match with minor differences';
  } else if (confidence >= 70) {
    reason = 'Acceptable match, possible middle name variation';
  } else if (confidence >= 60) {
    reason = 'Weak match, possible typo or name variation';
  } else {
    reason = 'Low similarity, likely different person';
  }

  return {
    bestMatch: bestMatchOriginal,
    confidence,
    reason,
    candidates: candidateArray,
  };
}

// ============================================================================
// LEGACY FUNCTIONS (Keep for backward compatibility)
// ============================================================================

/**
 * Compare certificate name with user's legal name
 * @param {string} legalName - User's legal name from database
 * @param {string} certificateName - Name extracted from certificate
 * @returns {object} - { match: boolean, confidence: number, reason: string }
 */
export function compareNames(legalName, certificateName) {
  if (!legalName || !certificateName) {
    return {
      match: false,
      confidence: 0,
      reason: 'Missing name data',
    };
  }

  // Normalize names
  const normalizeName = (name) =>
    name
      .toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedLegal = normalizeName(legalName);
  const normalizedCert = normalizeName(certificateName);

  // Split names into parts
  const legalParts = normalizedLegal.split(' ');
  const certParts = normalizedCert.split(' ');

  // Special handling for Indian names: First and Last name match = 100% confidence
  // This handles cases like "Siddharth Kumar Gupta" vs "Siddharth Gupta"
  if (legalParts.length >= 2 && certParts.length >= 2) {
    const legalFirst = legalParts[0];
    const legalLast = legalParts[legalParts.length - 1];
    const certFirst = certParts[0];
    const certLast = certParts[certParts.length - 1];

    // If first and last names match exactly, give full credit
    if (legalFirst === certFirst && legalLast === certLast) {
      return {
        match: true,
        confidence: 100,
        reason: 'First and last names match exactly (middle name variation allowed)',
        normalizedLegal,
        normalizedCert,
      };
    }
  }

  // For cases where first names don't match, be more strict
  if (legalParts.length >= 2 && certParts.length >= 2) {
    const legalFirst = legalParts[0];
    const certFirst = certParts[0];
    if (legalFirst !== certFirst) {
      // Different first names - very strict matching
      const similarity = stringSimilarity.compareTwoStrings(normalizedLegal, normalizedCert);
      const confidence = Math.round(similarity * 100);

      // If first names don't match, only allow very high similarity (95%+)
      const effectiveConfidence = confidence >= 95 ? confidence : 0;

      return {
        match: effectiveConfidence >= 85,
        confidence: effectiveConfidence,
        reason: effectiveConfidence >= 95 ? 'Very high similarity despite different first names' : 'Different first names',
        normalizedLegal,
        normalizedCert,
      };
    }
  }

  // Calculate similarity for other cases
  const similarity = stringSimilarity.compareTwoStrings(normalizedLegal, normalizedCert);
  const confidence = Math.round(similarity * 100);

  // Determine match based on confidence thresholds (ChatGPT recommended: 85/65)
  let match = false;
  let reason = '';

  if (confidence >= 85) {
    match = true;
    reason = 'Exact or near-exact match';
  } else if (confidence >= 65) {
    match = true;
    reason = 'High similarity match - acceptable variation';
  } else if (confidence >= 50) {
    match = false;
    reason = 'Moderate similarity - possible different person or spelling error';
  } else {
    match = false;
    reason = 'Names do not match';
  }

  // Additional checks for common name variations
  const legalWords = normalizedLegal.split(' ');
  const certWords = normalizedCert.split(' ');

  // Check if all legal name words appear in certificate name
  const allWordsPresent = legalWords.every((word) =>
    certWords.some((certWord) => certWord.includes(word) || word.includes(certWord))
  );

  if (allWordsPresent && confidence < 90) {
    match = true;
    reason = 'All name components present (order variation)';
  }

  // Check for initials vs full name
  if (confidence < 60) {
    const hasInitials = checkInitialsMatch(legalWords, certWords);
    if (hasInitials) {
      match = true;
      reason = 'Initials match full name';
    }
  }

  return {
    match,
    confidence,
    reason,
    normalizedLegal,
    normalizedCert,
  };
}

/**
 * Check if certificate name uses initials that match legal name
 * @param {string[]} legalWords - Legal name words
 * @param {string[]} certWords - Certificate name words
 * @returns {boolean}
 */
function checkInitialsMatch(legalWords, certWords) {
  // Check if cert has initials for legal name
  // Example: "John Michael Smith" vs "J M Smith" or "J. Smith"
  if (certWords.length < legalWords.length) {
    let matchCount = 0;
    for (let i = 0; i < certWords.length; i++) {
      const certWord = certWords[i].replace(/\./g, '');
      if (certWord.length === 1) {
        // It's an initial
        if (legalWords[i] && legalWords[i][0] === certWord) {
          matchCount++;
        }
      } else {
        // Full word - check if it matches
        if (legalWords.includes(certWord)) {
          matchCount++;
        }
      }
    }
    return matchCount >= certWords.length - 1; // Allow one mismatch
  }
  return false;
}

/**
 * Fuzzy match name with multiple variations
 * @param {string} legalName - User's legal name
 * @param {string} certificateName - Certificate name
 * @returns {object} - Match result with confidence
 */
export function fuzzyMatchName(legalName, certificateName) {
  const result = compareNames(legalName, certificateName);

  // Add additional context
  result.legalName = legalName;
  result.certificateName = certificateName;

  return result;
}

/**
 * Validate name match meets minimum threshold
 * @param {object} matchResult - Result from compareNames
 * @param {number} minConfidence - Minimum confidence threshold (default 60)
 * @returns {boolean}
 */
export function isNameMatchValid(matchResult, minConfidence = 60) {
  return matchResult.match && matchResult.confidence >= minConfidence;
}
