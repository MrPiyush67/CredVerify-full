import { ApiResponse } from '../../core/utils/ApiResponse.js';
import { AppError } from '../../core/errors/AppError.js';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { config } from '../../core/config/env.js';
import * as userService from './user.service.js';


export const signup = asyncHandler(async (req, res) => {
  const { user, token } = await userService.createUser(req.body);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.cookieExpire * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json(new ApiResponse(201, { user, token }, 'Account created successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, 'Please provide email and password');
  }

  const { user, token } = await userService.authenticateUser(email, password);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.cookieExpire * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json(new ApiResponse(200, { user, token }, 'Logged in successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(0),
  });

  return res.status(200).json(new ApiResponse(200, null, 'Logged out successfully'));
});

export const getMe = asyncHandler(async (req, res) => {
  const data = await userService.getUserProfile(req.user._id);
  return res.status(200).json(new ApiResponse(200, data, 'Profile fetched successfully'));
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, { user }, 'Profile updated successfully'));
});

export const updateMyRoleProfile = asyncHandler(async (req, res) => {
  const roleProfile = await userService.updateRoleProfile(req.user._id, req.body);
  return res.status(200).json(new ApiResponse(200, { roleProfile }, 'Role profile updated successfully'));
});

// @desc    Get users available for chat
// @route   GET /api/users/chat
// @access  Private
export const getChatUsers = asyncHandler(async (req, res) => {
  const users = await userService.getChatUsers(req.user._id);
  return res.status(200).json(new ApiResponse(200, { users }, 'Chat users fetched successfully'));
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
  return res.status(200).json(new ApiResponse(200, { user, token }, 'Login successful'));
});
