import { accessTokens } from '../data/stores.js';

// Middleware to verify access token
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'unauthorized',
      error_description: 'Missing or invalid authorization header'
    });
  }
  
  const token = authHeader.substring(7);
  const tokenData = accessTokens.get(token);
  
  if (!tokenData) {
    return res.status(401).json({
      error: 'invalid_token',
      error_description: 'Invalid access token'
    });
  }
  
  if (Date.now() > tokenData.expiresAt) {
    accessTokens.delete(token);
    return res.status(401).json({
      error: 'token_expired',
      error_description: 'Access token has expired'
    });
  }
  
  req.userId = tokenData.userId;
  next();
}
