import axiosClient from '@services/axiosClient';
import ENDPOINTS from '@services/endpoints';
import logger from '@utils/logger.js';

/**
 * Upload a new credential
 * @param {FormData} credentialData - Credential data including file
 * @returns {Promise} - API response with credential data
 */
export const uploadCredential = async (credentialData) => {
  try {
    logger.debug('Uploading credential', { hasFile: credentialData.has('file') });
    
    const response = await axiosClient.post(ENDPOINTS.CREDENTIALS.CREATE, credentialData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    logger.debug('Credential uploaded successfully', {
      credentialId: response.data?.data?.credential?._id
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to upload credential', { error: error.message });
    throw error;
  }
};

/**
 * Get my credentials
 * @param {Object} filters - Optional filters (status, credentialType, etc.)
 * @returns {Promise} - API response with credentials array
 */
export const getMyCredentials = async (filters = {}) => {
  try {
    logger.debug('Fetching my credentials', { filters });
    
    const response = await axiosClient.get(ENDPOINTS.CREDENTIALS.LIST, { params: filters });

    logger.debug('Credentials fetched successfully', {
      count: response.data?.data?.credentials?.length || 0
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch credentials', { error: error.message });
    throw error;
  }
};

/**
 * Get credential by ID
 * @param {string} credentialId
 * @returns {Promise} - API response with credential data
 */
export const getCredentialById = async (credentialId) => {
  try {
    logger.debug('Fetching credential', { credentialId });
    
    const response = await axiosClient.get(ENDPOINTS.CREDENTIALS.GET(credentialId));

    logger.debug('Credential fetched successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch credential', { credentialId, error: error.message });
    throw error;
  }
};

/**
 * Update credential
 * @param {string} credentialId
 * @param {Object} updates - Updates to apply
 * @returns {Promise} - API response with updated credential
 */
export const updateCredential = async (credentialId, updates) => {
  try {
    logger.debug('Updating credential', { credentialId });
    
    const response = await axiosClient.patch(ENDPOINTS.CREDENTIALS.UPDATE(credentialId), updates);

    logger.debug('Credential updated successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to update credential', { credentialId, error: error.message });
    throw error;
  }
};

/**
 * Delete credential
 * @param {string} credentialId
 * @returns {Promise} - API response
 */
export const deleteCredential = async (credentialId) => {
  try {
    logger.debug('Deleting credential', { credentialId });
    
    const response = await axiosClient.delete(ENDPOINTS.CREDENTIALS.DELETE(credentialId));

    logger.debug('Credential deleted successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to delete credential', { credentialId, error: error.message });
    throw error;
  }
};

/**
 * Request verification for a credential
 * @param {string} credentialId
 * @returns {Promise} - API response
 */
export const requestVerification = async (credentialId) => {
  try {
    logger.debug('Requesting verification', { credentialId });
    
    const response = await axiosClient.post(ENDPOINTS.CREDENTIALS.REQUEST_VERIFICATION(credentialId));

    logger.debug('Verification requested successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to request verification', { credentialId, error: error.message });
    throw error;
  }
};

/**
 * Get verified credentials
 * @returns {Promise} - API response with verified credentials
 */
export const getVerifiedCredentials = async () => {
  try {
    logger.debug('Fetching verified credentials');
    
    const response = await axiosClient.get(ENDPOINTS.CREDENTIALS.VERIFIED);

    logger.debug('Verified credentials fetched successfully', {
      count: response.data?.data?.credentials?.length || 0
    });

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch verified credentials', { error: error.message });
    throw error;
  }
};

/**
 * Get credential stats
 * @returns {Promise} - API response with stats
 */
export const getCredentialStats = async () => {
  try {
    logger.debug('Fetching credential stats');
    
    const response = await axiosClient.get(ENDPOINTS.CREDENTIALS.STATS);

    logger.debug('Credential stats fetched successfully');

    return response.data;
  } catch (error) {
    logger.error('Failed to fetch credential stats', { error: error.message });
    throw error;
  }
};

// Export all functions as default
const credentialAPI = {
  uploadCredential,
  getMyCredentials,
  getCredentialById,
  updateCredential,
  deleteCredential,
  requestVerification,
  getVerifiedCredentials,
  getCredentialStats,
};

export default credentialAPI;
