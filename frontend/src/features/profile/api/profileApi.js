import axiosClient from '@services/axiosClient.js';
import ENDPOINTS from '@services/endpoints.js';

// Get current user's profile (returns { user, roleProfile })
export const getUserProfile = async () => {
  const response = await axiosClient.get(ENDPOINTS.PROFILE.GET_ME);
  return response;
};

// Update current user's base profile (name, email, avatar, bio, etc.)
export const updateUserProfile = async (profileData) => {
  const response = await axiosClient.put(ENDPOINTS.PROFILE.UPDATE_ME, profileData);
  return response;
};

// Update current user's role-specific profile
export const updateRoleProfile = async (roleData) => {
  const response = await axiosClient.put(ENDPOINTS.PROFILE.UPDATE_ROLE, roleData);
  return response;
};

// Get public profile of another user
export const getPublicProfile = async (userId, role = 'credentialist') => {
  const response = await axiosClient.get(ENDPOINTS.PROFILE.PUBLIC(userId, role));
  return response;
};

// Note: Profile picture upload/delete removed - backend no longer supports these endpoints
// Avatar should be updated through the main profile update endpoint