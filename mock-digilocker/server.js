import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

// Error handling - must be at the top
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 6000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory storage for sessions and codes
const authCodes = new Map(); // code -> { redirectUri, userId }
const accessTokens = new Map(); // token -> { userId, expiresAt }

// Mock user database
const mockUsers = {
  'testuser@digilocker.mock': {
    email: 'testuser@digilocker.mock',
    password: 'Test@123', // In real app, this would be hashed
    name: process.env.MOCK_USER_NAME || 'Test User',
    dob: process.env.MOCK_USER_DOB || '1990-01-01',
    aadhaar: process.env.MOCK_USER_AADHAAR || '1234-5678-9012',
    userId: 'mock-user-001'
  }
};

// Mock documents for each user
const mockDocuments = {
  'mock-user-001': [
    {
      uri: 'digilocker://issued/NSDC/CERT001',
      doctype: 'CERT',
      name: 'Certificate in Artificial Intelligence Fundamentals',
      issuer: 'NSDC (National Skill Development Corporation)',
      issuerName: 'NSDC',
      date: '2024-01-15',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 4,
      schemeName: 'PMKVY 4.0',
      description: 'Micro-credential certification in AI basics covering machine learning fundamentals',
      size: '245KB'
    },
    {
      uri: 'digilocker://issued/MHRD/EDU002',
      doctype: 'EDU',
      name: 'Full Stack Web Development Certificate',
      issuer: 'Ministry of Education',
      issuerName: 'MoE',
      date: '2024-02-20',
      type: 'certificate',
      category: 'education',
      nsqfLevel: 5,
      schemeName: 'NSQF',
      description: 'Advanced micro-credential in MERN stack development',
      size: '312KB'
    },
    {
      uri: 'digilocker://issued/IGNOU/CERT003',
      doctype: 'CERT',
      name: 'Data Science and Analytics Certificate',
      issuer: 'IGNOU',
      issuerName: 'IGNOU',
      date: '2024-03-10',
      type: 'certificate',
      category: 'skill',
      nsqfLevel: 6,
      schemeName: 'SWAYAM',
      description: 'Comprehensive data science micro-credential',
      size: '289KB'
    },
    {
      uri: 'digilocker://issued/NPTEL/CERT004',
      doctype: 'CERT',
      name: 'Cloud Computing Essentials',
      issuer: 'NPTEL',
      issuerName: 'NPTEL',
      date: '2024-04-05',
      type: 'certificate',
      category: 'technology',
      nsqfLevel: 5,
      schemeName: 'NPTEL Online',
      description: 'Cloud computing fundamentals and AWS basics',
      size: '198KB'
    }
  ]
};

