import { AppError } from '../errors/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/generateToken.js';
import User from '../../features/user/user.model.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError(401, 'No token provided'));
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return next(new AppError(401, 'Invalid token'));
  }

  // Find user and attach to request
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user) {
    return next(new AppError(404, 'User not found'));
  }

  req.user = user;
  next();
});
