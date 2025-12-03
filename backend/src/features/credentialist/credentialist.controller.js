import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import * as credentialistService from './credentialist.service.js';

// @desc    Get all credentialists (public profiles only)
// @route   GET /api/credentialists
// @access  Private
export const getAllCredentialists = asyncHandler(async (req, res) => {
  const profiles = await credentialistService.getAllCredentialists();
  return sendSuccess(res, 200, 'Credentialists fetched successfully', { profiles });
});

// @desc    Get credentialist by ID (respects privacy settings)
// @route   GET /api/credentialists/:id
// @access  Private
export const getCredentialistById = asyncHandler(async (req, res) => {
  const profile = await credentialistService.getCredentialistById(
    req.params.id,
    req.user._id,
    req.user.role
  );
  return sendSuccess(res, 200, 'Credentialist fetched successfully', { profile });
});

// @desc    Get credentialist settings
// @route   GET /api/credentialist/settings
// @access  Private (Credentialist only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await credentialistService.getSettings(req.user._id);
  return sendSuccess(res, 200, 'Settings fetched successfully', settings);
});

// @desc    Update credentialist settings
// @route   PATCH /api/credentialist/settings
// @access  Private (Credentialist only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await credentialistService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated successfully', settings);
});

// @desc    Get credentialist statistics
// @route   GET /api/credentialist/stats
// @access  Private (Credentialist only)
export const getStats = asyncHandler(async (req, res) => {
  const stats = await credentialistService.getStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', stats);
});
