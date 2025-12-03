// In-memory storage for sessions and codes
export const authCodes = new Map(); // code -> { redirectUri, userId, createdAt, expiresAt }
export const accessTokens = new Map(); // token -> { userId, createdAt, expiresAt }
