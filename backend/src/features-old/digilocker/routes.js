import express from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { config } from '../../config/env.js';
import { protect } from '../../middleware/auth.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { DigilockerAccount } from './model.js';
import { verifyToken } from '../../utils/jwt.js';
import User from '../user/models/user.model.js';

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
      hasAuthHeader: !!req.headers.authorization,
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
        name: user.name,
      },
      message: 'Authentication successful',
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

    console.log(
      '🔐 DigiLocker auth check - Headers:',
      req.headers.cookie ? 'Cookie present' : 'No cookie',
    );
    console.log(
      '🔐 DigiLocker auth check - Authorization:',
      req.headers.authorization ? 'Bearer token present' : 'No bearer token',
    );

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
      return res.redirect(
        `${frontendUrl}/auth/login?error=login_required&redirect=/credentials/add&message=Please+login+to+connect+DigiLocker`,
      );
    }

    // Verify token
    console.log('🔍 Verifying token...');
    const decoded = verifyToken(token);

    if (!decoded) {
      console.log('❌ DigiLocker auth failed: Invalid or expired token');
      console.log('   Redirecting to login page...');
      return res.redirect(
        `${frontendUrl}/auth/login?error=session_expired&redirect=/credentials/add&message=Session+expired.+Please+login+again`,
      );
    }

    console.log('✅ Token verified for user ID:', decoded.id);

    // Find user and attach to request
    const user = await User.findById(decoded.id).select('-passwordHash');

    if (!user) {
      console.log('❌ DigiLocker auth failed: User not found in database');
      console.log('   Redirecting to login page...');
      return res.redirect(
        `${frontendUrl}/auth/login?error=user_not_found&redirect=/credentials&message=User+account+not+found`,
      );
    }

    console.log('✅ User authenticated:', user.email);
    req.user = user;
    next();
  } catch (error) {
    console.error('❌ DigiLocker auth middleware error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(
      `${frontendUrl}/auth/login?error=auth_error&redirect=/credentials&message=Authentication+error.+Please+try+again`,
    );
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
        secure: process.env.NODE_ENV === 'production',
      });

      console.log('✅ State cookie set: digistate');
      console.log('\n🔀 Redirecting to DigiLocker...');
      console.log('========================================\n');

      res.redirect(authorizeUrl);
    } catch (error) {
      console.error('\n❌❌❌ DigiLocker auth error:', error);
      console.error('Error stack:', error.stack);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(
        `${frontendUrl}/credentials/add?error=digilocker_auth_failed&message=${encodeURIComponent(error.message)}`,
      );
    }
  }),
);

