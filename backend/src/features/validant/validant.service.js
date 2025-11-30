import User from '../user/user.model.js';
import ValidantSettings from './validant.settings.model.js';
import Credential from '../credential/credential.model.js';
import { flattenSettings, getOrCreateSettings, buildSettingsUpdate } from '../../core/utils/settingsHelper.js';

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-passwordHash');

  if (!profile || profile.role !== 'validant') {
    throw new Error('Validant profile not found');
  }

  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!profile || profile.role !== 'validant') {
    throw new Error('Validant profile not found');
  }

  return profile;
};

export const getPendingCredentials = async (userId) => {
  const validantProfile = await User.findById(userId);

  if (!validantProfile || validantProfile.role !== 'validant') {
    throw new Error('Validant profile not found');
  }

  // Build query - filter by institution if validant has one
  const query = { 
    status: 'pending',
    verificationRequested: true 
  };

  // If validant has an institution, only show credentials for that institution
  if (validantProfile.institution) {
    query.institution = validantProfile.institution;
  }

  // Get credentials pending verification
  const credentials = await Credential.find(query)
    .populate('credentialist', 'name email avatar')
    .sort({ requestedAt: -1, createdAt: -1 });

  return credentials;
};

export const verifyCredential = async (userId, credentialId) => {
  const validantProfile = await User.findById(userId);

  if (!validantProfile || validantProfile.role !== 'validant') {
    throw new Error('Validant profile not found');
  }

  const credential = await Credential.findById(credentialId);

  if (!credential) {
    throw new Error('Credential not found');
  }

  if (credential.status !== 'pending') {
    throw new Error('Credential is not pending verification');
  }

  // Update credential
  credential.status = 'verified';
  credential.verifiedBy = userId;
  credential.verifiedAt = new Date();
  await credential.save();

  // Increment validant verified count
  validantProfile.verifiedCount += 1;
  await validantProfile.save();

  return credential;
};

export const rejectCredential = async (userId, credentialId, reason) => {
  const validantProfile = await User.findById(userId);

  if (!validantProfile || validantProfile.role !== 'validant') {
    throw new Error('Validant profile not found');
  }

  const credential = await Credential.findById(credentialId);

  if (!credential) {
    throw new Error('Credential not found');
  }

  if (credential.status !== 'pending') {
    throw new Error('Credential is not pending verification');
  }

  // Update credential
  credential.status = 'rejected';
  credential.verifiedBy = userId;
  credential.rejectionReason = reason;
  credential.verifiedAt = new Date();
  await credential.save();

  // Increment validant rejected count
  validantProfile.rejectedCount += 1;
  await validantProfile.save();

  return credential;
};

export const getVerificationStats = async (userId) => {
  const profile = await User.findById(userId);

  if (!profile || profile.role !== 'validant') {
    throw new Error('Validant profile not found');
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

// Get all validants (for display/search)
export const getAllValidants = async (filters = {}) => {
  const validants = await User.find({ role: 'validant', ...filters })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return validants;
};

// Get validant by ID
export const getValidantById = async (validantId) => {
  const validant = await User.findById(validantId).select('-passwordHash');

  if (!validant || validant.role !== 'validant') {
    throw new Error('Validant not found');
  }

  return validant;
};

// Get settings
export const getSettings = async (userId) => {
  const settings = await getOrCreateSettings(ValidantSettings, userId);
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

  const settings = await ValidantSettings.findOneAndUpdate(
    { user: userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true }
  );

  return flattenSettings(settings);
};
