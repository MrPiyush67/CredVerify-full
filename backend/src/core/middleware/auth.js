import { asyncHandler } from '../utils/asyncHandler.js';
import { sendError } from '../utils/response.js';
import { verifyToken } from '../utils/generateToken.js';
import { MESSAGES } from '../constants/messages.js';
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
    return sendError(res, 401, MESSAGES.AUTH.TOKEN_MISSING);
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return sendError(res, 401, MESSAGES.AUTH.TOKEN_INVALID);
  }

  // Find user and attach to request
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user) {
    return sendError(res, 404, MESSAGES.USER.NOT_FOUND);
  }

  req.user = user;
  next();
});
