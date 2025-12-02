import stringSimilarity from 'string-similarity';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// LOAD TRUSTED ISSUERS FROM platforms.json (SINGLE SOURCE OF TRUTH)
// ============================================================================

let TRUSTED_ISSUERS = [];
let TRUSTED_DOMAINS = [];

try {
  const platformsPath = path.join(__dirname, './platforms.json');
  const platformsData = JSON.parse(fs.readFileSync(platformsPath, 'utf8'));

  TRUSTED_ISSUERS = platformsData.platforms.map(platform => ({
    id: platform.id,
    name: platform.name,
    domains: platform.domains,
    category: platform.category,
  }));

  TRUSTED_DOMAINS = TRUSTED_ISSUERS.flatMap(issuer => issuer.domains);

  console.log(`✅ Loaded ${TRUSTED_ISSUERS.length} trusted issuers from platforms.json`);
} catch (error) {
  console.error('❌ Failed to load platforms.json:', error.message);
  throw new Error('Failed to initialize domain validator: ' + error.message);
}

// ============================================================================
// DOMAIN VALIDATION FUNCTIONS
// ============================================================================

/**
 * Resolve issuer from URL (SINGLE SOURCE OF TRUTH from platforms.json)
 * This is what your verification flow should use (NOT LLM extraction)
 * @param {string} pageUrl - Certificate page URL
 * @returns {object|null} - Issuer object or null
 */
export function resolveIssuerFromUrl(pageUrl) {
  if (!pageUrl) return null;

  try {
    const urlObj = new URL(pageUrl);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = urlObj.pathname.toLowerCase();
    const fullPath = hostname + pathname;

    // Find matching issuer
    for (const issuer of TRUSTED_ISSUERS) {
      for (const domain of issuer.domains) {
        // Check if domain contains path (e.g., "linkedin.com/learning")
        if (domain.includes('/')) {
          // Path-based matching - must match domain AND path
          const normalizedDomain = domain.toLowerCase();

          if (fullPath.startsWith(normalizedDomain) ||
            fullPath === normalizedDomain ||
            fullPath.startsWith(normalizedDomain + '/')) {
            return {
              id: issuer.id,
              name: issuer.name,
              domain: domain,
              category: issuer.category,
              isTrusted: true,
              requiresPath: true,
            };
          }
        } else {
          // Hostname-only matching (traditional)
          if (hostname === domain || hostname.endsWith(`.${domain}`)) {
            return {
              id: issuer.id,
              name: issuer.name,
              domain: domain,
              category: issuer.category,
              isTrusted: true,
              requiresPath: false,
            };
          }
        }
      }
    }

    return null; // Not a trusted issuer
  } catch (error) {
    console.error('Error parsing URL:', error);
    return null;
  }
}

/**
 * Get all trusted issuers (for frontend/extension)
 * @returns {array} - Array of issuer objects
 */
export function getTrustedIssuers() {
  return TRUSTED_ISSUERS.map(issuer => ({
    id: issuer.id,
    name: issuer.name,
    domains: issuer.domains,
  }));
}

// ============================================================================
// LEGACY FUNCTIONS (Keep for backward compatibility, but use new ones above)
// ============================================================================

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

// ============================================================================
// NEW VALIDATION FUNCTION (Use this in verification flow)
// ============================================================================

/**
 * Validate domain and get issuer info (ChatGPT recommended approach)
 * This combines domain validation + issuer resolution in one call
 * @param {string} pageUrl - Certificate page URL
 * @returns {object} - { isValid, isTrusted, issuer, confidence, reason }
 */
export function validateDomainAndGetIssuer(pageUrl) {
  // Auto-fix: Add https:// if protocol is missing (LLM often extracts URLs without protocol)
  let normalizedUrl = pageUrl;
  if (pageUrl && !pageUrl.match(/^https?:\/\//i)) {
    normalizedUrl = `https://${pageUrl}`;
    console.log(`⚠️  URL missing protocol, auto-fixed: ${pageUrl} -> ${normalizedUrl}`);
  }

  const issuer = resolveIssuerFromUrl(normalizedUrl);

  if (issuer) {
    return {
      isValid: true,
      isTrusted: true,
      issuer: {
        id: issuer.id,
        name: issuer.name,
        domain: issuer.domain,
      },
      domain: issuer.domain,
      confidence: 100, // Whitelisted = 100% confidence
      reason: `Trusted issuer: ${issuer.name}`,
    };
  }

  // Not in whitelist
  const domain = extractDomain(normalizedUrl);
  return {
    isValid: false,
    isTrusted: false,
    issuer: null,
    domain: domain,
    confidence: 0,
    reason: domain
      ? `Domain "${domain}" is not in trusted whitelist`
      : 'Invalid or missing URL',
  };
}
