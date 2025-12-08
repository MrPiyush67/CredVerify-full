/**
 * CredVerify Extension Configuration
 * Simple configuration for extension APIs
 */

const CONFIG = {
  // Environment
  ENV: 'development',

  // API Endpoints
  DEVELOPMENT: {
    BACKEND: 'http://localhost:5001',
    FRONTEND: 'http://localhost:5173'
  },

  PRODUCTION: {
    BACKEND: 'https://api.credverify.com',
    FRONTEND: 'https://app.credverify.com'
  },

  // Get current config
  get current() {
    return this.ENV === 'production' ? this.PRODUCTION : this.DEVELOPMENT;
  },

  // API Routes
  API: {
    LOGIN: '/api/users/extension-login',
    VERIFY: '/api/credentials/verify-certificate'
  },

  // Build full URL
  url(endpoint) {
    return `${this.current.BACKEND}${endpoint}`;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
