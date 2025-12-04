import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyToken } from '../utils/generateToken.js';
import User from '../../features/user/user.model.js';

/**
 * Optional authentication middleware
 * Allows requests with testMode: true to bypass authentication
 * Otherwise requires valid Bearer token or cookie
 */
export const optionalAuth = asyncHandler(async (req, res, next) => {
  // Check if request has testMode enabled
  // Support both regular JSON body and multer form data
  const { testMode } = req.body || {};

  // Also check if testMode was passed as string from FormData
  const isTestMode = testMode === true || testMode === 'true';

  if (isTestMode) {
    // Allow test mode requests without authentication
    console.log('⚠️ Request using testMode - bypassing authentication');
    return next();
  }

  // Otherwise, require authentication
  let token;

  // Check for token in cookies or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required (or use testMode: true)',
    });
  }

  // Verify token
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  // Find user and attach to request
  const user = await User.findById(decoded.id).select('-passwordHash');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  req.user = user;
  next();
});
