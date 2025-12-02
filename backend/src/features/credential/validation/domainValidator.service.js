import stringSimilarity from 'string-similarity';

// ============================================================================
// TRUSTED ISSUERS - Clean Architecture (ChatGPT Recommended)
// ============================================================================
// This is the SINGLE SOURCE OF TRUTH for certificate issuers
// Domain validation uses this to determine issuer name (NOT LLM)
// ============================================================================

const TRUSTED_ISSUERS = [
  // Education Platforms
  {
    id: 'coursera',
    name: 'Coursera',
    aliases: ['Coursera', 'Coursera Inc', 'Coursera Inc.'],
    domains: ['coursera.org', 'coursera.com'],
  },
  {
    id: 'udemy',
    name: 'Udemy',
    aliases: ['Udemy', 'Udemy Inc', 'Udemy, Inc.'],
    domains: ['udemy.com'],
  },
  {
    id: 'edx',
    name: 'edX',
    aliases: ['edX', 'edX Inc', 'edX LLC'],
    domains: ['edx.org'],
  },
  {
    id: 'udacity',
    name: 'Udacity',
    aliases: ['Udacity', 'Udacity Inc'],
    domains: ['udacity.com'],
  },
  {
    id: 'linkedin-learning',
    name: 'LinkedIn Learning',
    aliases: ['LinkedIn Learning', 'LinkedIn', 'Lynda.com'],
    domains: ['linkedin.com', 'lynda.com'],
  },
  {
    id: 'skillshare',
    name: 'Skillshare',
    aliases: ['Skillshare', 'Skillshare Inc'],
    domains: ['skillshare.com'],
  },
  {
    id: 'pluralsight',
    name: 'Pluralsight',
    aliases: ['Pluralsight', 'Pluralsight LLC'],
    domains: ['pluralsight.com'],
  },
  {
    id: 'datacamp',
    name: 'DataCamp',
    aliases: ['DataCamp', 'DataCamp Inc'],
    domains: ['datacamp.com'],
  },
  {
    id: 'codecademy',
    name: 'Codecademy',
    aliases: ['Codecademy', 'Codecademy LLC'],
    domains: ['codecademy.com'],
  },

  // Tech Companies
  {
    id: 'google',
    name: 'Google',
    aliases: ['Google', 'Google LLC', 'Google Cloud', 'Google Developers'],
    domains: ['google.com', 'developers.google.com', 'cloud.google.com', 'grow.google'],
  },
  {
    id: 'microsoft',
    name: 'Microsoft',
    aliases: ['Microsoft', 'Microsoft Corporation', 'Microsoft Learn'],
    domains: ['microsoft.com', 'learn.microsoft.com'],
  },
  {
    id: 'amazon',
    name: 'Amazon Web Services',
    aliases: ['AWS', 'Amazon Web Services', 'Amazon'],
    domains: ['aws.amazon.com', 'amazon.com'],
  },
  {
    id: 'ibm',
    name: 'IBM',
    aliases: ['IBM', 'International Business Machines'],
    domains: ['ibm.com', 'skillsbuild.org'],
  },
  {
    id: 'oracle',
    name: 'Oracle',
    aliases: ['Oracle', 'Oracle Corporation'],
    domains: ['oracle.com', 'education.oracle.com'],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    aliases: ['Salesforce', 'Salesforce.com'],
    domains: ['salesforce.com', 'trailhead.salesforce.com'],
  },
  {
    id: 'cisco',
    name: 'Cisco',
    aliases: ['Cisco', 'Cisco Systems', 'Cisco Networking Academy'],
    domains: ['cisco.com', 'netacad.com'],
  },

  // Indian Platforms
  {
    id: 'nptel',
    name: 'NPTEL',
    aliases: ['NPTEL', 'National Programme on Technology Enhanced Learning'],
    domains: ['nptel.ac.in', 'onlinecourses.nptel.ac.in'],
  },
  {
    id: 'swayam',
    name: 'SWAYAM',
    aliases: ['SWAYAM', 'Study Webs of Active Learning for Young Aspiring Minds'],
    domains: ['swayam.gov.in', 'onlinecourses.swayam2.ac.in'],
  },
  {
    id: 'internshala',
    name: 'Internshala',
    aliases: ['Internshala', 'Internshala Trainings'],
    domains: ['internshala.com', 'trainings.internshala.com'],
  },
  {
    id: 'unstop',
    name: 'Unstop',
    aliases: ['Unstop', 'Dare2Compete', 'D2C'],
    domains: ['unstop.com', 'dare2compete.com'],
  },
  {
    id: 'codealpha',
    name: 'CodeAlpha',
    aliases: ['CodeAlpha', 'Code Alpha'],
    domains: ['codealpha.tech'],
  },
  {
    id: 'skillsforall',
    name: 'Cisco Skills For All',
    aliases: ['Skills For All', 'Cisco Skills For All', 'SkillsForAll'],
    domains: ['skillsforall.com'],
  },
  {
    id: 'naukri',
    name: 'Naukri Learning',
    aliases: ['Naukri', 'Naukri Learning', 'Naukri.com'],
    domains: ['naukri.com', 'naukrilearning.com'],
  },

  // AI/ML Platforms
  {
    id: 'deeplearning-ai',
    name: 'DeepLearning.AI',
    aliases: ['DeepLearning.AI', 'deeplearning.ai', 'Deep Learning AI'],
    domains: ['deeplearning.ai'],
  },
  {
    id: 'kaggle',
    name: 'Kaggle',
    aliases: ['Kaggle', 'Kaggle Inc'],
    domains: ['kaggle.com'],
  },

  // Coding Platforms
  {
    id: 'hackerrank',
    name: 'HackerRank',
    aliases: ['HackerRank', 'Hacker Rank'],
    domains: ['hackerrank.com'],
  },
  {
    id: 'leetcode',
    name: 'LeetCode',
    aliases: ['LeetCode', 'Leet Code'],
    domains: ['leetcode.com'],
  },
];

// Legacy TRUSTED_DOMAINS array (kept for backward compatibility)
const TRUSTED_DOMAINS = TRUSTED_ISSUERS.flatMap(issuer => issuer.domains);

// ============================================================================
// NEW CLEAN ARCHITECTURE FUNCTIONS
// ============================================================================

/**
 * Resolve issuer from URL (ChatGPT recommended - SINGLE SOURCE OF TRUTH)
 * This is what your verification flow should use (NOT LLM extraction)
 * @param {string} pageUrl - Certificate page URL
 * @returns {object|null} - Issuer object or null
 */
export function resolveIssuerFromUrl(pageUrl) {
  if (!pageUrl) return null;

  try {
    const urlObj = new URL(pageUrl);
    const hostname = urlObj.hostname.toLowerCase().replace(/^www\./, '');

    // Find matching issuer
    for (const issuer of TRUSTED_ISSUERS) {
      for (const domain of issuer.domains) {
        if (hostname === domain || hostname.endsWith(`.${domain}`)) {
          return {
            id: issuer.id,
            name: issuer.name,
            domain: domain,
            aliases: issuer.aliases,
            isTrusted: true,
          };
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
  const issuer = resolveIssuerFromUrl(pageUrl);

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
  const domain = extractDomain(pageUrl);
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
