import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import * as learnerService from './learner.service.js';

// @desc    Get all learners (public profiles only)
// @route   GET /api/learners
// @access  Public
export const getAllLearners = asyncHandler(async (req, res) => {
  const profiles = await learnerService.getAllLearners();
  return sendSuccess(res, 200, 'Learners fetched successfully', { profiles });
});

// @desc    Get learner by ID (respects privacy settings)
// @route   GET /api/learners/:id
// @access  Public
export const getLearnerById = asyncHandler(async (req, res) => {
  // req.user will be undefined if not authenticated
  const profile = await learnerService.getLearnerById(
    req.params.id,
    req.user?._id,
    req.user?.role
  );
  // Return in format expected by frontend: { user }
  return sendSuccess(res, 200, 'Learner fetched successfully', { user: profile });
});

// @desc    Get learner settings
// @route   GET /api/learner/settings
// @access  Private (Learner only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await learnerService.getSettings(req.user._id);
  return sendSuccess(res, 200, 'Settings fetched successfully', settings);
});

// @desc    Update learner settings
// @route   PATCH /api/learner/settings
// @access  Private (Learner only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await learnerService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated successfully', settings);
});

// @desc    Get learner statistics
// @route   GET /api/learner/stats
// @access  Private (Learner only)
export const getStats = asyncHandler(async (req, res) => {
  const stats = await learnerService.getStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', stats);
});