// OAuth callback (no protect middleware - user comes from external redirect)
router.get(
  '/callback',
  asyncHandler(async (req, res) => {
    const { code, state, error, error_description } = req.query;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    console.log('\n========================================');
    console.log('🔄 DIGILOCKER CALLBACK RECEIVED');
    console.log('========================================');
    console.log('Code:', code ? code.substring(0, 20) + '...' : 'N/A');
    console.log('State:', state ? state.substring(0, 20) + '...' : 'N/A');

    // Handle OAuth errors from DigiLocker
    if (error) {
      console.error('❌ DigiLocker OAuth error:', error, error_description);
      return res.redirect(`${frontendUrl}/credentials/add?error=${error}`);
    }

    const cookieState = req.cookies?.digistate;

    // Validate OAuth response
    if (!code) {
      console.error('❌ No authorization code received');
      return res.redirect(`${frontendUrl}/credentials/add?error=no_code`);
    }

    if (!state || !cookieState) {
      console.error('❌ Missing state parameter or cookie');
      return res.redirect(`${frontendUrl}/credentials/add?error=missing_state`);
    }

    if (state !== cookieState) {
      console.error('❌ State mismatch - possible CSRF attack');
      return res.redirect(
        `${frontendUrl}/credentials/add?error=state_mismatch`,
      );
    }

    // Extract user ID from state
    const [randomPart, userId] = state.split(':');
    if (!userId) {
      console.error('❌ Invalid state format - no userId');
      return res.redirect(`${frontendUrl}/credentials/add?error=invalid_state`);
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

    console.log('🔑 Exchanging code for tokens...');
    const tokenResp = await axios.post(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const { access_token, refresh_token, token_type, expires_in, id_token } =
      tokenResp.data;
    console.log('✅ Tokens received');

    console.log('👤 Fetching user info...');
    const userInfoResp = await axios.get(config.digilocker.userInfoUrl, {
      headers: { Authorization: `${token_type} ${access_token}` },
    });
    console.log('✅ User info received:', userInfoResp.data?.name);

    // Update DigiLocker account
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
      { upsert: true, new: true },
    );

    console.log('✅ DigiLocker account linked successfully');

    // Fetch available documents
    console.log('📄 [BACKEND] Fetching documents from DigiLocker...');
    try {
      const filesResp = await axios.get(config.digilocker.filesUrl, {
        headers: { Authorization: `${token_type} ${access_token}` },
      });

      const documents = filesResp.data?.files || filesResp.data || [];
      console.log(
        '📄 [BACKEND] Found',
        documents.length,
        'documents from DigiLocker',
      );
      console.log(
        '📄 [BACKEND] Documents list:',
        documents.map((d) => ({ name: d.name, uri: d.uri })),
      );

      // Store documents in DigiLocker account for retrieval via API
      await DigilockerAccount.findOneAndUpdate(
        { userId },
        {
          cachedDocuments: documents,
          documentsCachedAt: new Date(),
        },
      );
      console.log('✅ [BACKEND] Cached documents in database');

      // Option 1: Try to pass via URL (might fail for large payloads)
      const docsParam = encodeURIComponent(JSON.stringify(documents));
      const maxUrlLength = 2000; // Safe URL length

      console.log('📦 [BACKEND] Encoded documents length:', docsParam.length);
      console.log(
        '🔗 [BACKEND] Will redirect to:',
        `${frontendUrl}/credentials?digilocker=connected`,
      );

      res.clearCookie('digistate');

      // If URL would be too long, just redirect without docs param
      // Frontend will fetch via API instead
      if (docsParam.length > maxUrlLength) {
        console.log(
          '⚠️ [BACKEND] Documents too large for URL params, frontend will fetch via API',
        );
        console.log(
          '✅ [BACKEND] Redirecting to frontend (docs will be fetched via API)...',
        );
        console.log('========================================\n');
        return res.redirect(
          `${frontendUrl}/credentials/add?digilocker=connected`,
        );
      }

      console.log(
        '✅ [BACKEND] Redirecting to frontend with documents in URL...',
      );
      console.log('========================================\n');

      // Redirect to frontend with documents data
      return res.redirect(
        `${frontendUrl}/credentials/add?digilocker=connected&docs=${docsParam}`,
      );
    } catch (err) {
      console.error('❌ [BACKEND] Failed to fetch documents:', err.message);
      res.clearCookie('digistate');
      return res.redirect(
        `${frontendUrl}/credentials/add?digilocker=connected`,
      );
    }
  }),
);

// List Digilocker files
router.get(
  '/files',
  protect,
  asyncHandler(async (req, res) => {
    console.log('\n📄 [BACKEND] /files endpoint called');
    console.log('User ID:', req.user._id);

    const account = await DigilockerAccount.findOne({ userId: req.user._id });
    if (!account || !account.accessToken) {
      console.log('❌ [BACKEND] DigiLocker not connected');
      return res.status(404).json({ message: 'Digilocker not connected' });
    }

    // Check if we have cached documents (less than 5 minutes old)
    const cacheAge = account.documentsCachedAt
      ? Date.now() - account.documentsCachedAt.getTime()
      : Infinity;

    if (account.cachedDocuments && cacheAge < 5 * 60 * 1000) {
      console.log(
        '✅ [BACKEND] Returning cached documents (',
        account.cachedDocuments.length,
        'docs)',
      );
      return res.json({ files: account.cachedDocuments });
    }

    // Otherwise fetch fresh from DigiLocker
    console.log('🔄 [BACKEND] Fetching fresh documents from DigiLocker...');
    try {
      const filesResp = await axios.get(config.digilocker.filesUrl, {
        headers: {
          Authorization: `${account.tokenType} ${account.accessToken}`,
        },
      });

      const files = filesResp.data?.files || filesResp.data || [];
      console.log('✅ [BACKEND] Fetched', files.length, 'documents');

      // Update cache
      account.cachedDocuments = files;
      account.documentsCachedAt = new Date();
      await account.save();

      res.json({ files });
    } catch (error) {
      console.error('❌ [BACKEND] Failed to fetch documents:', error.message);
      // If fetch fails but we have old cache, return it
      if (account.cachedDocuments) {
        console.log('⚠️ [BACKEND] Returning stale cached documents');
        return res.json({ files: account.cachedDocuments });
      }
      throw error;
    }
  }),
);

// Import selected documents into credentials
router.post(
  '/import',
  protect,
  asyncHandler(async (req, res) => {
    console.log('\n========================================');
    console.log('📥 📥 📥 IMPORT DOCUMENTS ENDPOINT CALLED 📥 📥 📥');
    console.log('========================================');
    console.log('User ID:', req.user._id);
    console.log('User Email:', req.user.email);
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Files array:', req.body.files);

    const { files } = req.body; // array of file metadata or URIs
    if (!Array.isArray(files) || files.length === 0) {
      console.log('❌ No files provided in request');
      return res.status(400).json({ message: 'No files provided' });
    }

    console.log('📄 Number of files to import:', files.length);

    const account = await DigilockerAccount.findOne({ userId: req.user._id });
    if (!account || !account.accessToken) {
      console.log('❌ DigiLocker account not connected');
      return res.status(404).json({ message: 'Digilocker not connected' });
    }

    console.log('✅ DigiLocker account found');

    // Import Credential model
    const { default: Credential } =
      await import('../credential/credential.model.js');

    const created = [];
    const errors = [];

    console.log(
      '\n🔄 [BACKEND IMPORT] Starting to process',
      files.length,
      'documents...',
    );

    for (const f of files) {
      try {
        console.log('\n========================================');
        console.log(
          '📄 [BACKEND IMPORT] Processing document:',
          f.name || f.doctype,
        );
        console.log('========================================');
        console.log(
          '📎 PDF File Reference:',
          f.documentFile || 'NOT SPECIFIED',
        );
        console.log('📊 File Size:', f.size || 'Unknown');
        console.log('🔗 Document URI:', f.uri);
        console.log('📁 Category:', f.category);

        // Check if credential already exists to avoid duplicates
        const existingCred = await Credential.findOne({
          user: req.user._id,
          'meta.digilockerFileId': f.uri,
        });

        if (existingCred) {
          console.log(
            '⚠️ Credential already exists for this document, skipping...',
          );
          console.log('   Existing ID:', existingCred._id.toString());
          console.log('   ℹ️ NOTE: PDF files are NOT uploaded to our server');
          console.log(
            '   ℹ️ They remain in DigiLocker and are referenced via URI',
          );
          created.push(existingCred);
          continue;
        }

        console.log('💡 IMPORTANT: PDF File Handling:');
        console.log('   • PDF file reference:', f.documentFile);
        console.log('   • PDFs are NOT uploaded to our backend');
        console.log('   • PDFs remain stored in DigiLocker');
        console.log('   • We only store metadata and DigiLocker URI:', f.uri);
        console.log(
          '   • To view PDF, user would need to fetch from DigiLocker API',
        );

        // Map Digilocker document to Credential schema
        const credentialData = {
          user: req.user._id,
          legalNameSnapshot:
            req.user.name || account.userInfo?.name || 'Unknown',
          certificateName: account.userInfo?.name || req.user.name || 'Unknown',
          title: f.name || f.doctype || f.documentType || 'Digilocker Document',
          issuer:
            f.issuer || f.issuerName || 'DigiLocker (Government of India)',
          issueDate: f.date ? new Date(f.date) : new Date(),
          type:
            f.category === 'skill'
              ? 'certificate'
              : f.category === 'education'
                ? 'certificate'
                : 'other',
          credentialId: f.uri || '',
          sourceUrl: f.uri || f.link || '',
          sourceDomain: 'digilocker.gov.in',
          isDomainTrusted: true,
          isIssuerVerified: true,
          status: 'verified',
          verificationStatus: 'VERIFIED',
          finalVerificationScore: 100,
          autoApproved: true,
          nsqfLevel: f.nsqfLevel || undefined,
          description: f.description || '',
          skills: [],
          meta: {
            source: 'digilocker',
            digilockerFileId: f.uri || f.file_id || null,
            originalData: f,
            schemeName: f.schemeName || '',
            category: f.category || '',
            documentFile: f.documentFile || null, // Store PDF reference
          },
        };

        console.log('📝 Creating NEW credential with data:');
        console.log('   Title:', credentialData.title);
        console.log('   Issuer:', credentialData.issuer);
        console.log('   User:', credentialData.user.toString());
        console.log('   Status:', credentialData.status);
        console.log(
          '   Verification Status:',
          credentialData.verificationStatus,
        );
        console.log('   Issue Date:', credentialData.issueDate);
        console.log('   Type:', credentialData.type);
        console.log(
          '   📎 PDF Reference in meta:',
          credentialData.meta.documentFile,
        );

        const doc = await Credential.create(credentialData);
        console.log(
          '✅ [BACKEND IMPORT] Credential created in DB:',
          doc._id.toString(),
        );
        console.log('   Title:', doc.title);
        console.log('   Status:', doc.status);
        console.log('   Verification Status:', doc.verificationStatus);
        console.log('   📎 PDF stored in meta:', doc.meta?.documentFile);

        // Verify it was actually saved by fetching it back
        const verified = await Credential.findById(doc._id);
        if (!verified) {
          throw new Error('Credential created but not found in database');
        }
        console.log(
          '✅ [BACKEND IMPORT] Verified credential exists in database',
        );
        console.log('========================================');

        created.push(doc);
      } catch (err) {
        console.error(
          '❌ Failed to create credential for',
          f.name,
          ':',
          err.message,
        );
        console.error('   Full error:', err);
        errors.push({ file: f.name, error: err.message });
      }
    }

    console.log('\n========================================');
    console.log('📊 Import Summary:');
    console.log('  Successfully imported:', created.length);
    console.log('  Failed:', errors.length);
    console.log('========================================\n');

    res.json({
      message: 'Import completed',
      count: created.length,
      credentials: created,
      errors: errors.length > 0 ? errors : undefined,
    });
  }),
);

export default router;
