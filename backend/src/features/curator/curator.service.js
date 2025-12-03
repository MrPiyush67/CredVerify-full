import User from '../user/user.model.js';
import CuratorSettings from './curator.settings.model.js';
import { flattenSettings, getOrCreateSettings, buildSettingsUpdate } from '../../core/utils/settingsHelper.js';

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-passwordHash');

  if (!profile || profile.role !== 'curator') {
    throw new Error('Curator profile not found');
  }

  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true }
  ).select('-passwordHash');

  if (!profile || profile.role !== 'curator') {
    throw new Error('Curator profile not found');
  }

  return profile;
};

// Get all curators (for display/search)
export const getAllCurators = async (filters = {}) => {
  const curators = await User.find({ role: 'curator', ...filters })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return curators;
};

// Get curator by ID
export const getCuratorById = async (curatorId) => {
  const curator = await User.findById(curatorId).select('-passwordHash');

  if (!curator || curator.role !== 'curator') {
    throw new Error('Curator not found');
  }

  return curator;
};

// Get settings
export const getSettings = async (userId) => {
  const settings = await getOrCreateSettings(CuratorSettings, userId);
  return flattenSettings(settings);
};

// Update settings
export const updateSettings = async (userId, updates) => {
  const fieldMappings = {
    notifications: [
      'emailNotifications', 'pushNotifications', 'smsNotifications', 'weeklyDigest',
      'marketingEmails', 'candidateMatches', 'jobExpirationAlerts', 'weeklyAnalytics', 'applicationAlerts',
    ],
    privacy: [
      'companyVisibility', 'hideCompanyDetails', 'anonymousPosting', 'contactVisibility',
      'showOnlineStatus', 'allowDirectMessages',
    ],
    security: [
      'twoFactorAuth', 'loginNotifications', 'sessionTimeout', 'ipWhitelist',
    ],
    appearance: [
      'theme', 'language', 'timezone', 'compactView',
    ],
    company: [
      'showSalaryRanges', 'autoScreening', 'requireCoverLetter', 'allowApplications',
      'applicationDeadline', 'candidateFiltering', 'interviewScheduling', 'chatAvailability', 'officeHours',
    ],
  };

  const updateObj = buildSettingsUpdate(updates, fieldMappings);

  const settings = await CuratorSettings.findOneAndUpdate(
    { user: userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true }
  );

  return flattenSettings(settings);
};

// Get curator statistics (optimized with aggregation)
export const getStats = async (userId) => {
  const Job = (await import('../job/job.model.js')).default;

  const profile = await User.findById(userId).lean();

  if (!profile || profile.role !== 'curator') {
    throw new Error('Curator profile not found');
  }

  // Optimized: Single aggregation query for all job stats
  const jobStats = await Job.aggregate([
    { $match: { curator: userId } },
    {
      $facet: {
        statusCounts: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
            },
          },
        ],
        recentJobs: [
          {
            $match: {
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
            },
          },
          { $count: 'count' },
        ],
        applicationStats: [
          {
            $project: {
              applicantCount: { $size: { $ifNull: ['$applicants', []] } },
            },
          },
          {
            $group: {
              _id: null,
              totalApplications: { $sum: '$applicantCount' },
              jobCount: { $sum: 1 },
            },
          },
        ],
      },
    },
  ]);

  const statusMap = jobStats[0].statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const totalJobs = Object.values(statusMap).reduce((sum, count) => sum + count, 0);
  const totalApplications = jobStats[0].applicationStats[0]?.totalApplications || 0;
  const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

  return {
    profile: {
      companyName: profile.companyName || '',
      industry: profile.industry || '',
    },
    jobs: {
      total: totalJobs,
      active: statusMap.active || 0,
      closed: statusMap.closed || 0,
      draft: statusMap.draft || 0,
      recent: jobStats[0].recentJobs[0]?.count || 0,
    },
    applications: {
      total: totalApplications,
      averagePerJob: parseFloat(avgApplicationsPerJob),
    },
  };
};

