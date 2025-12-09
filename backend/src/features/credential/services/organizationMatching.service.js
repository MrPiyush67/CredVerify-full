import OrganizationCertificate from '../models/organizationCertificate.model.js';

/**
 * Match Organization Certificate Service
 * Matches user-uploaded certificate against organization database
 */

/**
 * Normalize name for matching
 * @param {string} name - Name to normalize
 * @returns {string} Normalized name
 */
const normalizeName = (name) => {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/[^\w\s]/g, ''); // Remove special characters
};

/**
 * Calculate similarity score between two names using Levenshtein distance
 * @param {string} name1 - First name
 * @param {string} name2 - Second name
 * @returns {number} Similarity score (0-100)
 */
const calculateNameSimilarity = (name1, name2) => {
  const normalized1 = normalizeName(name1);
  const normalized2 = normalizeName(name2);

  if (normalized1 === normalized2) {
    return 100;
  }

  // Levenshtein distance implementation
  const matrix = [];
  const len1 = normalized1.length;
  const len2 = normalized2.length;

  if (len1 === 0) return 0;
  if (len2 === 0) return 0;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,      // deletion
        matrix[i][j - 1] + 1,      // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  const distance = matrix[len1][len2];
  const maxLength = Math.max(len1, len2);
  const similarity = ((maxLength - distance) / maxLength) * 100;

  return Math.round(similarity);
};

/**
 * Match organization certificate against database
 * @param {Object} extractedData - Data extracted from user's certificate via LLM
 * @param {string} companyName - Company name selected by user
 * @returns {Promise<Object>} Match result
 */
export const matchOrganizationCertificate = async (extractedData, companyName) => {
  try {
    const { recipientName, certificateId } = extractedData;

    // Validate input
    if (!recipientName || !companyName) {
      return {
        isMatch: false,
        matchScore: 0,
        reason: 'Missing required data: recipientName or companyName',
        matchedCertificate: null,
        matchDetails: {
          nameMatch: false,
          certificateIdMatch: false,
          companyMatch: false
        }
      };
    }

    // Normalize name for matching
    const normalizedName = normalizeName(recipientName);

    console.log(`[Matching Service] Searching for match:`, {
      certificateId,
      normalizedName,
      companyName
    });

    // Find matching certificate in database
    // Priority: Certificate ID match > Name match
    const match = await OrganizationCertificate.findOne({
      companyName: companyName,
      $or: [
        { certificateId: certificateId },  // Exact ID match (priority)
        { normalizedName: normalizedName, certificateId: { $exists: true } }
      ],
      processingStatus: 'processed'
    });

    if (!match) {
      console.log(`[Matching Service] No match found for ${certificateId} / ${recipientName}`);

      return {
        isMatch: false,
        matchScore: 0,
        reason: 'No matching certificate found in organization database',
        matchedCertificate: null,
        matchDetails: {
          nameMatch: false,
          certificateIdMatch: false,
          companyMatch: false
        }
      };
    }

    // Calculate match scores for each field
    const certificateIdMatch = match.certificateId === certificateId;
    const companyMatch = match.companyName === companyName;

    // Calculate name match with similarity
    let nameMatchScore = 0;
    if (match.normalizedName === normalizedName) {
      nameMatchScore = 100;
    } else {
      // Use fuzzy matching for name
      nameMatchScore = calculateNameSimilarity(match.recipientName, recipientName);
    }

    const nameMatch = nameMatchScore >= 85; // 85% similarity threshold

    // Calculate overall match score
    // Certificate ID: 50%, Name: 40%, Company: 10%
    const matchScore = (
      (certificateIdMatch ? 50 : 0) +
      (nameMatchScore * 0.40) +
      (companyMatch ? 10 : 0)
    );

    const finalMatchScore = Math.round(matchScore);

    console.log(`[Matching Service] Match found with score ${finalMatchScore}:`, {
      certificateId: match.certificateId,
      recipientName: match.recipientName,
      companyName: match.companyName,
      scores: {
        certificateIdMatch,
        nameMatchScore,
        companyMatch
      }
    });

    // Threshold: 60% for match
    const isMatched = finalMatchScore >= 60;

    return {
      isMatch: isMatched,
      matchScore: finalMatchScore,
      matchedCertificate: match,
      matchDetails: {
        nameMatch,
        certificateIdMatch,
        companyMatch
      },
      reason: isMatched
        ? `Certificate matched with ${finalMatchScore}% confidence`
        : `Match score ${finalMatchScore}% is below 60% threshold`
    };

  } catch (error) {
    console.error('[Matching Service] Error:', error);
    throw new Error(`Certificate matching failed: ${error.message}`);
  }
};

/**
 * Get matching statistics for a company
 * @param {string} companyName - Company name
 * @returns {Promise<Object>} Statistics
 */
export const getCompanyStats = async (companyName) => {
  try {
    const stats = await OrganizationCertificate.aggregate([
      {
        $match: {
          companyName: companyName
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          processed: {
            $sum: { $cond: [{ $eq: ['$processingStatus', 'processed'] }, 1, 0] }
          },
          pending: {
            $sum: { $cond: [{ $eq: ['$processingStatus', 'pending'] }, 1, 0] }
          },
          failed: {
            $sum: { $cond: [{ $eq: ['$processingStatus', 'failed'] }, 1, 0] }
          },
          verified: {
            $sum: { $cond: ['$isVerified', 1, 0] }
          },
          totalVerifications: { $sum: '$verificationCount' }
        }
      }
    ]);

    return stats[0] || {
      total: 0,
      processed: 0,
      pending: 0,
      failed: 0,
      verified: 0,
      totalVerifications: 0
    };
  } catch (error) {
    console.error('[Matching Service] Error getting stats:', error);
    throw error;
  }
};

export default {
  matchOrganizationCertificate,
  getCompanyStats,
  normalizeName,
  calculateNameSimilarity
};
