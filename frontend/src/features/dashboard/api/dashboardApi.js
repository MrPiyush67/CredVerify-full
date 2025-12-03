import axiosClient from '@services/axiosClient.js';
import ENDPOINTS from '@services/endpoints.js';

// Get dashboard statistics for the authenticated user
export const getDashboardStats = async () => {
  const response = await axiosClient.get(ENDPOINTS.DASHBOARD.STATS);
  return response;
};
