import { sendError } from '../utils/response.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, 401, MESSAGES.AUTH.UNAUTHORIZED);
    }

    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Required role: ${roles.join(' or ')}`
      );
    }

    next();
  };
};

// Shorthand guards
export const isLearner = authorize(ROLES.LEARNER);
export const isRegulator = authorize(ROLES.REGULATOR);
export const isEmployer = authorize(ROLES.EMPLOYER);
