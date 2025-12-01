/**
 * CredVerify Extension Configuration
 * 
 * Central configuration file for API endpoints and environment settings
 */

const CONFIG = {
  // Environment (change to 'production' when deploying)
  ENV: 'development',

  // API Endpoints
  DEVELOPMENT: {
    MAIN_BACKEND: 'http://127.0.0.1:5000',
    FRONTEND_APP: 'http://127.0.0.1:5173',

    // API Routes
    API: {
      // User Authentication
      EXTENSION_LOGIN: '/api/users/extension-login',
      LOGOUT: '/api/auth/logout',

      // Credential Verification (OCR + LLM)
      VERIFY_CERTIFICATE: '/api/credentials/verify-certificate',
      EXTRACT_PREVIEW: '/api/credentials/extract-preview',

      // Credential Management
      CREATE_FROM_EXTENSION: '/api/credentials/from-extension',
      GET_PUBLIC_CREDENTIALS: '/api/credentials/public',

      // Trusted Domains
      TRUSTED_DOMAINS: '/api/credentials/trusted-domains',
    }
  },

  PRODUCTION: {
    MAIN_BACKEND: 'https://api.credverify.com', // Replace with your production URL
    FRONTEND_APP: 'https://app.credverify.com', // Replace with your production URL

    // API Routes (same as development)
    API: {
      EXTENSION_LOGIN: '/api/users/extension-login',
      LOGOUT: '/api/auth/logout',
      VERIFY_CERTIFICATE: '/api/credentials/verify-certificate',
      EXTRACT_PREVIEW: '/api/credentials/extract-preview',
      CREATE_FROM_EXTENSION: '/api/credentials/from-extension',
      GET_PUBLIC_CREDENTIALS: '/api/credentials/public',
      TRUSTED_DOMAINS: '/api/credentials/trusted-domains',
    }
  },

  // Get current environment config
  get current() {
    return this.ENV === 'production' ? this.PRODUCTION : this.DEVELOPMENT;
  },

  // Helper to build full URL
  getFullUrl(endpoint) {
    return `${this.current.MAIN_BACKEND}${endpoint}`;
  },

  // Get specific API endpoint
  getEndpoint(key) {
    return this.getFullUrl(this.current.API[key]);
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
