import User from '../user/models/user.model.js';
import EmployerSettings from './employer.settings.model.js';
import {
  flattenSettings,
  getOrCreateSettings,
  buildSettingsUpdate,
} from '../../utils/settingsHelper.js';

export const getProfile = async (userId) => {
  const profile = await User.findById(userId).select('-passwordHash');

  if (!profile || profile.role !== 'employer') {
    throw new Error('Employer profile not found');
  }

  return profile;
};

export const updateProfile = async (userId, updates) => {
  const profile = await User.findByIdAndUpdate(
    userId,
    { $set: updates },
    { new: true, runValidators: true },
  ).select('-passwordHash');

  if (!profile || profile.role !== 'employer') {
    throw new Error('Employer profile not found');
  }

  return profile;
};

// Get all employers (for display/search) - only public employers
export const getAllEmployers = async (filters = {}) => {
  const employers = await User.find({
    role: 'employer',
    isPublic: true,
    ...filters,
  })
    .select('-passwordHash')
    .sort({ createdAt: -1 });

  return employers;
};

// Get employer by ID (public profile only)
export const getEmployerById = async (employerId) => {
  const employer = await User.findById(employerId).select('-passwordHash');

  if (!employer || employer.role !== 'employer') {
    throw new Error('Employer not found');
  }

  if (!employer.isPublic) {
    throw new Error('This employer profile is not public');
  }

  return employer;
};

// Get settings
export const getSettings = async (userId) => {
  const settings = await getOrCreateSettings(EmployerSettings, userId);
  return flattenSettings(settings);
};

// Update settings
export const updateSettings = async (userId, updates) => {
  const fieldMappings = {
    notifications: [
      'emailNotifications',
      'pushNotifications',
      'smsNotifications',
      'weeklyDigest',
      'marketingEmails',
      'candidateMatches',
      'jobExpirationAlerts',
      'weeklyAnalytics',
      'applicationAlerts',
    ],
    privacy: [
      'companyVisibility',
      'hideCompanyDetails',
      'anonymousPosting',
      'contactVisibility',
      'showOnlineStatus',
      'allowDirectMessages',
    ],
    security: [
      'twoFactorAuth',
      'loginNotifications',
      'sessionTimeout',
      'ipWhitelist',
    ],
    appearance: ['theme', 'language', 'timezone', 'compactView'],
    company: [
      'showSalaryRanges',
      'autoScreening',
      'requireCoverLetter',
      'allowApplications',
      'applicationDeadline',
      'candidateFiltering',
      'interviewScheduling',
      'chatAvailability',
      'officeHours',
    ],
  };

  const updateObj = buildSettingsUpdate(updates, fieldMappings);

  const settings = await EmployerSettings.findOneAndUpdate(
    { user: userId },
    { $set: updateObj },
    { new: true, upsert: true, runValidators: true },
  );

  return flattenSettings(settings);
};

// Get employer statistics (optimized with aggregation)
export const getStats = async (userId) => {
  const Job = (await import('../job/job.model.js')).default;

  const profile = await User.findById(userId).lean();

  if (!profile || profile.role !== 'employer') {
    throw new Error('Employer profile not found');
  }

  // Optimized: Single aggregation query for all job stats
  const jobStats = await Job.aggregate([
    { $match: { employer: userId } },
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
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
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

  const totalJobs = Object.values(statusMap).reduce(
    (sum, count) => sum + count,
    0,
  );
  const totalApplications =
    jobStats[0].applicationStats[0]?.totalApplications || 0;
  const avgApplicationsPerJob =
    totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;

  return {
    profile: {
      companyName: profile.companyName || '',
      industry: profile.industry || '',
    },
    jobs: {
      total: totalJobs,
      active: statusMap.active || 0,
      closed: statusMap.closed || 0,
      recent: jobStats[0].recentJobs[0]?.count || 0,
    },
    applications: {
      total: totalApplications,
      averagePerJob: parseFloat(avgApplicationsPerJob),
    },
  };
};
