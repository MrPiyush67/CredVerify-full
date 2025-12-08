/**
 * DigiLocker OAuth 2.0 Mock Server - Routes
 * Mimics real DigiLocker OAuth flow: https://digilocker.meripehchaan.gov.in/public/oauth2/1
 * 
 * Real DigiLocker API endpoints:
 * - /authorize - OAuth authorization endpoint
 * - /token - Token exchange endpoint  
 * - /files - User documents list
 * 
 * To integrate with real DigiLocker:
 * 1. Replace base URL with https://digilocker.meripehchaan.gov.in
 * 2. Update client_id and client_secret with government-issued credentials
 * 3. Ensure redirect_uri is whitelisted in DigiLocker developer portal
 */
import express from 'express';
import { config } from '../config/index.js';
import { validateCredentials, getUserById } from '../data/users.js';
import { getDocumentsByUserId } from '../data/documents.js';
import {
  generateAuthCode,
  validateAuthCode,
  deleteAuthCode,
  generateAccessToken
} from '../utils/tokenManager.js';
import { validateOAuthParams, validateClientCredentials } from '../utils/validators.js';
import { getLoginPage } from '../templates/login.js';
import { getConsentPageClean } from '../templates/consent-clean.js';
import { getInvalidRequestPage, getInvalidClientPage } from '../templates/errors.js';
import { getDocumentSelectionPage } from '../templates/documentSelection.js';

const router = express.Router();

// OAuth Step 1: Authorization endpoint - matches /public/oauth2/1/authorize
router.get('/authorize', (req, res) => {
  const { response_type, client_id, redirect_uri, state, scope } = req.query;

  // Validate required OAuth parameters
  const validation = validateOAuthParams({ response_type, client_id, redirect_uri });
  if (!validation.valid) {
    return res.status(400).send(getInvalidRequestPage());
  }

  // Validate client_id matches registered application
  if (client_id !== config.validClientId) {
    return res.status(401).send(getInvalidClientPage(config.validClientId));
  }

  // Show login page with pre-filled test credentials
  res.send(getLoginPage(
    client_id,
    redirect_uri,
    state,
    scope,
    config.mockUser.email,
    config.mockUser.password
  ));
});

// OAuth Step 2: Login validation and consent
router.post('/login', (req, res) => {
  const { email, password, client_id, redirect_uri, state, scope } = req.body;

  // Validate user credentials
  const user = validateCredentials(email, password);
  if (!user) {
    return res.status(401).send('<h1>Login Failed</h1><p>Invalid credentials</p>');
  }

  // Show consent screen with document permissions
  res.send(getConsentPageClean(user, client_id, redirect_uri, state));
});

// OAuth Step 3: User approves access - generate authorization code
router.post('/approve', (req, res) => {
  const { redirect_uri, state, userId } = req.body;

  // Get all user documents from DigiLocker
  const documents = getDocumentsByUserId(userId);

  // Generate authorization code with document access
  const code = generateAuthCode(redirect_uri, userId, documents);

  // Redirect to application callback with auth code
  const url = new URL(redirect_uri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);

  res.redirect(url.toString());
});

// OAuth Step 4: Token exchange - matches /public/oauth2/1/token
router.post('/token', (req, res) => {
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

  // Validate grant type
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code grant type is supported'
    });
  }

  // Validate client credentials
  const clientValidation = validateClientCredentials(
    client_id,
    client_secret,
    config.validClientId,
    config.validClientSecret
  );

  if (!clientValidation.valid) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: clientValidation.error
    });
  }

  // Validate and exchange authorization code
  const authValidation = validateAuthCode(code, redirect_uri);

  if (!authValidation.valid) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: authValidation.error
    });
  }

  // Generate access token for API calls
  const { accessToken, refreshToken } = generateAccessToken(authValidation.userId);

  // Delete used authorization code (one-time use)
  deleteAuthCode(code);

  // Return OAuth token response
  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: 'profile documents'
  });
});

export default router;
