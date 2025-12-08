import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 8003,
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/microcredentials',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpire: process.env.JWT_EXPIRE || '7d',
  cookieExpire: process.env.JWT_COOKIE_EXPIRE || 7,
  digilocker: {
    clientId: process.env.DIGILOCKER_CLIENT_ID || 'mock-client-id',
    clientSecret: process.env.DIGILOCKER_CLIENT_SECRET || 'mock-client-secret',
    redirectUri: process.env.DIGILOCKER_REDIRECT_URI || 'http://localhost:8003/api/digilocker/callback',
    scope: process.env.DIGILOCKER_SCOPE || 'profile documents',
    // Use environment variable to switch between mock and real sandbox
    authUrl: process.env.DIGILOCKER_AUTH_URL || 'http://localhost:3002/public/oauth2/1/authorize',
    tokenUrl: process.env.DIGILOCKER_TOKEN_URL || 'http://localhost:3002/public/oauth2/1/token',
    userInfoUrl: process.env.DIGILOCKER_USER_INFO_URL || 'http://localhost:3002/public/oauth2/1/user_info',
    filesUrl: process.env.DIGILOCKER_FILES_URL || 'http://localhost:3002/public/oauth2/1/files',
    downloadUrl: process.env.DIGILOCKER_DOWNLOAD_URL || 'http://localhost:3002/public/oauth2/1/files/download',
  },
};
