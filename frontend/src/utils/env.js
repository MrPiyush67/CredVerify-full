export const validateEnv = () => {
  const requiredVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
  };

  // Optional vars with defaults
  const optionalVars = {
    MODE: import.meta.env.MODE || 'development',
  };

  // Check for missing required variables
  const missing = Object.entries(requiredVars)
    .filter(([_, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    const errorMessage =
      `❌ Missing Required Environment Variables:\n\n` +
      missing.map(key => `  • ${key}`).join('\n') +
      `\n\n📝 To fix this:\n` +
      `  1. Create a .env file in the frontend directory\n` +
      `  2. Add the following:\n\n` +
      missing.map(key => `     ${key}=your_value_here`).join('\n') +
      `\n\n💡 Example .env file:\n` +
      `   VITE_API_URL=http://localhost:8003/api\n`;

    throw new Error(errorMessage);
  }

  // Log configuration
  console.log('✅ Environment Configuration:', {
    ...requiredVars,
    ...optionalVars,
  });

  return {
    ...requiredVars,
    ...optionalVars,
  };
};

/**
 * Get validated environment configuration
 * Use this instead of import.meta.env directly for type safety
 */
export const env = {
  get API_URL() {
    return import.meta.env.VITE_API_URL || 'http://localhost:8003/api';
  },
  get mode() {
    return import.meta.env.MODE;
  },
};

/**
 * Get environment variable value
 * @param {string} key - Environment variable key
 * @param {*} defaultValue - Default value if not found
 */
export const getEnvVariable = (key, defaultValue = undefined) => {
  return import.meta.env[key] || defaultValue;
};

export default env;
