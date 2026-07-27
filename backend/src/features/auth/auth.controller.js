import { ApiResponse, asyncHandler } from '#src/utils/index.js';
import { config } from '#src/config/env.js';
import { signupUser, loginUser } from './auth.service.js';

export const signup = asyncHandler(async (req, res) => {
  const { user, token } = await signupUser(req.body);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return res
    .status(201)
    .json(new ApiResponse(201, user, 'Account created successfully'));
});

export const login = asyncHandler(async (req, res) => {
  const { user, token } = await loginUser(req.body);

  // Set cookie
  res.cookie('token', token, {
    httpOnly: true,
    secure: config.NODE_ENV === 'production',
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'Logged in successfully'));
});

export const logout = asyncHandler(async (req, res) => {
  // Clear cookie
  res.clearCookie('token');

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

