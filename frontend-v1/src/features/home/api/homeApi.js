import axiosClient from '@/shared';
import ENDPOINTS from '@/shared/services/endpoints';
import logger from '@/shared/utils/logger.js';

/**
 * Get dashboard statistics based on user role
 * NOTE: Backend-new doesn't have unified dashboard/stats endpoint
 * Each role has their own stats endpoint that should be called separately
 * @returns {Promise} - API response with comprehensive statistics
 */
export const getDashboardStats = async (role) => {
  try {
    logger.debug(
      'Dashboard stats not available - using role-specific endpoints',
      { role },
    );

    // Backend-new doesn't have /dashboard/stats
    // Return empty stats to avoid 404 errors
    // Components should fetch role-specific stats separately
    return {
      success: true,
      message: 'Use role-specific stats endpoints',
      data: {},
    };
  } catch (error) {
    logger.error('Failed to fetch dashboard stats', {
      role,
      error: error.message,
    });
    return { success: false, data: {} };
  }
};

/**
 * Get users data (learners)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with users data
 */
export const getUsers = async (params = {}) => {
  try {
    logger.debug('Fetching users data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.learners, {
      params,
    });

    logger.debug('Users data fetched successfully', {
      count: response.data?.data?.profiles?.length || 0,
    });

    // Backend returns { success, message, data: { profiles } }
    return response.data?.data?.profiles || [];
  } catch (error) {
    logger.error('Failed to fetch users data', { error: error.message });
    throw error;
  }
};

/**
 * Get admins data (admin only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with admins data
 */
export const getAdmins = async (params = {}) => {
  try {
    logger.debug('Fetching admins data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.regulators, {
      params,
    });

    logger.debug('Admins data fetched successfully', {
      count: response.data?.data?.regulators?.length || 0,
    });

    // Backend returns { success, message, data: { regulators } }
    return response.data?.data?.regulators || [];
  } catch (error) {
    logger.error('Failed to fetch admins data', { error: error.message });
    throw error;
  }
};

/**
 * Get employers data
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with employers data
 */
export const getEmployers = async (params = {}) => {
  try {
    logger.debug('Fetching employers data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.employers, {
      params,
    });

    logger.debug('Employers data fetched successfully', {
      count: response.data?.data?.employers?.length || 0,
    });

    // Backend returns { success, message, data: { employers } }
    return response.data?.data?.employers || [];
  } catch (error) {
    logger.error('Failed to fetch employers data', { error: error.message });
    throw error;
  }
};

/**
 * Get jobs data (public view)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with jobs data
 */
export const getJobs = async (params = {}) => {
  try {
    logger.debug('Fetching jobs data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.jobs, {
      params,
    });

    logger.debug('Jobs data fetched successfully', {
      count: response.data?.data?.jobs?.length || 0,
    });

    // Backend returns { success, message, data: { jobs } }
    return response.data?.data?.jobs || [];
  } catch (error) {
    logger.error('Failed to fetch jobs data', { error: error.message });
    throw error;
  }
};

/**
 * Get my jobs (employer only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with my jobs data
 */
export const getMyJobs = async (params = {}) => {
  try {
    logger.debug('Fetching my jobs data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.myJobs, {
      params,
    });

    logger.debug('My jobs data fetched successfully', {
      count: response.data?.data?.jobs?.length || 0,
    });

    // Backend returns { success, message, data: { jobs } }
    return response.data?.data?.jobs || [];
  } catch (error) {
    logger.error('Failed to fetch my jobs data', { error: error.message });
    throw error;
  }
};

/**
 * Get my applications (user only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with my applications data
 */
