import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import * as curatorService from './curator.service.js';

// @desc    Get all curators
// @route   GET /api/curators
// @access  Public
export const getAllCurators = asyncHandler(async (req, res) => {
  const curators = await curatorService.getAllCurators();
  return sendSuccess(res, 200, 'Curators fetched successfully', { curators });
});

// @desc    Get curator by ID
// @route   GET /api/curators/:id
// @access  Public
export const getCuratorById = asyncHandler(async (req, res) => {
  const curator = await curatorService.getCuratorById(req.params.id);
  // Return in format expected by frontend: { user }
  return sendSuccess(res, 200, 'Curator fetched successfully', { user: curator });
});

// @desc    Get curator settings
// @route   GET /api/curator/settings
// @access  Private (Curator only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await curatorService.getSettings(req.user._id);
  return sendSuccess(res, 200, 'Settings fetched successfully', settings);
});

// @desc    Update curator settings
// @route   PATCH /api/curator/settings
// @access  Private (Curator only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await curatorService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated successfully', settings);
});

// @desc    Get curator statistics
// @route   GET /api/curator/stats
// @access  Private (Curator only)
export const getStats = asyncHandler(async (req, res) => {
  const stats = await curatorService.getStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', stats);
});
