import { ApiResponse } from '#src/utils/ApiResponse.js';
import { AppError } from '#src/utils/AppError.js';
import { asyncHandler } from '#src/utils/asyncHandler.js';
import User from './user.model.js';

export const getMe = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, 'user fetched successfully'));
});

export const getUsers = asyncHandler(async (req, res) => {
  const { skip = 0, limit = 20 } = req.query;

  const users = await User.find({ role: 'learner', isPublic: true })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  return res
    .status(200)
    .json(new ApiResponse(200, users, 'users fetched successfully'));
});

export const getUser = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const isPublic = username === req.user?.username ? req.user.isPublic : true;

  const user = await User.findOne({ username, isPublic })
  // also fetch credentials and pass it 

  if (!user) throw new AppError(404, 'user not found');

  return res
    .status(200)
    .json(new ApiResponse(200, user, 'user fetched successfully'));
});