export const getMyApplications = async (params = {}) => {
  try {
    logger.debug('Fetching my applications data', { params });
    const response = await axiosClient.get(ENDPOINTS.HOME.DATA.myApplications, {
      params,
    });

    logger.debug('My applications data fetched successfully', {
      count: response.data?.data?.applications?.length || 0,
    });

    // Backend returns { success, message, data: { applications } }
    return response.data?.data?.applications || [];
  } catch (error) {
    logger.error('Failed to fetch my applications data', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get credential history (user only)
 * @param {Object} params - Query parameters
 * @returns {Promise} - API response with credential history data
 */
export const getCredentialHistory = async (params = {}) => {
  try {
    logger.debug('Fetching credential history', { params });
    const response = await axiosClient.get(
      ENDPOINTS.HOME.DATA.credentialHistory,
      { params },
    );

    logger.debug('Credential history fetched successfully', {
      count: response.data?.data?.credentials?.length || 0,
    });

    // Backend returns { success, message, data: { credentials } }
    return response.data?.data?.credentials || [];
  } catch (error) {
    logger.error('Failed to fetch credential history', {
      error: error.message,
    });
    throw error;
  }
};

/**
 * Get job statistics (employer only)
 * @returns {Promise} - API response with job statistics
 */
export const getJobStats = async () => {
  try {
    logger.debug('Fetching job statistics');
    const response = await axiosClient.get(ENDPOINTS.HOME.STATS.jobs);

    logger.debug('Job statistics fetched successfully', {
      dataKeys: Object.keys(response.data?.data || {}),
    });

    // Backend returns { success, message, data: { stats } }
    return response.data?.data?.stats || {};
  } catch (error) {
    logger.error('Failed to fetch job statistics', { error: error.message });
    throw error;
  }
};

// Helper function to get role-specific data
export const getRoleData = async (role, params = {}) => {
  try {
    switch (role) {
      case 'learner':
        return await getUsers(params);
      case 'regulator':
        return await getAdmins(params);
      case 'employer':
        return await getEmployers(params);
      default:
        throw new Error(`Invalid role: ${role}`);
    }
  } catch (error) {
    logger.error('Failed to fetch role data', { role, error: error.message });
    throw error;
  }
};

/**
 * Get external courses from all platforms
 * @param {Object} params - Query parameters (query, platform, category, nsqfLevel, minHours, maxHours, page, limit)
 * @returns {Promise} - API response with external courses and pagination data
 */
export const getExternalCourses = async (params = {}) => {
  try {
    logger.debug('Fetching external courses', { params });
    const response = await axiosClient.get('/credentials/external-courses', {
      params,
    });

    logger.debug('External courses fetched successfully', {
      count: response.data?.data?.courses?.length || 0,
      pagination: response.data?.data?.pagination,
    });

    return {
      courses: response.data?.data?.courses || [],
      pagination: response.data?.data?.pagination || {},
    };
  } catch (error) {
    logger.error('Failed to fetch external courses', { error: error.message });
    throw error;
  }
};

/**
 * Get course categories with counts
 * @returns {Promise} - API response with categories
 */
export const getCourseCategories = async () => {
  try {
    logger.debug('Fetching course categories');
    const response = await axiosClient.get('/credentials/course-categories');

    logger.debug('Course categories fetched successfully');

    return response.data?.data?.categories || {};
  } catch (error) {
    logger.error('Failed to fetch course categories', { error: error.message });
    throw error;
  }
};

/**
 * Get courses by category
 * @param {string} category - Category name
 * @returns {Promise} - API response with courses
 */
export const getCoursesByCategory = async (category) => {
  try {
    logger.debug('Fetching courses by category', { category });
    const response = await axiosClient.get(
      `/credentials/courses-by-category/${encodeURIComponent(category)}`,
    );

    logger.debug('Courses fetched successfully', {
      category,
      count: response.data?.data?.courses?.length || 0,
    });

    return response.data?.data?.courses || [];
  } catch (error) {
    logger.error('Failed to fetch courses by category', {
      category,
      error: error.message,
    });
    throw error;
  }
};

// Export all functions as default
const homeAPI = {
  getDashboardStats,
  getUsers,
  getAdmins,
  getEmployers,
  getJobs,
  getMyJobs,
  getMyApplications,
  getCredentialHistory,
  getJobStats,
  getRoleData,
  getExternalCourses,
  getCourseCategories,
  getCoursesByCategory,
};

export default homeAPI;
