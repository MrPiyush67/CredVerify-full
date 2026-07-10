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
  const { extractedName, legalName } = params;

  console.log(`\n${'='.repeat(60)}`);
  console.log(`👤 [NAME-MATCHER] Name Matching`);
  console.log(`${'='.repeat(60)}`);
  console.log(`LLM Extracted:  "${extractedName || '❌ NULL - LLM failed to extract'}"`);
  console.log(`User Legal:     "${legalName}"`);
  console.log(`${'='.repeat(60)}`);

  // If LLM failed to extract name, fail the verification
  if (!extractedName || extractedName === 'null' || extractedName === null) {
    console.log(`❌ LLM extraction failed - verification cannot proceed without recipient name`);
    console.log(`${'='.repeat(60)}\n`);

    return {
      match: false,
      confidence: 0,
      reason: 'LLM failed to extract recipient name from certificate',
      extractedName: null,
      candidates: [],
      threshold: 65,
    };
  }

  // Direct string comparison with normalization
  const normalize = (str) => str.toLowerCase().trim().replace(/\s+/g, ' ');
  const normalizedExtracted = normalize(extractedName);
  const normalizedLegal = normalize(legalName);

  let confidence = 0;
  let reason = '';
  let isMatch = false;

  // Exact match
  if (normalizedExtracted === normalizedLegal) {
    confidence = 100;
    reason = 'Exact name match';
    isMatch = true;
  }
  // One name contains the other (e.g., "John Smith" vs "John Michael Smith")
  else if (normalizedExtracted.includes(normalizedLegal) || normalizedLegal.includes(normalizedExtracted)) {
    // Check if only middle name is different
    const extractedWords = normalizedExtracted.split(' ');
    const legalWords = normalizedLegal.split(' ');

    // If one has middle name and other doesn't (3 words vs 2 words)
    if (Math.abs(extractedWords.length - legalWords.length) === 1 &&
      (extractedWords.length === 3 || legalWords.length === 3)) {

      const longer = extractedWords.length > legalWords.length ? extractedWords : legalWords;
      const shorter = extractedWords.length > legalWords.length ? legalWords : extractedWords;

      // Check if first and last names match (middle name is the difference)
      if (longer[0] === shorter[0] && longer[longer.length - 1] === shorter[shorter.length - 1]) {
        confidence = 95;
        reason = 'First and last names match (middle name differs or missing)';
        isMatch = true;
      } else {
        confidence = 90;
        reason = 'Partial name match (one contains the other)';
        isMatch = true;
      }
    } else {
      confidence = 90;
      reason = 'Partial name match (one contains the other)';
      isMatch = true;
    }
  }
  // Split and compare words
  else {
    const extractedWords = normalizedExtracted.split(' ');
    const legalWords = normalizedLegal.split(' ');
    const matchingWords = extractedWords.filter(word => legalWords.includes(word));

    if (matchingWords.length >= 2) {
      // Check if first and last names match (middle name scenario)
      // For 2 or 3-word names where 2 words match
      if (matchingWords.length === 2 &&
        (extractedWords.length === 2 || extractedWords.length === 3) &&
        (legalWords.length === 2 || legalWords.length === 3)) {

        // Check if matching words are first and last positions
        const extractedFirstLast = [extractedWords[0], extractedWords[extractedWords.length - 1]];
        const legalFirstLast = [legalWords[0], legalWords[legalWords.length - 1]];

        // If first and last names match
        if (extractedFirstLast[0] === legalFirstLast[0] &&
          extractedFirstLast[1] === legalFirstLast[1]) {
          confidence = 95;
          reason = 'First and last names match (middle name differs or missing)';
          isMatch = true;
        } else {
          confidence = Math.min(95, (matchingWords.length / Math.max(extractedWords.length, legalWords.length)) * 100);
          reason = `${matchingWords.length} matching words found`;
          isMatch = confidence >= 65;
        }
      } else {
        confidence = Math.min(95, (matchingWords.length / Math.max(extractedWords.length, legalWords.length)) * 100);
        reason = `${matchingWords.length} matching words found`;
        isMatch = confidence >= 65;
      }
    } else if (matchingWords.length === 1) {
      confidence = 40;
      reason = 'Only 1 matching word - likely not the same person';
      isMatch = false;
    } else {
      confidence = 0;
      reason = 'No matching words - names do not match';
      isMatch = false;
    }
  }

  console.log(`\n📊 Match Result:`);
  console.log(`   Match: ${isMatch ? '✅' : '❌'}`);
  console.log(`   Confidence: ${confidence}%`);
  console.log(`   Reason: ${reason}`);
  console.log(`${'='.repeat(60)}\n`);

  return {
    match: isMatch,
    confidence: Math.round(confidence),
    reason,
    extractedName,
    candidates: [],
    threshold: 65,
  };
}
