// Whitelisted domains for certificate verification
// These are the official platforms allowed for certificate verification

export const WHITELISTED_DOMAINS = [
  // Online Learning Platforms
  'coursera.org',
  'www.coursera.org',
  'udacity.com',
  'www.udacity.com',
  'edx.org',
  'www.edx.org',
  'udemy.com',
  'www.udemy.com',
  'linkedin.com',
  'www.linkedin.com',
  'learning.linkedin.com',

  // Tech Companies
  'ibm.com',
  'www.ibm.com',
  'google.com',
  'www.google.com',
  'microsoft.com',
  'www.microsoft.com',
  'aws.amazon.com',
  'cloudacademy.com',

  // AI/ML Platforms
  'deeplearning.ai',
  'www.deeplearning.ai',
  'kaggle.com',
  'www.kaggle.com',

  // Other Certification Platforms
  'codealpha.tech',
  'www.codealpha.tech',
  'internshala.com',
  'www.internshala.com',
  'nptel.ac.in',
  'www.nptel.ac.in',
  'skillshare.com',
  'www.skillshare.com',
];

// Company name mappings (for fuzzy matching)
export const COMPANY_DOMAIN_MAP = {
  'coursera': ['coursera.org'],
  'udacity': ['udacity.com'],
  'edx': ['edx.org'],
  'udemy': ['udemy.com'],
  'linkedin': ['linkedin.com', 'learning.linkedin.com'],
  'ibm': ['ibm.com'],
  'google': ['google.com'],
  'microsoft': ['microsoft.com'],
  'amazon': ['aws.amazon.com'],
  'aws': ['aws.amazon.com'],
  'deeplearning.ai': ['deeplearning.ai'],
  'deeplearning': ['deeplearning.ai'],
  'kaggle': ['kaggle.com'],
  'code alpha': ['codealpha.tech'],
  'codealpha': ['codealpha.tech'],
  'internshala': ['internshala.com'],
  'nptel': ['nptel.ac.in'],
  'skillshare': ['skillshare.com'],
};

export const isWhitelistedDomain = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    return WHITELISTED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain)
    );
  } catch (error) {
    return false;
  }
};

export const extractDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch (error) {
    return null;
  }
};
