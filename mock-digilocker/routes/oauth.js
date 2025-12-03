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
import { getConsentPageMinimal as getConsentPageClean, getLoginFailedPage } from '../templates/consent-minimal.js';
import { getInvalidRequestPage, getInvalidClientPage } from '../templates/errors.js';
import { getDocumentSelectionPage } from '../templates/documentSelection.js';

const router = express.Router();

// 1. Authorization endpoint (OAuth Step 1)
router.get('/authorize', (req, res) => {
  console.log('\n========================================');
  console.log('🔐 AUTHORIZE ENDPOINT CALLED');
  console.log('========================================');
  console.log('Query params:', req.query);
  console.log('Headers:', req.headers);
  
  const { response_type, client_id, redirect_uri, state, scope } = req.query;

  // Validate required parameters
  const validation = validateOAuthParams({ response_type, client_id, redirect_uri });
  if (!validation.valid) {
    console.log('❌ Missing required parameters');
    return res.status(400).send(getInvalidRequestPage());
  }

  // Validate client_id
  console.log('🔍 Validating client_id...');
  console.log('Received:', client_id);
  console.log('Expected:', config.validClientId);
  
  if (client_id !== config.validClientId) {
    console.log('❌ Client ID mismatch!');
    return res.status(401).send(getInvalidClientPage(config.validClientId));
  }

  // Show login page
  console.log('✅ All validations passed. Sending login page...');
  console.log('========================================\n');
  res.send(getLoginPage(
    client_id,
    redirect_uri,
    state,
    scope,
    config.mockUser.email,
    config.mockUser.password
  ));
});

// 2. Login endpoint (validates credentials and shows consent)
router.post('/login', (req, res) => {
  console.log('\n🔑 LOGIN ENDPOINT CALLED');
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);

  const { email, password, client_id, redirect_uri, state, scope } = req.body;

  // Validate credentials
  const user = validateCredentials(email, password);
  if (!user) {
    console.log('❌ Invalid credentials for email:', email);
    return res.send(getLoginFailedPage(client_id, redirect_uri, state, scope));
  }

  console.log('✅ User authenticated:', user.name);

  // Get document count
  const documents = getDocumentsByUserId(user.userId);
  console.log('📄 User has', documents.length, 'documents');

  // Show consent screen
  const html = getConsentPageClean(user, client_id, redirect_uri, state);
  console.log('📄 Consent page HTML length:', html.length);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// 3. Approve endpoint (generates auth code with all documents)
router.post('/approve', (req, res) => {
  console.log('\n========================================');
  console.log('✅ [DIGILOCKER] APPROVE ENDPOINT CALLED');
  console.log('========================================');
  console.log('Request body:', req.body);

  const { redirect_uri, state, userId } = req.body;

  // Get all user documents
  const documents = getDocumentsByUserId(userId);
  console.log('📄 [DIGILOCKER] User has', documents.length, 'documents');
  console.log('📄 [DIGILOCKER] Documents:', documents.map(d => ({ name: d.name, uri: d.uri })));
  console.log('✅ [DIGILOCKER] Approving access with all', documents.length, 'documents');

  // Generate authorization code with ALL documents
  const code = generateAuthCode(redirect_uri, userId, documents);
  console.log('🔑 [DIGILOCKER] Generated auth code:', code.substring(0, 20) + '...');

  // Redirect back to application
  const url = new URL(redirect_uri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);

  console.log('🔀 [DIGILOCKER] Redirecting to backend callback:', url.toString());
  console.log('========================================\n');
  res.redirect(url.toString());
});

// 4. Token endpoint (exchanges code for access token)
router.post('/token', (req, res) => {
  console.log('\n🎫 TOKEN ENDPOINT CALLED');
  console.log('Request body:', req.body);
  console.log('Content-Type:', req.headers['content-type']);

  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;

  // Validate grant type
  if (grant_type !== 'authorization_code') {
    console.log('❌ Invalid grant type:', grant_type);
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
    console.log('❌ Invalid client credentials');
    return res.status(401).json({
      error: 'invalid_client',
      error_description: clientValidation.error
    });
  }

  // Validate authorization code
  const authValidation = validateAuthCode(code, redirect_uri);

  if (!authValidation.valid) {
    console.log('❌ Invalid auth code:', authValidation.error);
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: authValidation.error
    });
  }

  // Generate access token
  const { accessToken, refreshToken } = generateAccessToken(authValidation.userId);
  console.log('🔑 Generated tokens for user:', authValidation.userId);

  // Delete used authorization code
  deleteAuthCode(code);

  // Return token response
  const tokenResponse = {
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: 'profile documents'
  };

  console.log('✅ Token response sent');
  res.json(tokenResponse);
});

export default router;
