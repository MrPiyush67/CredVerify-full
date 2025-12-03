/**
 * Domain Validation Pipeline
 * Validates verification URLs against trusted platform whitelist
 * 
 * Reuses: domainValidator.service.js from /validation/
 */

import {
  resolveIssuerFromUrl,
  getTrustedDomains,
} from '../../services/domainValidator.service.js';

/**
 * Validate domain and get issuer information
 * 
 * @param {string} verificationUrl - Certificate verification URL
 * @returns {Object} - { isTrusted, issuer, domain, confidence, reason }
 * 
 * @example
 * const result = await validateDomain('https://coursera.org/verify/ABC123');
 * // Returns: { isTrusted: true, issuer: { id: 'coursera', name: 'Coursera', ... }, confidence: 100 }
 */
export function validateDomain(verificationUrl) {
  console.log(`🔒 [DOMAIN-VALIDATOR] Validating domain: ${verificationUrl}`);

  try {
    const issuer = resolveIssuerFromUrl(verificationUrl);

    if (!issuer) {
      console.warn(`⚠️  [DOMAIN-VALIDATOR] Unknown/untrusted domain`);

      return {
        isTrusted: false,
        issuer: null,
        domain: new URL(verificationUrl).hostname,
        confidence: 0,
        reason: 'Domain not found in trusted platforms list',
      };
    }

    console.log(`✅ [DOMAIN-VALIDATOR] Trusted issuer: ${issuer.name} (${issuer.category})`);

    return {
      isTrusted: true,
      issuer: {
        id: issuer.id,
        name: issuer.name,
        domain: issuer.domain,
        category: issuer.category,
      },
      domain: issuer.domain,
      confidence: 100,
      reason: `Verified trusted issuer: ${issuer.name}`,
    };

  } catch (error) {
    console.error(`❌ [DOMAIN-VALIDATOR] Validation failed:`, error.message);

    return {
      isTrusted: false,
      issuer: null,
      domain: null,
      confidence: 0,
      reason: `Domain validation error: ${error.message}`,
    };
  }
}

/**
 * Get list of all trusted domains (for reference/debugging)
 * 
 * @returns {Array<string>} - Array of trusted domain strings
 */
export function getAllTrustedDomains() {
  return getTrustedDomains();
}
