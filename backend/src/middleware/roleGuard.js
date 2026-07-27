import { AppError } from '#src/utils/index.js';

const authorize = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      throw new AppError(401, 'Not authorized to access this route');
    }

    if (req.user.role !== role) {
      throw new AppError(403, 'Access denied');
    }

    next();
  };
};

// Shorthand guards
export const isLearner = authorize('learner');
export const isRegulator = authorize('regulator');
export const isIssuer = authorize('issuer');
