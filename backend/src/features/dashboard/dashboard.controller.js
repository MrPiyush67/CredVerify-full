import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';
import * as dashboardService from './dashboard.service.js';

// @desc    Get comprehensive dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  const stats = await dashboardService.getStatsByRole(userId, userRole);

  return sendSuccess(res, 200, 'Dashboard stats fetched successfully', stats);
});
