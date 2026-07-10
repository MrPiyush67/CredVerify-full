import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as dashboardService from './dashboard.service.js';

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const stats = await dashboardService.getStatsByRole(userId, userRole);

  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Dashboard stats fetched successfully'));
});
