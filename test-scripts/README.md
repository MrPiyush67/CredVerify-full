# Test Scripts

Comprehensive test suite for CredVerify platform.

## 📁 Directory Structure

```
test-scripts/
├── authentication/
│   └── test-auth.js                    # Login, signup, token tests
├── verification/
│   ├── test-extension-flow.js          # Extension verification flow
│   ├── test-manual-flow.js             # Manual URL verification flow
│   └── test-verification-scoring.js    # Score calculation tests
├── blockchain/
│   ├── test-ipfs.js                    # IPFS upload tests
│   ├── test-blockchain.js              # Blockchain connection
│   ├── test-onchain.js                 # Smart contract tests
│   └── test-full-pipeline.js           # Complete blockchain flow
├── integration/
│   ├── test-end-to-end.js              # Full user workflows
│   └── test-digilocker.js              # DigiLocker OAuth flow
├── platforms/
│   └── platforms-manager.js            # Platform registry management
└── data/
    └── test-data.json                  # Shared test data
```

## 🧪 Running Tests

### Quick Test (All Core Features)
```bash
npm test
```

### Individual Test Suites

**Authentication**:
```bash
node test-scripts/authentication/test-auth.js
```

**Verification**:
```bash
# Extension flow (with pre-captured screenshot)
node verification/test-extension-flow.js

# Manual flow (with URL scraping)
node verification/test-manual-flow.js

# Scoring system
node verification/test-verification-scoring.js

# Test all certificates from test.json (batch)
npm run test:all-certs

# Test a single certificate by index (default: 0)
npm run test:single-cert
node verification/test-single-certificate.js 0

# Complete extension flow (auth + upload)
npm run test:extension-flow
```

**Blockchain**:
```bash
cd test-scripts/blockchain

# Individual components
node test-ipfs.js
node test-blockchain.js
node test-onchain.js

# Full pipeline
node test-full-pipeline.js
```

**Integration**:
```bash
# End-to-end user workflows
node test-scripts/integration/test-end-to-end.js

# DigiLocker OAuth
node test-scripts/integration/test-digilocker.js
```

**Platform Management**:
```bash
# List all platforms
node test-scripts/platforms/platforms-manager.js list

# Add platform
node test-scripts/platforms/platforms-manager.js add <id> <name> <category> <domain>

# Search by domain
node test-scripts/platforms/platforms-manager.js search <domain>

# Remove platform
node test-scripts/platforms/platforms-manager.js remove <id>
```

## 📊 Test Data

**test-data.json** contains shared test data:
- User credentials (test accounts for all roles)
- Sample certificates (URLs, images)
- Expected verification results
- Platform test cases

## 🎯 Test Coverage

### Authentication Tests
- ✅ User signup (all roles)
- ✅ User login
- ✅ Token generation & validation
- ✅ JWT expiry handling
- ✅ Cookie-based auth

### Verification Tests
- ✅ Extension verification flow (9 stages)
- ✅ Manual verification flow (10 stages)
- ✅ OCR extraction accuracy
- ✅ LLM metadata parsing
- ✅ Domain validation (whitelisting)
- ✅ Name matching (fuzzy matching)
- ✅ Score calculation (weighted)
- ✅ Auto-approval logic

### Blockchain Tests
- ✅ IPFS upload to Pinata
- ✅ Blockchain connection (Sepolia)
- ✅ Smart contract deployment
- ✅ On-chain registration
- ✅ Fingerprint computation
- ✅ Transaction verification

### Integration Tests
- ✅ Complete verification workflow (user → credential → verification → save)
- ✅ DigiLocker OAuth flow (mock server)
- ✅ Job application workflow
- ✅ Chat messaging
- ✅ Notifications

## 🔧 Configuration

Edit test scripts to change:

**Backend URL**:
```javascript
const BACKEND_URL = 'http://localhost:5000';
```

**Test User**:
```javascript
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123'
};
```

**Test Certificate**:
```javascript
const TEST_CERT_URL = 'https://coursera.org/verify/ABC123';
```

## 📝 Creating New Tests

Template for new test script:

```javascript
/**
 * Test: [Feature Name]
 * Purpose: [What this test validates]
 */

import { test } from '../utils/test-helpers.js';

async function testFeature() {
  console.log('🧪 Testing [Feature]...\n');

  try {
    // Arrange
    const testData = { ... };
    
    // Act
    const result = await yourFeatureFunction(testData);
    
    // Assert
    test.assertEqual(result.status, 'success', 'Status should be success');
    test.assertTrue(result.data, 'Data should exist');
    
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testFeature();
```

## 🐛 Debugging Tests

**Enable verbose logging**:
```bash
DEBUG=* node test-script.js
```

**Check backend logs**:
```bash
# In backend terminal
tail -f backend.log
```

**Inspect network requests**:
- Use `--inspect` flag with Node.js
- Chrome DevTools for debugging

## 📚 Documentation

For complete testing guide, see: [/md-files/TESTING-GUIDE.md](../md-files/TESTING-GUIDE.md)

---

**Last Updated**: December 4, 2025
