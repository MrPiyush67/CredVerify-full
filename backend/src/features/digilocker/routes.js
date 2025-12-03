import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { config } from '../../core/config/env.js';
import { protect } from '../../core/middleware/auth.js';
import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { DigilockerAccount } from './model.js';
import { verifyToken } from '../../core/utils/generateToken.js';
import User from '../user/user.model.js';

const router = express.Router();

// Test endpoint to check if user is authenticated
router.get('/test-auth', async (req, res) => {
  console.log('\n🧪 Testing authentication...');
  console.log('Cookies:', req.cookies);
  console.log('Authorization header:', req.headers.authorization);
  
  let token;
  if (req.cookies?.token) {
    token = req.cookies.token;
    console.log('✅ Found token in cookie');
  } else if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('✅ Found token in header');
  } else {
    console.log('❌ No token found');
    return res.json({ 
      authenticated: false, 
      message: 'No authentication token found',
      hasCookie: !!req.cookies?.token,
      hasAuthHeader: !!req.headers.authorization
    });
  }
  
  try {
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.json({ authenticated: false, message: 'Invalid token' });
    }
    
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) {
      return res.json({ authenticated: false, message: 'User not found' });
    }
    
    return res.json({ 
      authenticated: true, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      },
      message: 'Authentication successful'
    });
  } catch (error) {
    return res.json({ authenticated: false, message: error.message });
  }
});

// Custom auth middleware for DigiLocker that redirects on failure
const protectWithRedirect = async (req, res, next) => {
  try {
    let token;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    console.log('🔐 DigiLocker auth check - Headers:', req.headers.cookie ? 'Cookie present' : 'No cookie');
    console.log('🔐 DigiLocker auth check - Authorization:', req.headers.authorization ? 'Bearer token present' : 'No bearer token');

    // Check for token in cookies or Authorization header
    if (req.cookies?.token) {
      token = req.cookies.token;
      console.log('✅ Token found in cookie');
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
      console.log('✅ Token found in Authorization header');
    }

    if (!token) {
      console.log('❌ DigiLocker auth failed: No token provided');
      console.log('   Redirecting to login page...');
      return res.redirect(`${frontendUrl}/auth/login?error=login_required&redirect=/credentials&message=Please+login+to+connect+DigiLocker`);
    }

    // Verify token
    console.log('🔍 Verifying token...');
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ DigiLocker auth failed: Invalid or expired token');
      console.log('   Redirecting to login page...');
      return res.redirect(`${frontendUrl}/auth/login?error=session_expired&redirect=/credentials&message=Session+expired.+Please+login+again`);
    }

    console.log('✅ Token verified for user ID:', decoded.id);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      console.log('❌ DigiLocker auth failed: User not found in database');
      console.log('   Redirecting to login page...');
      return res.redirect(`${frontendUrl}/auth/login?error=user_not_found&redirect=/credentials&message=User+account+not+found`);
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ DigiLocker auth middleware error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/auth/login?error=auth_error&redirect=/credentials&message=Authentication+error.+Please+try+again`);
  }
};

// Start OAuth flow - requires authentication
router.get(
  '/auth',
  protectWithRedirect,
  asyncHandler(async (req, res) => {
    try {
      console.log('\n========================================');
      console.log('🚀 DigiLocker OAuth Flow Starting');
      console.log('========================================');
      console.log('User ID:', req.user._id);
      console.log('User Email:', req.user.email);
      
      const randomState = crypto.randomBytes(16).toString('hex');
      // Encode user ID in state for retrieval after redirect
      const state = `${randomState}:${req.user._id}`;
      const { clientId, redirectUri, scope, authUrl } = config.digilocker;
      
      console.log('\n📋 OAuth Config:');
      console.log('  Client ID:', clientId);
      console.log('  Redirect URI:', redirectUri);
      console.log('  Auth URL:', authUrl);
      console.log('  Scope:', scope);
      console.log('  State:', state.substring(0, 20) + '...');
      
      const authorizeUrl = `${authUrl}?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}&scope=${encodeURIComponent(scope)}`;
      
      console.log('\n🔗 Redirect URL:', authorizeUrl.substring(0, 100) + '...');
      
      // Store state and user ID in cookie for callback validation
      res.cookie('digistate', state, { 
        httpOnly: true, 
        maxAge: 10 * 60 * 1000, // 10 minutes
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      console.log('✅ State cookie set: digistate');
      console.log('\n🔀 Redirecting to DigiLocker...');
      console.log('========================================\n');
      
      res.redirect(authorizeUrl);
    } catch (error) {
      console.error('\n❌❌❌ DigiLocker auth error:', error);
      console.error('Error stack:', error.stack);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/credentials?error=digilocker_auth_failed&message=${encodeURIComponent(error.message)}`);
    }
  })
);

