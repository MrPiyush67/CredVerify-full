import User from '../user/user.model.js';
import RegulatorSettings from './regulator.settings.model.js';
import Credential from '../credential/credential.model.js';
import { flattenSettings, getOrCreateSettings, buildSettingsUpdate } from '../../core/utils/settingsHelper.js';
import { AppError } from '../../core/errors/AppError.js';

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-passwordHash');

  if (!profile || profile.role !== 'regulator') {
    throw new AppError(404, 'Regulator profile not found');
  }

  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!profile || profile.role !== 'regulator') {
    throw new AppError(404, 'Regulator profile not found');
  }

  return profile;
};

export const getPendingCredentials = async (userId) => {
  const regulatorProfile = await User.findById(userId);

  if (!regulatorProfile || regulatorProfile.role !== 'regulator') {
    throw new AppError(403, 'Regulator profile not found');
  }

  // Build query - filter by institution if regulator has one
  const query = {
    status: 'pending',
    verificationRequested: true
  };

  // If regulator has an institution, only show credentials for that institution
  if (regulatorProfile.institution) {
    query.institution = regulatorProfile.institution;
  }

  // Get credentials pending verification
  const credentials = await Credential.find(query)
    .populate('learner', 'name email avatar')
    .sort({ requestedAt: -1, createdAt: -1 });

  return credentials;
};

export const verifyCredential = async (userId, credentialId) => {
  const regulatorProfile = await User.findById(userId);

  if (!regulatorProfile || regulatorProfile.role !== 'regulator') {
    throw new AppError(403, 'Regulator profile not found');
  }

  const credential = await Credential.findById(credentialId);

  if (!credential) {
    throw new AppError(404, 'Credential not found');
  }

  if (credential.status !== 'pending') {
    throw new AppError(400, 'Credential is not pending verification');
  }

  // Update credential
  credential.status = 'verified';
  credential.verifiedBy = userId;
  credential.verifiedAt = new Date();
  await credential.save();

  // Increment regulator verified count
  regulatorProfile.verifiedCount += 1;
  await regulatorProfile.save();

  return credential;
};

export const rejectCredential = async (userId, credentialId, reason) => {
  const regulatorProfile = await User.findById(userId);

  if (!regulatorProfile || regulatorProfile.role !== 'regulator') {
    throw new AppError(403, 'Regulator profile not found');
  }

  const credential = await Credential.findById(credentialId);

  if (!credential) {
    throw new AppError(404, 'Credential not found');
  }

  if (credential.status !== 'pending') {
    throw new AppError(400, 'Credential is not pending verification');
  }

  // Update credential
  credential.status = 'rejected';
  credential.verifiedBy = userId;
  credential.rejectionReason = reason;
  credential.verifiedAt = new Date();
  await credential.save();

  // Increment regulator rejected count
  regulatorProfile.rejectedCount += 1;
  await regulatorProfile.save();

  return credential;
};

export const getVerificationStats = async (userId) => {
  const profile = await User.findById(userId);

  if (!profile || profile.role !== 'regulator') {
    throw new AppError(403, 'Regulator profile not found');
  }

  // Single aggregation for all stats
  const credentialStats = await Credential.aggregate([
    {
      $facet: {
        pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
        myVerified: [{ $match: { verifiedBy: userId, status: 'verified' } }, { $count: 'count' }],
        myRejected: [{ $match: { verifiedBy: userId, status: 'rejected' } }, { $count: 'count' }],
      },
    },
  ]);

  const stats = credentialStats[0];
  const totalPending = stats.pending[0]?.count || 0;
  const myVerified = stats.myVerified[0]?.count || 0;
  const myRejected = stats.myRejected[0]?.count || 0;

  return {
    profile,
    stats: {
      totalPending,
      myVerified,
      myRejected,
      total: myVerified + myRejected,
    },
  };
};

// Get all regulators (for display/search) - only public regulators
export const getAllRegulators = async (filters = {}) => {
  const regulators = await User.find({ role: 'regulator', isPublic: true, ...filters })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return regulators;
};

// Get regulator by ID (public profile only)
export const getRegulatorById = async (regulatorId) => {
  const regulator = await User.findById(regulatorId).select('-passwordHash');

  if (!regulator || regulator.role !== 'regulator') {
    throw new AppError(404, 'Regulator not found');
  }

  if (!regulator.isPublic) {
    throw new AppError(403, 'This regulator profile is not public');
  }

  return regulator;
};

// Get settings
export const getSettings = async (userId) => {
  const settings = await getOrCreateSettings(RegulatorSettings, userId);
  return flattenSettings(settings);
};

// Update settings
export const updateSettings = async (userId, updates) => {
  const fieldMappings = {
    notifications: [
      'emailNotifications', 'pushNotifications', 'smsNotifications', 'weeklyDigest',
      'marketingEmails', 'verificationAlerts', 'systemAlerts', 'urgentNotifications', 'weeklyReports',
    ],
    privacy: [
      'profileVisibility', 'showEmail', 'showPhone', 'trackActivity',
    ],
    security: [
      'twoFactorAuth', 'loginNotifications', 'sessionTimeout', 'auditLogging',
    ],
    appearance: [
      'theme', 'language', 'timezone', 'compactView',
    ],
    admin: [
      'defaultVerificationTime', 'autoAssignment', 'bulkOperations', 'advancedFilters',
    ],
  };

  const updateObj = buildSettingsUpdate(updates, fieldMappings);

  const settings = await RegulatorSettings.findOneAndUpdate(
    { user: userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true }
  );

  return flattenSettings(settings);
};
