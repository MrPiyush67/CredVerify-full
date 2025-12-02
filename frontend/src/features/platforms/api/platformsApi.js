import axiosClient from '@services/axiosClient';
import ENDPOINTS from '@services/endpoints';

// Get user's platform profile
export const getPlatformProfile = () => {
  return axiosClient.get(ENDPOINTS.PLATFORMS.GET_PROFILE);
};

// Submit platform handle
export const submitHandle = (platform, handle) => {
  return axiosClient.post(ENDPOINTS.PLATFORMS.SUBMIT_HANDLE(platform), { handle });
};

// Request verification code
export const requestVerification = (platform) => {
  return axiosClient.post(ENDPOINTS.PLATFORMS.REQUEST_VERIFICATION(platform));
};

// Verify platform ownership
export const verifyPlatform = (platform) => {
  return axiosClient.post(ENDPOINTS.PLATFORMS.VERIFY(platform));
};

// Refresh platform stats
export const refreshStats = (platform) => {
  return axiosClient.post(ENDPOINTS.PLATFORMS.REFRESH(platform));
};

// Remove platform
export const removePlatform = (platform) => {
  return axiosClient.delete(ENDPOINTS.PLATFORMS.REMOVE(platform));
};