// 1. Authorization endpoint (OAuth Step 1)
app.get('/public/oauth2/1/authorize', (req, res) => {
  const { response_type, client_id, redirect_uri, state, scope } = req.query;

  // Validate required parameters
  if (!response_type || !client_id || !redirect_uri) {
    return res.status(400).send(`
      <html>
        <head><title>Mock DigiLocker - Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #d32f2f;">Error: Invalid Request</h2>
            <p>Missing required parameters: response_type, client_id, or redirect_uri</p>
            <a href="/" style="color: #1976d2;">Go back</a>
          </div>
        </body>
      </html>
    `);
  }

  // Validate client_id
  if (client_id !== process.env.VALID_CLIENT_ID) {
    return res.status(401).send(`
      <html>
        <head><title>Mock DigiLocker - Error</title></head>
        <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #d32f2f;">Error: Invalid Client</h2>
            <p>The client_id provided is not recognized.</p>
            <p style="font-size: 12px; color: #666;">Expected: ${process.env.VALID_CLIENT_ID}</p>
          </div>
        </body>
      </html>
    `);
  }

  // Show login page
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock DigiLocker - Login</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 450px;
            width: 100%;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h1 {
            font-size: 24px;
            margin-bottom: 8px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .app-info {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .app-info p {
            font-size: 13px;
            color: #666;
            margin-bottom: 5px;
          }
          .app-info strong {
            color: #333;
          }
          .form-group {
            margin-bottom: 20px;
          }
          label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
            font-size: 14px;
          }
          input {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s;
          }
          input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          .btn {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }
          .btn:active {
            transform: translateY(0);
          }
          .demo-creds {
            background: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 12px 15px;
            margin-top: 20px;
            border-radius: 4px;
          }
          .demo-creds p {
            font-size: 12px;
            color: #1976d2;
            margin-bottom: 5px;
          }
          .demo-creds code {
            background: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
          .error {
            background: #ffebee;
            border-left: 4px solid #d32f2f;
            color: #c62828;
            padding: 12px 15px;
            margin-bottom: 20px;
            border-radius: 4px;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Mock DigiLocker</h1>
            <p>Sandbox Environment for Testing</p>
          </div>
          <div class="content">
            <div class="app-info">
              <p><strong>App requesting access:</strong> CredVerify Platform</p>
              <p><strong>Client ID:</strong> ${client_id}</p>
              <p><strong>Requested scope:</strong> ${scope || 'profile documents'}</p>
            </div>
            
            <form method="POST" action="/public/oauth2/1/login">
              <input type="hidden" name="client_id" value="${client_id}" />
              <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
              <input type="hidden" name="state" value="${state || ''}" />
              <input type="hidden" name="scope" value="${scope || ''}" />
              
              <div class="form-group">
                <label for="email">Email / Username</label>
                <input 
                  type="text" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email"
                  required
                  autocomplete="username"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password"
                  required
                  autocomplete="current-password"
                />
              </div>
              
              <button type="submit" class="btn">Sign In to DigiLocker</button>
            </form>
            
            <div class="demo-creds">
              <p><strong>📝 Demo Credentials:</strong></p>
              <p>Email: <code>${process.env.MOCK_USER_EMAIL}</code></p>
              <p>Password: <code>${process.env.MOCK_USER_PASSWORD}</code></p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 2. Login endpoint (validates credentials and shows consent)
app.post('/public/oauth2/1/login', (req, res) => {
  const { email, password, client_id, redirect_uri, state, scope } = req.body;

  // Validate credentials
  const user = mockUsers[email];
  if (!user || user.password !== password) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Mock DigiLocker - Login Failed</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              max-width: 450px;
              text-align: center;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            .error-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h2 { color: #d32f2f; margin-bottom: 15px; }
            p { color: #666; margin-bottom: 25px; }
            .btn {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="error-icon">❌</div>
            <h2>Login Failed</h2>
            <p>Invalid email or password. Please try again.</p>
            <a href="/public/oauth2/1/authorize?response_type=code&client_id=${client_id}&redirect_uri=${encodeURIComponent(redirect_uri)}&state=${state || ''}&scope=${scope || ''}" class="btn">
              Try Again
            </a>
          </div>
        </body>
      </html>
    `);
  }

  // Show consent screen
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock DigiLocker - Authorize Access</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
            padding: 25px 30px;
            text-align: center;
          }
          .header h2 {
            font-size: 20px;
            margin-bottom: 8px;
          }
          .user-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
          }
          .content {
            padding: 30px;
          }
          .app-request {
            background: #f5f5f5;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
          }
          .app-request h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
          }
          .permissions {
            list-style: none;
          }
          .permissions li {
            padding: 10px 0;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            align-items: center;
            font-size: 14px;
            color: #555;
          }
          .permissions li:last-child {
            border-bottom: none;
          }
          .permissions li::before {
            content: "✓";
            color: #4caf50;
            font-weight: bold;
            margin-right: 12px;
            font-size: 18px;
          }
          .document-count {
            background: #e3f2fd;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 25px;
            text-align: center;
          }
          .document-count strong {
            color: #1976d2;
            font-size: 24px;
            display: block;
            margin-bottom: 5px;
          }
          .document-count span {
            color: #666;
            font-size: 14px;
          }
          .actions {
            display: flex;
            gap: 15px;
          }
          .btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-approve {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: white;
          }
          .btn-approve:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(76, 175, 80, 0.4);
          }
          .btn-deny {
            background: #f5f5f5;
            color: #666;
          }
          .btn-deny:hover {
            background: #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Login Successful</h2>
            <div class="user-badge">👤 ${user.name}</div>
          </div>
          <div class="content">
            <div class="app-request">
              <h3>CredVerify Platform requests access to:</h3>
              <ul class="permissions">
                <li>View your profile information</li>
                <li>Access your issued documents</li>
                <li>Read document metadata</li>
              </ul>
            </div>
            
            <div class="document-count">
              <strong>${mockDocuments[user.userId]?.length || 0}</strong>
              <span>documents available in your locker</span>
            </div>
            
            <form method="POST" action="/public/oauth2/1/approve">
              <input type="hidden" name="redirect_uri" value="${redirect_uri}" />
              <input type="hidden" name="state" value="${state || ''}" />
              <input type="hidden" name="userId" value="${user.userId}" />
              
              <div class="actions">
                <button type="button" onclick="window.close()" class="btn btn-deny">
                  Deny
                </button>
                <button type="submit" class="btn btn-approve">
                  Authorize Access
                </button>
              </div>
            </form>
          </div>
        </div>
      </body>
    </html>
  `);
});

// 3. Approve endpoint (generates authorization code)
app.post('/public/oauth2/1/approve', (req, res) => {
  const { redirect_uri, state, userId } = req.body;
  
  // Generate authorization code
  const code = `MOCK_CODE_${crypto.randomBytes(16).toString('hex')}`;
  
  // Store code with metadata
  authCodes.set(code, {
    redirectUri: redirect_uri,
    userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
  });
  
  // Redirect back to application
  const url = new URL(redirect_uri);
  url.searchParams.set('code', code);
  if (state) url.searchParams.set('state', state);
  
  res.redirect(url.toString());
});

// 4. Token endpoint (exchanges code for access token)
app.post('/public/oauth2/1/token', (req, res) => {
  const { grant_type, code, client_id, client_secret, redirect_uri } = req.body;
  
  // Validate grant type
  if (grant_type !== 'authorization_code') {
    return res.status(400).json({
      error: 'unsupported_grant_type',
      error_description: 'Only authorization_code grant type is supported'
    });
  }
  
  // Validate client credentials
  if (client_id !== process.env.VALID_CLIENT_ID || client_secret !== process.env.VALID_CLIENT_SECRET) {
    return res.status(401).json({
      error: 'invalid_client',
      error_description: 'Invalid client credentials'
    });
  }
  
  // Validate authorization code
  const authData = authCodes.get(code);
  if (!authData) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Invalid or expired authorization code'
    });
  }
  
  // Check if code is expired
  if (Date.now() > authData.expiresAt) {
    authCodes.delete(code);
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Authorization code has expired'
    });
  }
  
  // Validate redirect URI
  if (redirect_uri !== authData.redirectUri) {
    return res.status(400).json({
      error: 'invalid_grant',
      error_description: 'Redirect URI mismatch'
    });
  }
  
  // Generate access token
  const accessToken = `MOCK_ACCESS_${crypto.randomBytes(32).toString('hex')}`;
  const refreshToken = `MOCK_REFRESH_${crypto.randomBytes(32).toString('hex')}`;
  
  // Store access token
  accessTokens.set(accessToken, {
    userId: authData.userId,
    createdAt: Date.now(),
    expiresAt: Date.now() + 3600 * 1000 // 1 hour
  });
  
  // Delete used authorization code
  authCodes.delete(code);
  
  // Return token response
  res.json({
    access_token: accessToken,
    token_type: 'Bearer',
    expires_in: 3600,
    refresh_token: refreshToken,
    scope: 'profile documents'
  });
});

// Middleware to verify access token
function requireAuth(req, res, next) {
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

// 5. User info endpoint
app.get('/public/oauth2/1/user_info', requireAuth, (req, res) => {
  const user = Object.values(mockUsers).find(u => u.userId === req.userId);
  
  if (!user) {
    return res.status(404).json({ error: 'user_not_found' });
  }
  
  res.json({
    sub: user.userId,
    name: user.name,
    email: user.email,
    dob: user.dob,
    aadhaar: user.aadhaar
  });
});

// 6. Files/Documents endpoint
app.get('/public/oauth2/1/files', requireAuth, (req, res) => {
  const documents = mockDocuments[req.userId] || [];
  
  res.json({
    files: documents,
    count: documents.length
  });
});

// 7. Download document endpoint
app.post('/public/oauth2/1/files/download', requireAuth, (req, res) => {
  const { uri } = req.body;
  
  const documents = mockDocuments[req.userId] || [];
  const doc = documents.find(d => d.uri === uri);
  
  if (!doc) {
    return res.status(404).json({
      error: 'document_not_found',
      error_description: 'The requested document was not found'
    });
  }
  
  // Generate fake PDF content (in real scenario, this would be actual PDF bytes)
  const fakePdfContent = `Mock PDF Content for: ${doc.name}\nIssuer: ${doc.issuer}\nDate: ${doc.date}`;
  const base64Content = Buffer.from(fakePdfContent).toString('base64');
  
  res.json({
    uri: doc.uri,
    mimeType: 'application/pdf',
    fileContentBase64: base64Content,
    filename: `${doc.name.replace(/[^a-z0-9]/gi, '_')}.pdf`,
    size: doc.size,
    metadata: doc
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Mock DigiLocker Server',
    timestamp: new Date().toISOString(),
    activeTokens: accessTokens.size,
    activeCodes: authCodes.size
  });
});

// Home page
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock DigiLocker Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          .status { color: #4caf50; font-weight: 600; }
          code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
          }
          ul { line-height: 2; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🔐 Mock DigiLocker Server</h1>
          <p class="status">✅ Server is running on port ${PORT}</p>
          <p>This is a mock DigiLocker sandbox server for testing OAuth integration locally.</p>
        </div>
        
        <div class="card">
          <h3>📋 Available Endpoints</h3>
          <ul>
            <li><code>GET /public/oauth2/1/authorize</code> - Authorization endpoint</li>
            <li><code>POST /public/oauth2/1/token</code> - Token endpoint</li>
            <li><code>GET /public/oauth2/1/user_info</code> - User info</li>
            <li><code>GET /public/oauth2/1/files</code> - List documents</li>
            <li><code>POST /public/oauth2/1/files/download</code> - Download document</li>
            <li><code>GET /health</code> - Health check</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🔑 Demo Credentials</h3>
          <p>Email: <code>${process.env.MOCK_USER_EMAIL}</code></p>
          <p>Password: <code>${process.env.MOCK_USER_PASSWORD}</code></p>
          <p>Client ID: <code>${process.env.VALID_CLIENT_ID}</code></p>
          <p>Client Secret: <code>${process.env.VALID_CLIENT_SECRET}</code></p>
        </div>
      </body>
    </html>
  `);
});

// Clean up expired codes and tokens periodically
setInterval(() => {
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
}, 5 * 60 * 1000); // Every 5 minutes

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Mock DigiLocker Server running on http://localhost:${PORT}`);
  console.log(`📝 Demo user: ${process.env.MOCK_USER_EMAIL}`);
  console.log(`🔑 Password: ${process.env.MOCK_USER_PASSWORD}\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please free the port and try again.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
