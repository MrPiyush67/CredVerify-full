import axiosClient from '@/shared';
import ENDPOINTS from '@/shared/services/endpoints.js';

// Get dashboard statistics for the authenticated user
export const getDashboardStats = async () => {
  const response = await axiosClient.get(ENDPOINTS.DASHBOARD.STATS);
  return response;
};
