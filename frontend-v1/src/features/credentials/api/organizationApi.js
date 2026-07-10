import axiosClient from '@services/axiosClient';
import logger from '@utils/logger.js';

/**
 * Get list of companies for dropdown
 * @returns {Promise} - API response with companies array
 */
export const getCompanies = async () => {
  try {
    logger.debug('Fetching organization companies');

    const response = await axiosClient.get('/certificates/organization/companies');

    logger.debug('Companies fetched successfully', {
      count: response.data?.data?.companies?.length || 0
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to fetch companies:', error);
    logger.error('Failed to fetch companies', {
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
    throw error;
  }
};

/**
 * Verify certificate with organization database
 * @param {Object} verificationData - Verification data
 * @param {string} verificationData.companyName - Selected company name
 * @param {string} verificationData.certificateImageBase64 - Base64 encoded certificate image
 * @param {string} verificationData.courseUrl - Optional course URL
 * @param {string} verificationData.fileName - File name
 * @param {string} verificationData.fileType - File type
 * @param {number} verificationData.fileSize - File size
 * @returns {Promise} - API response with verification result
 */
export const verifyWithOrganization = async (verificationData) => {
  try {
    logger.debug('Verifying certificate with organization', {
      companyName: verificationData.companyName,
      fileName: verificationData.fileName,
      hasCourseUrl: !!verificationData.courseUrl
    });

    const response = await axiosClient.post('/certificates/organization/verify', verificationData);

    logger.debug('Certificate verification completed', {
      success: response.data?.success,
      verified: response.data?.data?.verified,
      credentialId: response.data?.data?.credential?._id
    });

    return response.data;
  } catch (error) {
    console.error('❌ Failed to verify certificate:', error);
    console.error('Error details:', error.response?.data);
    logger.error('Failed to verify certificate', {
      error: error.response?.data?.message || error.message,
      details: error.response?.data
    });
    throw error;
  }
};

/**
 * Get organization statistics
 * @param {string} companyName - Company name
 * @returns {Promise} - API response with stats
 */
export const getCompanyStats = async (companyName) => {
  try {
    logger.debug('Fetching company stats', { companyName });

    const response = await axiosClient.get('/certificates/organization/stats', {
      params: { companyName }
    });

    logger.debug('Company stats fetched successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch company stats', {
      companyName,
      error: error.message
    });
    throw error;
  }
};

// Export all functions as default
const organizationApi = {
  getCompanies,
  verifyWithOrganization,
  getCompanyStats,
};

export default organizationApi;
