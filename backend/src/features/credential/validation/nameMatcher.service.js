import stringSimilarity from 'string-similarity';

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
