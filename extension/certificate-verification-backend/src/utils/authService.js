import axios from 'axios';

const MAIN_BACKEND_URL = process.env.MAIN_BACKEND_URL || 'http://127.0.0.1:5000';

/**
 * Verify JWT token with main backend
 * @param {string} token - JWT token to verify
 * @returns {Promise<Object>} - User profile data
 */
export const verifyToken = async (token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    console.log('Verifying token with main backend...');

    const response = await axios.get(`${MAIN_BACKEND_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 seconds timeout
    });

    if (response.data.success) {
      console.log('Token verified successfully:', {
        userId: response.data.data.user._id,
        name: response.data.data.user.name,
        email: response.data.data.user.email,
        role: response.data.data.user.role,
      });

      return {
        isValid: true,
        user: response.data.data.user,
      };
    }

    throw new Error('Invalid token response');
  } catch (error) {
    console.error('Token verification error:', error.message);

    if (error.response?.status === 401) {
      return {
        isValid: false,
        error: 'Unauthorized - Invalid or expired token',
      };
    }

    return {
      isValid: false,
      error: error.message || 'Token verification failed',
    };
  }
};

/**
 * Get user profile from main backend
 * @param {string} token - JWT token
 * @returns {Promise<Object>} - User profile data
 */
export const getUserProfile = async (token) => {
  try {
    const response = await axios.get(`${MAIN_BACKEND_URL}/api/users/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data.user;
  } catch (error) {
    console.error('Get user profile error:', error.message);
    throw new Error('Failed to fetch user profile');
  }
};

/**
 * Save verified credential to main backend
 * @param {string} token - JWT token
 * @param {Object} credentialData - Credential data to save
 * @returns {Promise<Object>} - Saved credential
 */
export const saveCredentialToMainBackend = async (token, credentialData) => {
  try {
    console.log('Saving credential to main backend...');
    console.log('🔗 URL:', `${MAIN_BACKEND_URL}/api/credentials/from-extension`);
    console.log('🔑 Token:', token.substring(0, 20) + '...');
    console.log('📦 Payload being sent:', JSON.stringify(credentialData, null, 2));

    const response = await axios.post(
      `${MAIN_BACKEND_URL}/api/credentials/from-extension`,
      credentialData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('📡 Response status:', response.status);
    console.log('📡 Response data:', JSON.stringify(response.data, null, 2));

    if (response.data.success) {
      console.log('Credential saved successfully:', response.data.data.credential._id);
      return response.data.data.credential;
    }

    throw new Error('Failed to save credential');
  } catch (error) {
    console.error('❌ Save credential error:', error.message);
    if (error.response) {
      console.error('❌ Response status:', error.response.status);
      console.error('❌ Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error(`Failed to save credential: ${error.response?.data?.message || error.message}`);
  }
};

/**
 * Match extracted person name with authenticated user
 * @param {string} extractedName - Name extracted from certificate
 * @param {Object} user - Authenticated user object
 * @returns {Object} - Match result with confidence score
 */
export const matchUserWithExtractedData = (extractedName, user) => {
  if (!extractedName || !user || !user.name) {
    return {
      isMatch: false,
      confidence: 0,
      reason: 'Missing name data',
    };
  }

  // Normalize names for comparison
  const normalizedExtracted = extractedName.toLowerCase().trim();
  const normalizedUser = user.name.toLowerCase().trim();

  // Exact match
  if (normalizedExtracted === normalizedUser) {
    return {
      isMatch: true,
      confidence: 100,
      reason: 'Exact name match',
    };
  }

  // Check if extracted name contains user name or vice versa
  if (normalizedExtracted.includes(normalizedUser) || normalizedUser.includes(normalizedExtracted)) {
    return {
      isMatch: true,
      confidence: 90,
      reason: 'Partial name match',
    };
  }

  // Split names and check for matching parts
  const extractedParts = normalizedExtracted.split(/\s+/);
  const userParts = normalizedUser.split(/\s+/);

  // Check if first and last names match
  if (extractedParts.length >= 2 && userParts.length >= 2) {
    const firstNameMatch = extractedParts[0] === userParts[0];
    const lastNameMatch = extractedParts[extractedParts.length - 1] === userParts[userParts.length - 1];

    if (firstNameMatch && lastNameMatch) {
      return {
        isMatch: true,
        confidence: 95,
        reason: 'First and last name match',
      };
    }

    if (firstNameMatch || lastNameMatch) {
      return {
        isMatch: false,
        confidence: 50,
        reason: 'Only partial name component match',
      };
    }
  }

  return {
    isMatch: false,
    confidence: 0,
    reason: 'No name match found',
  };
};

export default {
  verifyToken,
  getUserProfile,
  saveCredentialToMainBackend,
  matchUserWithExtractedData,
};
