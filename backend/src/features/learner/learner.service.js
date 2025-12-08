import User from '../user/user.model.js';
import LearnerSettings from './learner.settings.model.js';
import Job from '../job/job.model.js';
import { flattenSettings, getOrCreateSettings, buildSettingsUpdate } from '../../core/utils/settingsHelper.js';

// Helper function to check if a employer can access a private profile
export const canEmployerAccessProfile = async (employerId, learnerUserId) => {
  // Check if learner has applied to any of employer's jobs
  const jobWithApplication = await Job.findOne({
    employer: employerId,
    'applicants.learner': learnerUserId,
  });

  return !!jobWithApplication;
};

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-passwordHash');

  if (!profile || profile.role !== 'learner') {
    throw new Error('Learner profile not found');
  }

  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!profile || profile.role !== 'learner') {
    throw new Error('Learner profile not found');
  }

  return profile;
};

// Get all public learners (only returns public profiles)
export const getAllLearners = async (filters = {}) => {
  const query = { role: 'learner', isPublic: true, ...filters };

  const profiles = await User.find(query)
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return profiles;
};

// Get learner by ID with privacy check
export const getLearnerById = async (learnerId, requestingUserId = null, requestingUserRole = null) => {
  const profile = await User.findById(learnerId).select('-passwordHash');

  if (!profile || profile.role !== 'learner') {
    throw new Error('Learner not found');
  }

  // If profile is public, anyone can view
  if (profile.isPublic) {
    return profile;
  }

  // If profile is private, check access permissions
  if (!requestingUserId) {
    throw new Error('This profile is private');
  }

  // Owner can always view their own profile
  if (profile._id.toString() === requestingUserId.toString()) {
    return profile;
  }

  // Employers can view if learner applied to their job
  if (requestingUserRole === 'employer') {
    const hasAccess = await canEmployerAccessProfile(requestingUserId, profile._id);
    if (hasAccess) {
      return profile;
    }
  }

  // Otherwise, profile is private and no access
  throw new Error('This profile is private');
};

// Get settings
export const getSettings = async (userId) => {
  const settings = await getOrCreateSettings(LearnerSettings, userId);
  return flattenSettings(settings);
};

// Update settings
export const updateSettings = async (userId, updates) => {
  const fieldMappings = {
    notifications: [
      'emailNotifications', 'pushNotifications', 'smsNotifications', 'weeklyDigest',
      'marketingEmails', 'credentialUpdates', 'jobAlerts', 'applicationAlerts',
    ],
    privacy: [
      'profileVisibility', 'showEmail', 'showPhone', 'allowMessages', 'trackActivity',
      'showOnlineStatus', 'allowDirectMessages',
    ],
    security: [
      'twoFactorAuth', 'loginNotifications', 'sessionTimeout',
    ],
    appearance: [
      'theme', 'language', 'timezone', 'compactView',
    ],
  };

  const updateObj = buildSettingsUpdate(updates, fieldMappings);

  const settings = await LearnerSettings.findOneAndUpdate(
    { user: userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true }
  );

  return flattenSettings(settings);
};

// Get learner statistics (optimized with single aggregation)
export const getStats = async (userId) => {
  const Credential = (await import('../credential/credential.model.js')).default;
  const Job = (await import('../job/job.model.js')).default;

  const profile = await User.findById(userId).lean();

  if (!profile || profile.role !== 'learner') {
    throw new Error('Profile not found');
  }

  // Optimized: Use Promise.all for parallel queries
  const [credentialStats, jobStats] = await Promise.all([
    // Get all credential counts in single aggregation
    Credential.aggregate([
      { $match: { learner: userId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          verified: [{ $match: { status: 'verified' } }, { $count: 'count' }],
          pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
          rejected: [{ $match: { status: 'rejected' } }, { $count: 'count' }],
        },
      },
    ]),
    // Get application stats in single aggregation
    Job.aggregate([
      { $match: { 'applicants.learner': userId } },
      {
        $facet: {
          total: [{ $count: 'count' }],
          active: [{ $match: { status: 'active' } }, { $count: 'count' }],
        },
      },
    ]),
  ]);

  const credentials = {
    total: credentialStats[0]?.total[0]?.count || 0,
    verified: credentialStats[0]?.verified[0]?.count || 0,
    pending: credentialStats[0]?.pending[0]?.count || 0,
    rejected: credentialStats[0]?.rejected[0]?.count || 0,
  };

  const applications = {
    total: jobStats[0]?.total[0]?.count || 0,
    active: jobStats[0]?.active[0]?.count || 0,
  };

  // Calculate profile completeness
  const fields = ['bio', 'phone', 'skills', 'education', 'experience'];
  const completedFields = fields.filter(field => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
  });
  const profileCompleteness = Math.round((completedFields.length / fields.length) * 100);

  return {
    profile: {
      completeness: profileCompleteness,
      educationCount: profile.education?.length || 0,
      achievementsCount: profile.achievements?.length || 0,
      experienceCount: profile.experience?.length || 0,
      skillsCount: profile.skills?.length || 0,
    },
    credentials,
    applications,
  };
};
