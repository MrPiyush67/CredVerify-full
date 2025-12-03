import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { authCodes, accessTokens } from './data/stores.js';
import { cleanupExpiredData } from './utils/tokenManager.js';
import { getHomePage } from './templates/home.js';
import oauthRoutes from './routes/oauth.js';
import apiRoutes from './routes/api.js';

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
const PORT = config.port;

// Middleware
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true, // Allow cookies and authorization headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

console.log('🚀 Setting up routes...');

// Routes
app.use('/public/oauth2/1', oauthRoutes);
console.log('✅ OAuth routes mounted on /public/oauth2/1');

app.use('/public/oauth2/1', apiRoutes);
console.log('✅ API routes mounted on /public/oauth2/1');

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('🏥 Health check called');
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
  console.log('🏠 Home page requested');
  const html = getHomePage(
    PORT,
    config.mockUser.email,
    config.mockUser.password,
    config.validClientId,
    config.validClientSecret
  );
  console.log('📄 Home page HTML length:', html.length);
  res.setHeader('Content-Type', 'text/html');
  res.send(html);
});

// Clean up expired codes and tokens periodically
setInterval(() => {
  cleanupExpiredData();
}, config.cleanupInterval);

const server = app.listen(PORT, () => {
  console.log(`\n🚀 Mock DigiLocker Server running on http://localhost:${PORT}`);
  console.log(`📝 Demo user: ${config.mockUser.email}`);
  console.log(`🔑 Password: ${config.mockUser.password}\n`);
  console.log(`🔗 Test URL: http://localhost:${PORT}/public/oauth2/1/authorize?response_type=code&client_id=${config.validClientId}&redirect_uri=http://localhost:5000/callback&scope=profile%20documents\n`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please free the port and try again.`);
  } else {
    console.error('❌ Server error:', error);
  }
  process.exit(1);
});
