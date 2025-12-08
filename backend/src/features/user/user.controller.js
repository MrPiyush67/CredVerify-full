import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';
import { MESSAGES } from '../../core/constants/messages.js';
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

  return sendSuccess(res, 201, MESSAGES.AUTH.SIGNUP_SUCCESS, { user, token });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  const { user, token } = await userService.authenticateUser(email, password);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.cookieExpire * 24 * 60 * 60 * 1000,
  });

  return sendSuccess(res, 200, MESSAGES.AUTH.LOGIN_SUCCESS, { user, token });
});

export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.cookie('token', '', {
    httpOnly: true,
    sameSite: 'lax',
    expires: new Date(0),
  });

  return sendSuccess(res, 200, MESSAGES.AUTH.LOGOUT_SUCCESS);
});

export const getMe = asyncHandler(async (req, res) => {
  const data = await userService.getUserProfile(req.user._id);
  return sendSuccess(res, 200, 'Profile fetched successfully', data);
});

export const updateMe = asyncHandler(async (req, res) => {
  const user = await userService.updateUserProfile(req.user._id, req.body);
  return sendSuccess(res, 200, MESSAGES.USER.PROFILE_UPDATED, { user });
});

export const updateMyRoleProfile = asyncHandler(async (req, res) => {
  const roleProfile = await userService.updateRoleProfile(req.user._id, req.body);
  return sendSuccess(res, 200, 'Role profile updated successfully', { roleProfile });
});

// @desc    Get users available for chat
// @route   GET /api/users/chat
// @access  Private
export const getChatUsers = asyncHandler(async (req, res) => {
  const users = await userService.getChatUsers(req.user._id);
  return sendSuccess(res, 200, 'Chat users fetched successfully', { users });
});

// @desc    Extension login - returns user profile with token
// @route   POST /api/users/extension-login
// @access  Public
export const extensionLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Please provide email and password');
  }

  const { user, token } = await userService.authenticateUser(email, password);

  // For extension, we don't set cookies, just return token
  return sendSuccess(res, 200, 'Login successful', { user, token });
});
