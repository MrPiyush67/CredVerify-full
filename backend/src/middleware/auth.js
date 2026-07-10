import jwt from 'jsonwebtoken';
import { config } from '#src/config/env.js';
import { AppError, asyncHandler } from '#src/utils/index.js';
import userModel from '#src/features/users/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token) {
    return next(new AppError(401, 'No token provided'));
  }

  // Verify token
  const decoded = jwt.verify(token, config.JWT_SECRET);

  if (!decoded) {
    return next(new AppError(401, 'Invalid token'));
  }

  // Find user and attach to request
  const user = await userModel.findById(decoded.id).select('-passwordHash');

  if (!user) {
    res.clearCookie('token');
    return next(new AppError(401, 'User not found'));
  }

  req.user = user;
  next();
});
