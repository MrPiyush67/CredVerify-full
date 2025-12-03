import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3002,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // OAuth credentials
  validClientId: process.env.VALID_CLIENT_ID,
  validClientSecret: process.env.VALID_CLIENT_SECRET,
  
  // Mock user data
  mockUser: {
    email: process.env.MOCK_USER_EMAIL || 'testuser@digilocker.mock',
    password: process.env.MOCK_USER_PASSWORD || 'Test@123',
    name: process.env.MOCK_USER_NAME || 'Test User',
    dob: process.env.MOCK_USER_DOB || '1990-01-01',
    aadhaar: process.env.MOCK_USER_AADHAAR || '1234-5678-9012'
  },
  
  // Token expiration times (in milliseconds)
  authCodeExpiry: 10 * 60 * 1000, // 10 minutes
  accessTokenExpiry: 3600 * 1000, // 1 hour
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
};
