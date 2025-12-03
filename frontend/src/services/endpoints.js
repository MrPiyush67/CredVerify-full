export const ENDPOINTS = {
  AUTH: {
    // Backend-new uses unified auth endpoints (not role-specific)
    LOGIN: 'auth/login',
    SIGNUP: 'auth/signup',
    REFRESH: 'auth/refresh', // not implemented server-side (reserved)
    LOGOUT: 'auth/logout',
    ME: 'me/profile', // Backend-new endpoint for getting current user
  },

  PROFILE: {
    // Unified profile endpoints
    GET_ME: 'me/profile',        // Returns { user, roleProfile }
    UPDATE_ME: 'me/profile',     // Updates User base fields
    UPDATE_ROLE: 'me/profile/role', // Updates role-specific profile

    // Public profile by role
    PUBLIC: (userId, role = 'credentialist') => {
      const roleMap = {
        credentialist: `credentialists/${userId}`,
        validant: `validants/${userId}`,
        curator: `curators/${userId}`
      };
      return roleMap[role] || `credentialists/${userId}`;
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
      credentialists: 'credentialist/stats',
      validant: 'validant/stats',
      curators: 'curator/stats',
      jobs: 'jobs/stats',
    },

    // Data endpoints for dashboard - matching backend-new structure
    DATA: {
      credentialists: 'credentialists',
      validants: 'validants',
      curators: 'curators',
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
    MESSAGES: (conversationId) => `chat/conversations/${conversationId}/messages`,
    // Message endpoints
    SEND_MESSAGE: 'chat/messages',
    START_CONVERSATION: 'chat/conversations',
    // Search
    SEARCH: 'chat/search',
    MARK_READ: (conversationId) => `chat/conversations/${conversationId}/read`,
  },

  SETTINGS: {
    // Get/Update settings (role-specific)
    GET: (role = 'credentialist') => {
      const roleMap = {
        credentialist: 'credentialist/settings',
        validant: 'validant/settings',
        curator: 'curator/settings'
      };
      return roleMap[role] || 'credentialist/settings';
    },
    UPDATE: (role = 'credentialist') => {
      const roleMap = {
        credentialist: 'credentialist/settings',
        validant: 'validant/settings',
        curator: 'curator/settings'
      };
      return roleMap[role] || 'credentialist/settings';
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
    PENDING: 'credentials/pending', // For validant to fetch pending/past credentials
  },

  JOBS: {
    // Public
    LIST: 'jobs',
    GET: (id) => `jobs/${id}`,

    // Curator
    CREATE: 'jobs',
    MY_JOBS: 'jobs/my-jobs',
    STATS: 'jobs/stats',
    UPDATE: (id) => `jobs/${id}`,
    DELETE: (id) => `jobs/${id}`,
    APPLICANTS: (id) => `jobs/${id}/applicants`,
    APPLICANT_DETAILS: (jobId, applicantUserId) => `jobs/${jobId}/applicants/${applicantUserId}/details`,
    UPDATE_APPLICANT: (jobId, applicantId) => `jobs/${jobId}/applicants/${applicantId}`,

    // Credentialist
    APPLY: (id) => `jobs/${id}/apply`,
    MY_APPLICATIONS: 'jobs/my-applications',
  },

  VALIDANT: {
    PROFILE: 'validant/profile',
    SETTINGS: 'validant/settings',
    STATS: 'validant/stats',
    PENDING_CREDENTIALS: 'validant/credentials/pending',
    VERIFY_CREDENTIAL: (id) => `validant/credentials/${id}/verify`,
    REJECT_CREDENTIAL: (id) => `validant/credentials/${id}/reject`,
  },

  CURATOR: {
    PROFILE: 'curator/profile',
    SETTINGS: 'curator/settings',
    STATS: 'curator/stats',
  },

  CREDENTIALIST: {
    PROFILE: 'credentialist/profile',
    SETTINGS: 'credentialist/settings',
    STATS: 'credentialist/stats',
  },

  PLATFORMS: {
    GET_PROFILE: 'platforms/profile',
    SUBMIT_HANDLE: (platform) => `platforms/${platform}/submit`,
    REQUEST_VERIFICATION: (platform) => `platforms/${platform}/request-verification`,
    VERIFY: (platform) => `platforms/${platform}/verify`,
    REFRESH: (platform) => `platforms/${platform}/refresh`,
    REMOVE: (platform) => `platforms/${platform}`,
  },
};

export default ENDPOINTS;
