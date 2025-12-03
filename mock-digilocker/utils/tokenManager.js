import crypto from 'crypto';
import { authCodes, accessTokens } from '../data/stores.js';
import { config } from '../config/index.js';

// Generate authorization code
export function generateAuthCode(redirectUri, userId, selectedDocuments = []) {
  const code = `MOCK_CODE_${crypto.randomBytes(16).toString('hex')}`;
  
  authCodes.set(code, {
    redirectUri,
    userId,
    selectedDocuments, // Store selected documents with the auth code
    createdAt: Date.now(),
    expiresAt: Date.now() + config.authCodeExpiry
  });
  
  return code;
}

// Generate access token
export function generateAccessToken(userId) {
  const accessToken = `MOCK_ACCESS_${crypto.randomBytes(32).toString('hex')}`;
  const refreshToken = `MOCK_REFRESH_${crypto.randomBytes(32).toString('hex')}`;
  
  accessTokens.set(accessToken, {
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + config.accessTokenExpiry
  });
  
  return { accessToken, refreshToken };
}

// Validate authorization code
export function validateAuthCode(code, redirectUri) {
  const authData = authCodes.get(code);
  
  if (!authData) {
    return { valid: false, error: 'Invalid or expired authorization code' };
  }
  
  if (Date.now() > authData.expiresAt) {
    authCodes.delete(code);
    return { valid: false, error: 'Authorization code has expired' };
  }
  
  if (redirectUri !== authData.redirectUri) {
    return { valid: false, error: 'Redirect URI mismatch' };
  }
  
  return { 
    valid: true, 
    userId: authData.userId, 
    selectedDocuments: authData.selectedDocuments || [] 
  };
}

// Clean up expired codes and tokens
export function cleanupExpiredData() {
  const now = Date.now();
  
  // Clean expired auth codes
  for (const [code, data] of authCodes.entries()) {
    if (now > data.expiresAt) {
      authCodes.delete(code);
    }
  }
  
  // Clean expired access tokens
  for (const [token, data] of accessTokens.entries()) {
    if (now > data.expiresAt) {
      accessTokens.delete(token);
    }
  }
}

// Delete used authorization code
export function deleteAuthCode(code) {
  authCodes.delete(code);
}
