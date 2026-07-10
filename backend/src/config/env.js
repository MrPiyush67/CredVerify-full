import dotenv from 'dotenv';

dotenv.config();

const config = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  CLIENT_URL: process.env.CLIENT_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
  JWT_COOKIE_EXPIRE: process.env.JWT_COOKIE_EXPIRE,

  //imagekit
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT,
  IMAGEKIT_FOLDER_PATH: process.env.IMAGEKIT_FOLDER_PATH,

  // digilocker
  DIGILOCKER_CLIENT_ID: process.env.DIGILOCKER_CLIENT_ID,
  DIGILOCKER_CLIENT_SECRET: process.env.DIGILOCKER_CLIENT_SECRET,
  DIGILOCKER_REDIRECT_URI: process.env.DIGILOCKER_REDIRECT_URI,
  DIGILOCKER_SCOPE: process.env.DIGILOCKER_SCOPE,
  // Use environment variable to switch between mock and real sandbox
  DIGILOCKER_AUTH_URL: process.env.DIGILOCKER_AUTH_URL,
  DIGILOCKER_TOKEN_URL: process.env.DIGILOCKER_TOKEN_URL,
  DIGILOCKER_USER_INFO_URL: process.env.DIGILOCKER_USER_INFO_URL,
  DIGILOCKER_FILES_URL: process.env.DIGILOCKER_FILES_URL,
  DIGILOCKER_DOWNLOAD_URL: process.env.DIGILOCKER_DOWNLOAD_URL,
};

// Crash loudly in production if critical env vars are missing
for (const key of Object.keys(config)) {
  if (!process.env[key]) {
    throw new Error(
      `❌ Missing required environment variable: ${key}. Refusing to start.`,
    );
  }
}

export { config };
