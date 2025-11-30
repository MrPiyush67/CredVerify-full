import stringSimilarity from 'string-similarity';
import { isWhitelistedDomain, extractDomain, COMPANY_DOMAIN_MAP } from '../config/whitelistedDomains.js';

/**
 * Validate if the domain matches the company name from certificate
 */
export const validateDomainCompanyMatch = (pageUrl, companyName) => {
  try {
    const domain = extractDomain(pageUrl);
    if (!domain) {
      return {
        isValid: false,
        score: 0,
        message: 'Invalid URL',
      };
    }

    // Check if domain is whitelisted
    const isWhitelisted = isWhitelistedDomain(pageUrl);
    if (!isWhitelisted) {
      return {
        isValid: false,
        score: 0,
        message: `Domain ${domain} is not in the whitelist of trusted certificate providers`,
        isWhitelisted: false,
      };
    }

    // Normalize company name for comparison
    const normalizedCompany = companyName.toLowerCase().trim();

    // Extract company keywords (remove common words)
    const companyWords = normalizedCompany.split(/\s+/).filter(word =>
      word.length > 2 && !['the', 'and', 'for', 'with'].includes(word)
    );

    // Check if any company word appears in the full domain (handles blog.coursera.org, etc.)
    const domainLower = domain.toLowerCase();
    const directMatch = companyWords.some(word => domainLower.includes(word));

    if (directMatch) {
      return {
        isValid: true,
        score: 1.0,
        message: 'Company name found in domain',
        isWhitelisted: true,
      };
    }

    // Check direct mapping
    const mappedDomains = COMPANY_DOMAIN_MAP[normalizedCompany];
    if (mappedDomains && mappedDomains.some(d => domain.includes(d) || d.includes(domain))) {
      return {
        isValid: true,
        score: 1.0,
        message: 'Exact company-domain match found',
        isWhitelisted: true,
      };
    }

    // Fuzzy matching - check if company name is similar to domain
    const domainWithoutTld = domain.split('.')[0]; // Get 'coursera' from 'coursera.org'
    const similarity = stringSimilarity.compareTwoStrings(
      normalizedCompany,
      domainWithoutTld
    );

    // Also check if company name contains domain or vice versa
    const containsMatch =
      normalizedCompany.includes(domainWithoutTld) ||
      domainWithoutTld.includes(normalizedCompany);

    // Check if any word in the company name matches the domain
    // e.g., "My First Coursera Course" contains word "coursera"
    // Use the companyWords already defined above
    const wordMatch = companyWords.some(word =>
      word === domainWithoutTld || stringSimilarity.compareTwoStrings(word, domainWithoutTld) > 0.8
    );

    const finalScore = Math.max(similarity, containsMatch ? 0.8 : 0, wordMatch ? 0.75 : 0);

    console.log('\n🔍 Domain Matching Debug:');
    console.log('  Company Name:', normalizedCompany);
    console.log('  Domain:', domainWithoutTld);
    console.log('  Company Words:', companyWords);
    console.log('  Similarity Score:', similarity);
    console.log('  Contains Match:', containsMatch);
    console.log('  Word Match:', wordMatch);
    console.log('  Final Score:', finalScore);
    console.log('');

    // Threshold for considering a match
    const SIMILARITY_THRESHOLD = 0.6;

    return {
      isValid: finalScore >= SIMILARITY_THRESHOLD,
      score: finalScore,
      message: finalScore >= SIMILARITY_THRESHOLD
        ? `Company name matches domain (${Math.round(finalScore * 100)}% similarity)`
        : `Company name does not match domain (${Math.round(finalScore * 100)}% similarity)`,
      isWhitelisted: true,
      domain,
      companyName: normalizedCompany,
    };
  } catch (error) {
    return {
      isValid: false,
      score: 0,
      message: `Domain validation error: ${error.message}`,
    };
  }
};

/**
 * Comprehensive certificate verification
 */
export const verifyCertificate = (pageUrl, extractedData) => {
  const errors = [];
  let isVerified = true;

  // Check if domain is whitelisted
  if (!isWhitelistedDomain(pageUrl)) {
    errors.push('Domain is not in the whitelist of trusted providers');
    isVerified = false;
  }

  // Validate company-domain match
  const domainValidation = validateDomainCompanyMatch(pageUrl, extractedData.companyName);
  if (!domainValidation.isValid) {
    errors.push(domainValidation.message);
    isVerified = false;
  }

  // Check for required fields
  if (!extractedData.personName) {
    errors.push('Person name is missing from certificate');
    isVerified = false;
  }

  if (!extractedData.companyName) {
    errors.push('Company name is missing from certificate');
    isVerified = false;
  }

  return {
    isVerified,
    errors,
    domainValidation,
  };
};
