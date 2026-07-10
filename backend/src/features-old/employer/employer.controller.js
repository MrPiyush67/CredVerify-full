import { ApiResponse } from '../../utils/ApiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import * as employerService from './employer.service.js';

// @desc    Get all employers
// @route   GET /api/employers
// @access  Public
export const getAllEmployers = asyncHandler(async (req, res) => {
  const employers = await employerService.getAllEmployers();
  return res
    .status(200)
    .json(
      new ApiResponse(200, { employers }, 'Employers fetched successfully'),
    );
});

// @desc    Get employer by ID
// @route   GET /api/employers/:id
// @access  Public
export const getEmployerById = asyncHandler(async (req, res) => {
  const employer = await employerService.getEmployerById(req.params.id);
  // Return in format expected by frontend: { user }
  return res
    .status(200)
    .json(
      new ApiResponse(200, { user: employer }, 'Employer fetched successfully'),
    );
});

// @desc    Get employer settings
// @route   GET /api/employer/settings
// @access  Private (Employer only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await employerService.getSettings(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, settings, 'Settings fetched successfully'));
});

// @desc    Update employer settings
// @route   PATCH /api/employer/settings
// @access  Private (Employer only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await employerService.updateSettings(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, settings, 'Settings updated successfully'));
});

// @desc    Get employer statistics
// @route   GET /api/employer/stats
// @access  Private (Employer only)
export const getStats = asyncHandler(async (req, res) => {
  const stats = await employerService.getStats(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, stats, 'Stats fetched successfully'));
});
