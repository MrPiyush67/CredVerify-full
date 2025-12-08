import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import * as employerService from './employer.service.js';

// @desc    Get all employers
// @route   GET /api/employers
// @access  Public
export const getAllEmployers = asyncHandler(async (req, res) => {
  const employers = await employerService.getAllEmployers();
  return sendSuccess(res, 200, 'Employers fetched successfully', { employers });
});

// @desc    Get employer by ID
// @route   GET /api/employers/:id
// @access  Public
export const getEmployerById = asyncHandler(async (req, res) => {
  const employer = await employerService.getEmployerById(req.params.id);
  // Return in format expected by frontend: { user }
  return sendSuccess(res, 200, 'Employer fetched successfully', { user: employer });
});

// @desc    Get employer settings
// @route   GET /api/employer/settings
// @access  Private (Employer only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await employerService.getSettings(req.user._id);
  return sendSuccess(res, 200, 'Settings fetched successfully', settings);
});

// @desc    Update employer settings
// @route   PATCH /api/employer/settings
// @access  Private (Employer only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await employerService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated successfully', settings);
});

// @desc    Get employer statistics
// @route   GET /api/employer/stats
// @access  Private (Employer only)
export const getStats = asyncHandler(async (req, res) => {
  const stats = await employerService.getStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', stats);
});
