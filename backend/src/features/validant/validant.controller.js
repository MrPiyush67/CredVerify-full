import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess } from '../../core/utils/response.js';
import { MESSAGES } from '../../core/constants/messages.js';
import * as validantService from './validant.service.js';

// @desc    Get pending credentials for verification
// @route   GET /api/validant/credentials/pending
// @access  Private (Validant only)
export const getPendingCredentials = asyncHandler(async (req, res) => {
  const credentials = await validantService.getPendingCredentials(req.user._id);
  return sendSuccess(res, 200, 'Pending credentials fetched successfully', {
    credentials,
  });
});

// @desc    Verify a credential
// @route   POST /api/validant/credentials/:id/verify
// @access  Private (Validant only)
export const verifyCredential = asyncHandler(async (req, res) => {
  const credential = await validantService.verifyCredential(
    req.user._id,
    req.params.id
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.VERIFIED, { credential });
});

// @desc    Reject a credential
// @route   POST /api/validant/credentials/:id/reject
// @access  Private (Validant only)
export const rejectCredential = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  const credential = await validantService.rejectCredential(
    req.user._id,
    req.params.id,
    reason
  );
  return sendSuccess(res, 200, MESSAGES.CREDENTIAL.REJECTED, { credential });
});

// @desc    Get verification stats
// @route   GET /api/validant/stats
// @access  Private (Validant only)
export const getStats = asyncHandler(async (req, res) => {
  const data = await validantService.getVerificationStats(req.user._id);
  return sendSuccess(res, 200, 'Stats fetched successfully', data);
});

// @desc    Get all validants
// @route   GET /api/validants
// @access  Private
export const getAllValidants = asyncHandler(async (req, res) => {
  const validants = await validantService.getAllValidants();
  return sendSuccess(res, 200, 'Validants fetched successfully', { validants });
});

// @desc    Get validant by ID
// @route   GET /api/validants/:id
// @access  Private
export const getValidantById = asyncHandler(async (req, res) => {
  const validant = await validantService.getValidantById(req.params.id);
  return sendSuccess(res, 200, 'Validant fetched successfully', { validant });
});

// @desc    Get validant settings
// @route   GET /api/validant/settings
// @access  Private (Validant only)
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await validantService.getSettings(req.user._id);
  return sendSuccess(res, 200, 'Settings fetched successfully', settings);
});

// @desc    Update validant settings
// @route   PATCH /api/validant/settings
// @access  Private (Validant only)
export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await validantService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated successfully', settings);
});
