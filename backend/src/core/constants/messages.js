export const MESSAGES = {
  AUTH: {
    UNAUTHORIZED: 'Not authorized to access this route',
    INVALID_CREDENTIALS: 'Invalid email or password',
    TOKEN_MISSING: 'No token provided',
    TOKEN_INVALID: 'Invalid token',
    SIGNUP_SUCCESS: 'Account created successfully',
    LOGIN_SUCCESS: 'Logged in successfully',
    LOGOUT_SUCCESS: 'Logged out successfully',
  },
  USER: {
    NOT_FOUND: 'User not found',
    ALREADY_EXISTS: 'User already exists',
    PROFILE_UPDATED: 'Profile updated successfully',
  },
  CREDENTIAL: {
    UPLOADED: 'Credential uploaded successfully',
    NOT_FOUND: 'Credential not found',
    VERIFIED: 'Credential verified successfully',
    REJECTED: 'Credential rejected',
    VERIFICATION_REQUESTED: 'Verification request sent',
  },
  JOB: {
    CREATED: 'Job posted successfully',
    NOT_FOUND: 'Job not found',
    APPLIED: 'Application submitted successfully',
  },
  CHAT: {
    MESSAGE_SENT: 'Message sent',
    CONVERSATION_STARTED: 'Conversation started',
  },
};