// OAuth callback (no protect middleware - user comes from external redirect)
router.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error, error_description } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // Handle OAuth errors from DigiLocker
    if (error) {
      console.error('❌ DigiLocker OAuth error:', error, error_description);
      return res.redirect(`${frontendUrl}/credentials?error=${error}`);
    }
    
    const cookieState = req.cookies?.digistate;
    
    // Validate OAuth response
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`${frontendUrl}/credentials?error=no_code`);
    }
    
    if (!state || !cookieState) {
      console.error('❌ Missing state parameter or cookie');
      return res.redirect(`${frontendUrl}/credentials?error=missing_state`);
    }
    
    if (state !== cookieState) {
      console.error('❌ State mismatch - possible CSRF attack');
      return res.redirect(`${frontendUrl}/credentials?error=state_mismatch`);
    }

    // Extract user ID from state
    const [randomPart, userId] = state.split(':');
    if (!userId) {
      console.error('❌ Invalid state format - no userId');
      return res.redirect(`${frontendUrl}/credentials?error=invalid_state`);
    }
    
    console.log('✅ DigiLocker callback received for user:', userId);

    const { clientId, clientSecret, redirectUri, tokenUrl } = config.digilocker;
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const tokenResp = await axios.post(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, token_type, expires_in, id_token } = tokenResp.data;

    const userInfoResp = await axios.get(config.digilocker.userInfoUrl, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });

    await DigilockerAccount.findOneAndUpdate(
      { userId },
      {
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenType: token_type,
        expiresIn: expires_in,
        idToken: id_token,
        userInfo: userInfoResp.data,
        lastSyncedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    console.log('✅ DigiLocker account linked successfully for user:', userId);

    // Redirect back to frontend route with success flag
    res.clearCookie('digistate');
    res.redirect(`${frontendUrl}/credentials?digilocker=connected`);
  })
);

// List Digilocker files
router.get(
  '/files',
  protect,
  asyncHandler(async (req, res) => {
    const account = await DigilockerAccount.findOne({ userId: req.user._id });
    if (!account || !account.accessToken) return res.status(404).json({ message: 'Digilocker not connected' });

    const filesResp = await axios.get(config.digilocker.filesUrl, {
      headers: { Authorization: `${account.tokenType} ${account.accessToken}` },
    });

    res.json({ files: filesResp.data?.files || filesResp.data || [] });
  })
);

// Import selected documents into credentials
router.post(
  '/import',
  protect,
  asyncHandler(async (req, res) => {
    const { files } = req.body; // array of file metadata or URIs
    if (!Array.isArray(files) || files.length === 0) return res.status(400).json({ message: 'No files provided' });

    const account = await DigilockerAccount.findOne({ userId: req.user._id });
    if (!account || !account.accessToken) return res.status(404).json({ message: 'Digilocker not connected' });

    // Import Credential model
    const { default: Credential } = await import('../credential/credential.model.js');

    const created = [];
    for (const f of files) {
      // Map Digilocker document to Credential schema
      const doc = await Credential.create({
        user: req.user._id,
        legalNameSnapshot: req.user.name || account.userInfo?.name || 'Unknown',
        certificateName: account.userInfo?.name || req.user.name || 'Unknown',
        title: f.name || f.doctype || f.documentType || 'Digilocker Document',
        issuer: 'Digilocker (Government of India)',
        issueDate: f.date ? new Date(f.date) : new Date(),
        type: 'other',
        sourceUrl: f.uri || f.link || '',
        sourceDomain: 'digilocker.gov.in',
        isDomainTrusted: true,
        isIssuerVerified: true,
        status: 'verified',
        verificationStatus: 'VERIFIED',
        finalVerificationScore: 100,
        autoApproved: true,
        meta: {
          source: 'digilocker',
          digilockerFileId: f.uri || f.file_id || null,
          originalData: f,
        },
      });
      created.push(doc);
    }

    res.json({ message: 'Imported successfully', count: created.length, credentials: created });
  })
);

export default router;
