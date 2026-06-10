import { AppError } from '../errors/AppError.js';

import { ROLES } from '../constants/roles.js';

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError(401, 'Not authorized to access this route'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, `Access denied. Required role: ${roles.join(' or ')}`));
    }

    next();
  };
};

// Shorthand guards
export const isLearner = authorize(ROLES.LEARNER);
export const isRegulator = authorize(ROLES.REGULATOR);
export const isEmployer = authorize(ROLES.EMPLOYER);
