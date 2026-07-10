import { ApiResponse } from '../../../utils/ApiResponse.js';
import { AppError } from '../../../utils/AppError.js';
import { asyncHandler } from '../../../utils/asyncHandler.js';
import { config } from '../../../config/env.js';
import * as userService from '../services/user.service.js';

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

export const updateMyRoleProfile = asyncHandler(async (req, res) => {
  const roleProfile = await userService.updateRoleProfile(
    req.user._id,
    req.body,
  );
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { roleProfile },
        'Role profile updated successfully',
      ),
    );
});

// @desc    Get users available for chat
// @route   GET /api/users/chat
// @access  Private
export const getChatUsers = asyncHandler(async (req, res) => {
  const users = await userService.getChatUsers(req.user._id);
  return res
    .status(200)
    .json(new ApiResponse(200, { users }, 'Chat users fetched successfully'));
});

// @desc    Extension login - returns user profile with token
// @route   POST /api/users/extension-login
// @access  Public
export const extensionLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Please provide email and password');
  }

  const { user, token } = await userService.authenticateUser(email, password);

  // For extension, we don't set cookies, just return token
  return res
    .status(200)
    .json(new ApiResponse(200, { user, token }, 'Login successful'));
});
