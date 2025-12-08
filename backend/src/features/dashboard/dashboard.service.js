import User from '../user/user.model.js';
import Credential from '../credential/credential.model.js';
import Job from '../job/job.model.js';
import { ROLES } from '../../core/constants/roles.js';

/**
 * Get dashboard statistics based on user role
 */
export const getStatsByRole = async (userId, role) => {
  switch (role) {
    case ROLES.LEARNER:
      return await getLearnerStats(userId);
    case ROLES.REGULATOR:
      return await getRegulatorStats(userId);
    case ROLES.EMPLOYER:
      return await getEmployerStats(userId);
    default:
      throw new Error('Invalid user role for dashboard access');
  }
};

/**
 * Learner dashboard statistics
 */
async function getLearnerStats(userId) {
  const profile = await User.findById(userId);

  if (!profile || profile.role !== 'learner') {
    throw new Error('Learner profile not found');
  }

  // Get credentials stats with single aggregation
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const credentialStats = await Credential.aggregate([
    { $match: { user: userId } },
    {
      $facet: {
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
        recentUpdates: [
          { $match: { updatedAt: { $gte: sevenDaysAgo } } },
          { $count: 'count' }
        ],
      },
    },
  ]);

  const statusCounts = credentialStats[0].statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const totalCredentials = credentialStats[0].total[0]?.count || 0;
  const recentCredentialUpdates = credentialStats[0].recentUpdates[0]?.count || 0;

  // Get active jobs count
  const activeJobs = await Job.countDocuments({
    createdAt: { $gte: sevenDaysAgo },
    status: 'active'
  });

  // Calculate profile completeness
  const profileCompleteness = calculateProfileCompleteness(profile);

  // Generate chart data (pass stats to avoid re-querying)
  const chartData = await generateChartData('learner', null, userId);
  const heatmapData = await generateHeatmapData('learner', null, userId);

  return {
    personalStats: {
      totalCredentials,
      verifiedCredentials: statusCounts.verified || 0,
      pendingCredentials: statusCounts.pending || 0,
      rejectedCredentials: statusCounts.rejected || 0,
      profileCompleteness,
    },
    recentActivity: {
      newJobs: activeJobs,
      newCredentialUpdates: recentCredentialUpdates,
    },
    chartData,
    heatmapData,
  };
}

/**
 * Regulator dashboard statistics
 */
