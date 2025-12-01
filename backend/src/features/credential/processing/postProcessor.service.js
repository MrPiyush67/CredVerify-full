/**
 * Post-process extracted certificate data
 * @param {object} data - Raw extracted data
 * @returns {object} - Cleaned data
 */
export function postProcessCertificateData(data) {
  const cleaned = { ...data };

  // Clean person name - remove phrases like "for participating", "has completed", etc.
  if (cleaned.personName) {
    cleaned.personName = cleaned.personName
      .replace(/\b(for|by|to|has|have|successfully|completed?|participating?|awarded?|presented?|this|certifies?|that)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Only keep if it looks like a valid name (at least 2 words, mostly letters)
    if (!/^[A-Za-z]+(?:\s+[A-Za-z]+)+$/.test(cleaned.personName)) {
      cleaned.personName = null;
    }
  }

  // Validate and clean certificate ID
  if (cleaned.certificateId) {
    const id = cleaned.certificateId.trim();
    // Nullify if too short or contains no digits
    if (id.length < 4 || !/\d/.test(id)) {
      cleaned.certificateId = null;
    }
  }

  // Normalize dates to ISO format
  cleaned.issueDate = normalizeDate(cleaned.issueDate);
  cleaned.completionDate = normalizeDate(cleaned.completionDate);

  // Normalize skills into array
  if (cleaned.skills) {
    if (typeof cleaned.skills === 'string') {
      // Split by common delimiters
      cleaned.skills = cleaned.skills
        .split(/[,;|]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
    } else if (!Array.isArray(cleaned.skills)) {
      cleaned.skills = [];
    }
    // Remove duplicates and clean
    cleaned.skills = [...new Set(cleaned.skills.map((s) => s.trim()))].filter((s) => s.length > 0);
  } else {
    cleaned.skills = [];
  }

  // Clean description
  if (cleaned.description) {
    cleaned.description = cleaned.description.trim();
    if (cleaned.description.length === 0) {
      cleaned.description = null;
    }
  }

  // Ensure numeric fields
  if (cleaned.NSQFLevel !== null && cleaned.NSQFLevel !== undefined) {
    const level = parseInt(cleaned.NSQFLevel, 10);
    cleaned.NSQFLevel = isNaN(level) || level < 1 || level > 10 ? null : level;
  }

  if (cleaned.learningHours !== null && cleaned.learningHours !== undefined) {
    const hours = parseFloat(cleaned.learningHours);
    cleaned.learningHours = isNaN(hours) || hours < 0 ? null : hours;
  }

  return cleaned;
}

/**
 * Normalize date to ISO format (YYYY-MM-DD)
 * @param {string|null} dateStr - Date string
 * @returns {string|null} - ISO date or null
 */
function normalizeDate(dateStr) {
  if (!dateStr) return null;

  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    // Return ISO date (YYYY-MM-DD)
    return date.toISOString().split('T')[0];
  } catch {
    return null;
  }
}

/**
 * Validate extracted data has minimum required fields
 * @param {object} data - Extracted data
 * @returns {object} - { isValid: boolean, missingFields: string[] }
 */
export function validateExtractedData(data) {
  // Only personName is absolutely required
  // certificateName and issuerName are highly recommended but not blocking
  const criticalFields = ['personName'];
  const missingCritical = criticalFields.filter((field) => !data[field]);

  // Check if we have at least personName + one of (certificateName OR issuerName)
  const hasMinimumInfo =
    data.personName &&
    (data.certificateName || data.issuerName);

  return {
    isValid: missingCritical.length === 0 && hasMinimumInfo,
    missingFields: missingCritical,
    warnings: [
      !data.certificateName ? 'certificateName missing' : null,
      !data.issuerName ? 'issuerName missing' : null,
    ].filter(Boolean),
  };
}
