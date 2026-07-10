export const ENDPOINTS = {
  PROFILE: {
    // Unified profile endpoints
    GET_ME: 'me/profile', // Returns { user, roleProfile }
    UPDATE_ME: 'me/profile', // Updates User base fields
    UPDATE_ROLE: 'me/profile/role', // Updates role-specific profile

    // Public profile by role
    PUBLIC: (userId, role = 'learner') => {
      const roleMap = {
        learner: `learners/${userId}`,
        regulator: `regulators/${userId}`,
        employer: `employers/${userId}`,
      };
      return roleMap[role] || `learners/${userId}`;
    },
  },
  DASHBOARD: {
    STATS: 'dashboard/stats',
  },
  HOME: {
    // Unified dashboard statistics endpoint (optimized single call)
    DASHBOARD: 'dashboard/stats',

    // Legacy individual statistics endpoints (kept for backward compatibility)
    STATS: {
      learners: 'learner/stats',
      regulator: 'regulator/stats',
      employers: 'employer/stats',
      jobs: 'jobs/stats',
    },

    // Data endpoints for dashboard - matching backend-new structure
    DATA: {
      learners: 'learners',
      regulators: 'regulators',
      employers: 'employers',
      jobs: 'jobs',
      myJobs: 'jobs/my-jobs',
      myApplications: 'jobs/my-applications',
      credentialHistory: 'credentials',
    },
  },
  NOTIFICATIONS: {
    // Unified notification endpoints (backend-new uses unified /notifications)
    LIST: 'notifications',
    UNREAD_COUNT: 'notifications/unread-count',
    MARK_READ: 'notifications/read',
    MARK_ALL_READ: 'notifications/mark-all-read',
    DELETE: 'notifications',
    CREATE: 'notifications',
    STATS: 'notifications/stats',
  },

  CHAT: {
    // Get all users available for chat
    USERS: 'chat/users',
    // Conversation endpoints
    CONVERSATIONS: 'chat/conversations',
    CONVERSATION_BY_ID: (id) => `chat/conversations/${id}`,
    MESSAGES: (conversationId) =>
      `chat/conversations/${conversationId}/messages`,
    // Message endpoints
    SEND_MESSAGE: 'chat/messages',
    START_CONVERSATION: 'chat/conversations',
    // Search
    SEARCH: 'chat/search',
    MARK_READ: (conversationId) => `chat/conversations/${conversationId}/read`,
  },

  SETTINGS: {
    // Get/Update settings (role-specific)
    GET: (role = 'learner') => {
      const roleMap = {
        learner: 'learner/settings',
        regulator: 'regulator/settings',
        employer: 'employer/settings',
      };
      return roleMap[role] || 'learner/settings';
    },
    UPDATE: (role = 'learner') => {
      const roleMap = {
        learner: 'learner/settings',
        regulator: 'regulator/settings',
        employer: 'employer/settings',
      };
      return roleMap[role] || 'learner/settings';
    },
  },

  CREDENTIALS: {
    LIST: 'credentials',
    GET: (id) => `credentials/${id}`,
    CREATE: 'credentials',
    UPDATE: (id) => `credentials/${id}`,
    DELETE: (id) => `credentials/${id}`,
    VERIFY: (id) => `credentials/${id}/verify`,
    REJECT: (id) => `credentials/${id}/reject`,
    STATS: 'credentials/stats',
    REQUEST_VERIFICATION: (id) => `credentials/${id}/request-verification`,
    PUBLIC: 'credentials/public',
    VERIFIED: 'credentials/verified',
    PENDING: 'credentials/pending', // For regulator to fetch pending/past credentials
  },

  JOBS: {
    // Public
    LIST: 'jobs',
    GET: (id) => `jobs/${id}`,

    // Employer
    CREATE: 'jobs',
    MY_JOBS: 'jobs/my-jobs',
    STATS: 'jobs/stats',
    UPDATE: (id) => `jobs/${id}`,
    DELETE: (id) => `jobs/${id}`,
    APPLICANTS: (id) => `jobs/${id}/applicants`,
    APPLICANT_DETAILS: (jobId, applicantUserId) =>
      `jobs/${jobId}/applicants/${applicantUserId}/details`,
    UPDATE_APPLICANT: (jobId, applicantId) =>
      `jobs/${jobId}/applicants/${applicantId}`,

    // Learner
    APPLY: (id) => `jobs/${id}/apply`,
    MY_APPLICATIONS: 'jobs/my-applications',
  },

  REGULATOR: {
    PROFILE: 'regulator/profile',
    SETTINGS: 'regulator/settings',
    STATS: 'regulator/stats',
    PENDING_CREDENTIALS: 'regulator/credentials/pending',
    VERIFY_CREDENTIAL: (id) => `regulator/credentials/${id}/verify`,
    REJECT_CREDENTIAL: (id) => `regulator/credentials/${id}/reject`,
  },

  EMPLOYER: {
    PROFILE: 'employer/profile',
    SETTINGS: 'employer/settings',
    STATS: 'employer/stats',
  },

  LEARNER: {
    PROFILE: 'learner/profile',
    SETTINGS: 'learner/settings',
    STATS: 'learner/stats',
  },

  PLATFORMS: {
    GET_PROFILE: 'platforms/profile',
    SUBMIT_HANDLE: (platform) => `platforms/${platform}/submit`,
    REQUEST_VERIFICATION: (platform) =>
      `platforms/${platform}/request-verification`,
    VERIFY: (platform) => `platforms/${platform}/verify`,
    REFRESH: (platform) => `platforms/${platform}/refresh`,
    REMOVE: (platform) => `platforms/${platform}`,
  },
};

export default ENDPOINTS;