async function getRegulatorStats(userId) {
  // Get all credentials counts for platform overview
  const [totalCredentials, verifiedCredentials, pendingCredentials, rejectedCredentials] = await Promise.all([
    Credential.countDocuments(),
    Credential.countDocuments({ status: 'verified' }),
    Credential.countDocuments({ status: 'pending' }),
    Credential.countDocuments({ status: 'rejected' }),
  ]);

  // Get credentials verified by this regulator (if tracking verifier)
  const myVerifications = await Credential.countDocuments({
    verifiedBy: userId,
    status: 'verified'
  });

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [totalUsers, totalEmployers, totalJobs, newCredentials] = await Promise.all([
    User.countDocuments({ role: ROLES.LEARNER }),
    User.countDocuments({ role: ROLES.EMPLOYER }),
    Job.countDocuments(),
    Credential.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  // Generate chart data
  const chartData = await generateChartData('regulator');
  const heatmapData = await generateHeatmapData('regulator');

  return {
    platformOverview: {
      totalUsers,
      totalEmployers,
      totalJobs,
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      rejectedCredentials,
    },
    personalStats: {
      myVerifications,
    },
    recentActivity: {
      newCredentials,
      pendingVerifications: pendingCredentials,
    },
    growthMetrics: {
      verificationRate: totalCredentials > 0
        ? ((verifiedCredentials / totalCredentials) * 100).toFixed(1)
        : 0,
    },
    chartData,
    heatmapData,
  };
}

/**
 * Employer dashboard statistics
 */
async function getEmployerStats(userId) {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get employer's jobs for calculations
  const employerJobs = await Job.find({ employer: userId });

  // Get employer's job stats with single aggregation
  const jobStats = await Job.aggregate([
    { $match: { employer: userId } },
    {
      $facet: {
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        total: [{ $count: 'count' }],
        applicationStats: [
          {
            $project: {
              applicantCount: { $size: { $ifNull: ['$applicants', []] } },
              isRecent: { $gte: ['$createdAt', thirtyDaysAgo] }
            }
          },
          {
            $group: {
              _id: null,
              totalApplications: { $sum: '$applicantCount' },
              recentJobs: { $sum: { $cond: ['$isRecent', 1, 0] } }
            }
          }
        ],
      },
    },
  ]);

  const statusCounts = jobStats[0].statusCounts.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  const totalJobs = jobStats[0].total[0]?.count || 0;
  const appStats = jobStats[0].applicationStats[0] || {};
  const totalApplications = appStats.totalApplications || 0;
  const recentJobs = appStats.recentJobs || 0;

  // Generate chart data
  const chartData = await generateChartData('employer', null, userId);
  const heatmapData = await generateHeatmapData('employer', null, userId);

  return {
    jobMetrics: {
      totalJobs,
      activeJobs: statusCounts.active || 0,
      draftJobs: statusCounts.draft || 0,
      closedJobs: statusCounts.closed || 0,
      totalApplications,
    },
    recentActivity: {
      newJobs: recentJobs,
      newApplications: 0, // Placeholder - implement when application tracking is ready
    },
    performance: {
      averageApplicationsPerJob: employerJobs.length > 0
        ? (totalApplications / employerJobs.length).toFixed(1)
        : 0,
      jobFillRate: calculateJobFillRate(employerJobs),
    },
    chartData,
    heatmapData,
  };
}

// Helper functions
function calculateProfileCompleteness(profile) {
  if (!profile) return 0;

  const fields = ['bio', 'skills', 'experience', 'education', 'location'];
  const completedFields = fields.filter(field => {
    const value = profile[field];
    return value && (Array.isArray(value) ? value.length > 0 : value.toString().trim() !== '');
  });

  return Math.round((completedFields.length / fields.length) * 100);
}

function calculateJobFillRate(jobs) {
  if (jobs.length === 0) return 0;
  const filledJobs = jobs.filter(job =>
    job.status === 'closed' && (job.applicants?.length || 0) > 0
  ).length;
  return ((filledJobs / jobs.length) * 100).toFixed(1);
}

/**
 * Generate chart data for line graphs (last 12 months)
 */
async function generateChartData(role, data = []) {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const chartData = [];

  try {
    for (let i = 11; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthName = months[monthIndex];
      const year = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);
      const startDate = new Date(year, monthIndex, 1);
      const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

      if (role === 'learner' && data.length > 0) {
        // Learner: Cumulative credentials over time
        const cumulativeByMonth = data.filter(c => new Date(c.createdAt) <= endDate);

        chartData.push({
          name: monthName,
          verified: cumulativeByMonth.filter(c => c.status === 'verified').length,
          pending: cumulativeByMonth.filter(c => c.status === 'pending').length,
          rejected: cumulativeByMonth.filter(c => c.status === 'rejected').length,
          total: cumulativeByMonth.length,
        });
      } else if (role === 'regulator') {
        // Regulator: Use MongoDB aggregation
        const pipeline = [
          {
            $facet: {
              verified: [
                { $match: { status: 'verified', updatedAt: { $gte: startDate, $lte: endDate } } },
                { $count: 'count' }
              ],
              rejected: [
                { $match: { status: 'rejected', updatedAt: { $gte: startDate, $lte: endDate } } },
                { $count: 'count' }
              ],
              pending: [
                { $match: { status: 'pending', createdAt: { $gte: startDate, $lte: endDate } } },
                { $count: 'count' }
              ],
            },
          },
        ];

        const result = await Credential.aggregate(pipeline);
        const verified = result[0].verified[0]?.count || 0;
        const rejected = result[0].rejected[0]?.count || 0;
        const pending = result[0].pending[0]?.count || 0;

        chartData.push({
          name: monthName,
          verified,
          rejected,
          pending,
          total: verified + rejected + pending,
        });
      } else if (role === 'employer' && data.length > 0) {
        // Employer: Job lifecycle metrics
        const monthJobs = data.filter(j => {
          const createdAt = new Date(j.createdAt);
          return createdAt >= startDate && createdAt <= endDate;
        });

        const activeJobs = monthJobs.filter(j => j.status === 'active').length;
        const closedJobs = monthJobs.filter(j => j.status === 'closed').length;
        const draftJobs = monthJobs.filter(j => j.status === 'draft').length;

        chartData.push({
          name: monthName,
          posted: monthJobs.length,
          active: activeJobs,
          closed: closedJobs,
          draft: draftJobs,
        });
      }
    }
  } catch (error) {
    console.error('Error generating chart data:', error);
  }

  return chartData;
}

/**
 * Generate heatmap data (last 365 days)
 */
async function generateHeatmapData(role, data = []) {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setHours(0, 0, 0, 0);

  try {
    const activityMap = new Map();

    if (role === 'learner' && data.length > 0) {
      // Learner: Group credential activities by date
      data.forEach(c => {
        const dateKey = new Date(c.updatedAt).toISOString().split('T')[0];
        activityMap.set(dateKey, (activityMap.get(dateKey) || 0) + 1);
      });
    } else if (role === 'regulator') {
      // Regulator: Use MongoDB aggregation for credentials
      const pipeline = [
        {
          $match: {
            updatedAt: { $gte: startDate, $lte: today },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' } },
            count: { $sum: 1 },
          },
        },
      ];

      const results = await Credential.aggregate(pipeline);
      results.forEach(r => {
        activityMap.set(r._id, r.count);
      });
    } else if (role === 'employer' && data.length > 0) {
      // Employer: Count job activities
      data.forEach(j => {
        const createDate = new Date(j.createdAt).toISOString().split('T')[0];
        activityMap.set(createDate, (activityMap.get(createDate) || 0) + 1);

        const updateDate = new Date(j.updatedAt).toISOString().split('T')[0];
        if (updateDate !== createDate) {
          activityMap.set(updateDate, (activityMap.get(updateDate) || 0) + 0.5);
        }
      });
    }

    // Generate complete 365-day array
    const heatmapData = [];
    for (let i = 364; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = Math.floor(activityMap.get(dateStr) || 0);

      heatmapData.push({
        date: dateStr,
        count: Math.min(count, 4), // Cap at 4 for heatmap intensity
      });
    }

    return heatmapData;
  } catch (error) {
    console.error('Error generating heatmap data:', error);
    return [];
  }
}
