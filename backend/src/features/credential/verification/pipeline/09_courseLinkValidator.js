/**
 * Stage 9: Course Link Validator
 * Validates course URL format (optional, non-blocking)
 *
 * @param {string} courseUrl - Course URL provided by user
 * @returns {Object} - Validation result
 */
export function validateCourseLink(courseUrl) {
  console.log(`🔗 [STAGE 9: COURSE-LINK-VALIDATOR] Validating course URL...`);

  // Course URL is optional - if not provided, don't block verification
  if (!courseUrl || courseUrl.trim() === '') {
    console.log(`⚠️  [STAGE 9] No course URL provided (optional - proceeding without course analysis)`);
    return {
      isValid: false,
      isRequired: false,
      reason: 'Course URL not provided (optional)',
      shouldProceed: true, // Don't block verification
    };
  }

  // Validate URL format
  try {
    const url = new URL(courseUrl);

    console.log(`✅ [STAGE 9] Valid course URL detected`);
    console.log(`   Domain: ${url.hostname}`);
    console.log(`   Protocol: ${url.protocol}`);

    return {
      isValid: true,
      url: courseUrl,
      domain: url.hostname,
      protocol: url.protocol,
      shouldProceed: true,
    };
  } catch (error) {
    console.warn(`⚠️  [STAGE 9] Invalid URL format: ${error.message}`);
    console.warn(`   Course URL: ${courseUrl}`);

    return {
      isValid: false,
      reason: `Invalid URL format: ${error.message}`,
      shouldProceed: true, // Still proceed with certificate verification
      warning: 'Course link is invalid but verification will continue',
    };
  }
}

/**
 * Detect platform from course URL
 * @param {string} courseUrl - Course URL
 * @returns {string|null} - Platform name or null
 */
export function detectPlatform(courseUrl) {
  if (!courseUrl) return null;

  try {
    const url = new URL(courseUrl);
    const hostname = url.hostname.toLowerCase();

    // Platform detection mapping
    const platformMap = {
      'udemy.com': 'udemy',
      'www.udemy.com': 'udemy',
      'ude.my': 'udemy',
      'coursera.org': 'coursera',
      'www.coursera.org': 'coursera',
      'skillindiadigital.gov.in': 'skill_india',
      'nptel.ac.in': 'nptel',
      'swayam.gov.in': 'swayam',
      'edx.org': 'edx',
      'www.edx.org': 'edx',
    };

    // Check exact match
    if (platformMap[hostname]) {
      return platformMap[hostname];
    }

    // Check if hostname contains platform name
    for (const [domain, platform] of Object.entries(platformMap)) {
      if (hostname.includes(domain.replace('www.', ''))) {
        return platform;
      }
    }

    return null;
  } catch (error) {
    return null;
  }
}
