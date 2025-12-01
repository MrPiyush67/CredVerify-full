import stringSimilarity from 'string-similarity';

// Whitelist of trusted certificate issuers (matches extension backend)
const TRUSTED_DOMAINS = [
  // Education platforms
  'coursera.org',
  'udacity.com',
  'edx.org',
  'udemy.com',
  'linkedin.com',
  'skillshare.com',
  'pluralsight.com',
  'datacamp.com',
  'codecademy.com',

  // Tech companies
  'google.com',
  'microsoft.com',
  'amazon.com',
  'ibm.com',
  'oracle.com',
  'salesforce.com',
  'cisco.com',

  // Indian platforms
  'nptel.ac.in',
  'swayam.gov.in',
  'internshala.com',
  'unstop.com',
  'codealpha.tech',
  'skillsforall.com',
  'naukri.com',

  // Others
  'deeplearning.ai',
  'kaggle.com',
  'hackerrank.com',
  'leetcode.com',
];

/**
 * Extract domain from URL
 * @param {string} url - Full URL
 * @returns {string|null} - Domain or null
 */
export function extractDomain(url) {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    let domain = urlObj.hostname;

    // Remove 'www.' prefix
    domain = domain.replace(/^www\./, '');

    return domain;
  } catch {
    return null;
  }
}

/**
 * Check if domain is in whitelist
 * @param {string} domain - Domain to check
 * @returns {boolean}
 */
export function isDomainWhitelisted(domain) {
  if (!domain) return false;

  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');

  return TRUSTED_DOMAINS.some((trusted) => {
    return (
      normalizedDomain === trusted ||
      normalizedDomain.endsWith(`.${trusted}`)
    );
  });
}

/**
 * Fuzzy match domain with issuer name
 * @param {string} domain - Domain from URL
 * @param {string} issuerName - Issuer name from certificate
 * @returns {object} - { match: boolean, confidence: number }
 */
export function fuzzyMatchDomainWithIssuer(domain, issuerName) {
  if (!domain || !issuerName) {
    return { match: false, confidence: 0 };
  }

  // Extract base domain name (remove TLD)
  const domainParts = domain.split('.');
  const baseDomain = domainParts.length > 1 ? domainParts[0] : domain;

  // Normalize issuer name
  const normalizedIssuer = issuerName
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '');

  const normalizedDomain = baseDomain.toLowerCase();

  // Calculate similarity
  const similarity = stringSimilarity.compareTwoStrings(normalizedDomain, normalizedIssuer);
  const confidence = Math.round(similarity * 100);

  // Check if domain is contained in issuer or vice versa
  const containsMatch =
    normalizedIssuer.includes(normalizedDomain) ||
    normalizedDomain.includes(normalizedIssuer);

  // Updated threshold: 70% (was 60%)
  const match = confidence >= 70 || containsMatch;

  return { match, confidence };
}

/**
 * Validate certificate domain and issuer
 * @param {string} sourceUrl - URL from extension
 * @param {string} issuerName - Issuer name from certificate
 * @returns {object} - Validation result with confidence score
 */
export function validateDomain(sourceUrl, issuerName) {
  const domain = extractDomain(sourceUrl);

  if (!domain) {
    return {
      isValid: false,
      isTrusted: false,
      domain: null,
      confidence: 0,
      reason: 'Invalid or missing source URL',
    };
  }

  const isTrusted = isDomainWhitelisted(domain);
  const fuzzyMatch = fuzzyMatchDomainWithIssuer(domain, issuerName);

  let isValid = false;
  let reason = '';
  let confidence = 0;

  if (isTrusted) {
    isValid = true;
    confidence = 100; // Whitelisted domain = 100% confidence
    reason = 'Domain is whitelisted as trusted issuer';
  } else if (fuzzyMatch.match) {
    isValid = true;
    confidence = fuzzyMatch.confidence; // Use fuzzy match confidence
    reason = `Domain matches issuer name (${fuzzyMatch.confidence}% confidence)`;
  } else {
    isValid = false;
    confidence = fuzzyMatch.confidence; // Still return confidence even if failed
    reason = 'Domain not whitelisted and does not match issuer';
  }

  return {
    isValid,
    isTrusted,
    domain,
    confidence, // Now always returns 0-100 confidence score
    reason,
  };
}

/**
 * Add domain to whitelist (admin function)
 * @param {string} domain - Domain to add
 */
export function addTrustedDomain(domain) {
  const normalizedDomain = domain.toLowerCase().replace(/^www\./, '');
  if (!TRUSTED_DOMAINS.includes(normalizedDomain)) {
    TRUSTED_DOMAINS.push(normalizedDomain);
  }
}

/**
 * Get all trusted domains
 * @returns {string[]}
 */
export function getTrustedDomains() {
  return [...TRUSTED_DOMAINS];
}
