import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import * as regulatorService from './regulator.service.js';

// @desc    Get pending credentials for verification
// @route   GET /api/regulator/credentials/pending
// @access  Private (Regulator only)
export const getPendingCredentials = asyncHandler(async (req, res) => {
  const credentials = await regulatorService.getPendingCredentials(req.user._id);
  return res.status(200).json(new ApiResponse(200, {
    credentials,
  }, 'Pending credentials fetched successfully'));
});

// @desc    Verify a credential
// @route   POST /api/regulator/credentials/:id/verify
// @access  Private (Regulator only)
export const verifyCredential = asyncHandler(async (req, res) => {
  const credential = await regulatorService.verifyCredential(
    req.user._id,
    req.params.id
  );
  return res.status(200).json(new ApiResponse(200, { credential }, 'Credential verified successfully'));
});

// @desc    Reject a credential
// @route   POST /api/regulator/credentials/:id/reject
// @access  Private (Regulator only)
export const rejectCredential = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const credential = await regulatorService.rejectCredential(
    req.user._id,
    req.params.id,
    reason
  );
  return res.status(200).json(new ApiResponse(200, { credential }, 'Credential rejected'));
});

// @desc    Get verification stats
// @route   GET /api/regulator/stats
// @access  Private (Regulator only)
export const getStats = asyncHandler(async (req, res) => {
  const data = await regulatorService.getVerificationStats(req.user._id);
  return res.status(200).json(new ApiResponse(200, data, 'Stats fetched successfully'));
});

// @desc    Get all regulators
// @route   GET /api/regulators
// @access  Public
export const getAllRegulators = asyncHandler(async (req, res) => {
  const regulators = await regulatorService.getAllRegulators();
  return res.status(200).json(new ApiResponse(200, { regulators }, 'Regulators fetched successfully'));
});

// @desc    Get regulator by ID
// @route   GET /api/regulators/:id
// @access  Public
export const getRegulatorById = asyncHandler(async (req, res) => {
  const regulator = await regulatorService.getRegulatorById(req.params.id);
  // Return in format expected by frontend: { user }
  return res.status(200).json(new ApiResponse(200, { user: regulator }, 'Regulator fetched successfully'));
});

// @desc    Get regulator settings
// @route   GET /api/regulator/settings
// @access  Private (Regulator only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await regulatorService.getSettings(req.user._id);
  return res.status(200).json(new ApiResponse(200, settings, 'Settings fetched successfully'));
});

// @desc    Update regulator settings
// @route   PATCH /api/regulator/settings
// @access  Private (Regulator only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await regulatorService.updateSettings(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, settings, 'Settings updated successfully'));
});
