# Testing Guide - CredVerify

Complete guide for testing all components of the CredVerify platform.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Backend Testing](#backend-testing)
4. [Frontend Testing](#frontend-testing)
5. [Extension Testing](#extension-testing)
6. [Blockchain Testing](#blockchain-testing)
7. [Integration Testing](#integration-testing)
8. [Manual Testing](#manual-testing)
9. [Test Scripts](#test-scripts)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Testing Strategy

CredVerify uses a combination of:

1. **Manual Testing**: User workflows, UI testing
2. **Integration Tests**: End-to-end feature testing
3. **API Tests**: Backend endpoint testing
4. **Unit Tests**: Individual component testing (TODO)

### Test Coverage

- ✅ **Backend**: API endpoints, verification pipeline, blockchain integration
- ✅ **Frontend**: Manual testing, user flows
- ✅ **Extension**: Platform detection, verification flow
- ✅ **Blockchain**: Smart contract, IPFS, on-chain registration
- ⚠️ **Automated Tests**: Not yet implemented (recommended: Vitest, Jest, Playwright)

---

## Test Environment Setup

### Prerequisites

1. **Backend Running**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

2. **Frontend Running**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env
   npm run dev
   ```

3. **Database**
   - MongoDB running on `localhost:27017` or MongoDB Atlas
   - Database seeded with test data (optional)

4. **Test Accounts**
   - Create test accounts for each role:
     - Learner: `test-learner@example.com`
     - Regulator: `test-regulator@example.com`
     - Employer: `test-employer@example.com`

### Seeding Test Data

```bash
cd backend
npm run seed
```

This creates:
- Sample users (all roles)
- Sample credentials
- Sample jobs
- Sample notifications
- Sample chat messages

---

## Backend Testing

### API Endpoint Testing

#### Using Test Scripts

**Test Authentication**:
```bash
cd test-scripts
node test-1-auth.js
```

Expected output:
```
✅ Signup test passed
✅ Login test passed
✅ Get profile test passed
✅ Logout test passed
```

**Test Verification API**:
```bash
node test-3-verify-api.js
```

Expected output:
```
✅ Upload credential test passed
✅ Verify credential test passed
✅ Get credentials test passed
```

#### Using cURL

**Signup**:
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "learner"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Get Credentials** (with cookie):
```bash
curl http://localhost:5000/api/credentials \
  -b cookies.txt
```

#### Using Postman/Thunder Client

1. Import collection from `test-scripts/postman-collection.json` (TODO)
2. Set environment variables:
   - `API_URL`: `http://localhost:5000/api`
3. Run collection

### Verification Pipeline Testing

**Test Full Pipeline**:
```bash
cd backend
node test-scripts/test-verification-system.js
```

Tests:
- ✅ OCR extraction
- ✅ LLM metadata parsing
- ✅ Domain validation
- ✅ Name matching
- ✅ Score calculation
- ✅ Database save
- ✅ IPFS upload (if configured)
- ✅ Blockchain registration (if configured)

**Test Extension Verification**:
```bash
node test-scripts/test-extension-verification.js
```

**Test Manual Verification**:
```bash
node test-scripts/test-platform-verification.js
```

### Database Testing

**Check Database State**:
```bash
mongosh
> use credverify
> db.users.countDocuments()
> db.credentials.find().pretty()
> db.jobs.countDocuments()
```

**Clear Test Data**:
```bash
mongosh
> use credverify
> db.dropDatabase()
```

Then re-seed:
```bash
cd backend
npm run seed
```

---

## Frontend Testing

### Manual Testing Checklist

#### Authentication Flow

- [ ] **Signup**
  1. Go to `http://localhost:5173/signup`
  2. Fill form with valid data
  3. Select role (Learner/Regulator/Employer)
  4. Click "Sign Up"
  5. Should redirect to `/home`
  6. Check user data in UI

- [ ] **Login**
  1. Go to `http://localhost:5173/login`
  2. Enter credentials
  3. Click "Login"
  4. Should redirect to `/home`

- [ ] **Logout**
  1. Click logout button
  2. Should redirect to `/login`
  3. Try accessing `/home` → should redirect to `/login`

#### Credential Management (Learner)

- [ ] **Upload Credential**
  1. Login as learner
  2. Go to `/credentials/add`
  3. Upload certificate image
  4. Click "Verify"
  5. Wait for verification (10-30s)
  6. Check results displayed
  7. Verify saved in `/credentials`

- [ ] **View Credentials**
  1. Go to `/credentials`
  2. Check all credentials displayed
  3. Test filters (status, date, platform)
  4. Click credential to view details

- [ ] **Edit Credential**
  1. Click "Edit" on a credential
  2. Modify fields
  3. Click "Save"
  4. Verify changes saved

- [ ] **Delete Credential**
  1. Click "Delete" on a credential
  2. Confirm deletion
  3. Verify removed from list

#### Verification Queue (Regulator)

- [ ] **View Pending Requests**
  1. Login as regulator
  2. Go to `/requests`
  3. Check pending credentials displayed

- [ ] **Approve Credential**
  1. Click "Review" on pending credential
  2. Check OCR data, LLM metadata
  3. Click "Approve"
  4. Verify status changed to "Verified"

- [ ] **Reject Credential**
  1. Click "Review" on pending credential
  2. Click "Reject"
  3. Enter reason
  4. Verify status changed to "Rejected"

#### Job Management (Employer)

- [ ] **Post Job**
  1. Login as employer
  2. Go to `/post-job`
  3. Fill job form
  4. Click "Post Job"
  5. Verify job in `/jobs`

- [ ] **Edit Job**
  1. Go to `/jobs`
  2. Click "Edit" on your job
  3. Modify fields
  4. Save
  5. Verify changes

- [ ] **View Applications**
  1. Go to your job posting
  2. Click "View Applications"
  3. Check applicants list
  4. View applicant profiles

### Browser Compatibility

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Responsive Design

Test on:
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)

---

## Extension Testing

### Installation Testing

- [ ] **Chrome Installation**
  1. Load unpacked extension
  2. Check no console errors
  3. Extension icon appears in toolbar

- [ ] **Firefox Installation**
  1. Load temporary add-on
  2. Check no console errors
  3. Extension icon appears

### Functionality Testing

- [ ] **Login**
  1. Click extension icon
  2. Enter credentials
  3. Click "Login"
  4. Should show logged-in state

- [ ] **Domain Detection**
  1. Visit whitelisted domain (e.g., coursera.org)
  2. Open extension
  3. Should show green checkmark + platform name
  4. Visit non-whitelisted domain
  5. Should show warning message

- [ ] **Image Selection**
  1. Visit coursera.org certificate page
  2. Open extension
  3. Check images detected
  4. Click an image to select
  5. Preview should appear

- [ ] **Verification**
  1. Select certificate image
  2. Click "Verify Certificate"
  3. Wait for verification
  4. Check results displayed
  5. Verify saved in web app

- [ ] **Anti-Tamper**
  1. Select certificate image
  2. Wait 6+ minutes
  3. Click "Verify"
  4. Should show "fingerprint expired" error

### Platform Testing

Test on each supported platform:

**MOOCs**:
- [ ] Coursera (coursera.org)
- [ ] Udemy (udemy.com)
- [ ] edX (edx.org)
- [ ] Udacity (udacity.com)

**Tech Companies**:
- [ ] Google (google.com/certificates)
- [ ] IBM (ibm.com/training)
- [ ] Microsoft (microsoft.com/learn)

**Others**:
- [ ] LinkedIn Learning (linkedin.com/learning)
- [ ] Kaggle (kaggle.com)
- [ ] DeepLearning.AI (deeplearning.ai)

### Error Handling

- [ ] **Network Error**
  1. Disconnect internet
  2. Try verification
  3. Should show error message

- [ ] **Invalid Credentials**
  1. Login with wrong password
  2. Should show error

- [ ] **Session Expiry**
  1. Wait 7+ days after login
  2. Try verification
  3. Should redirect to login

---

## Blockchain Testing

### IPFS Testing

**Test Upload**:
```bash
cd backend
node test-scripts/blockchain/test-ipfs.js
```

Expected output:
```
✅ IPFS Upload Test
CID: QmXXX...
Gateway URL: https://gateway.pinata.cloud/ipfs/QmXXX...
```

Verify:
1. Copy gateway URL
2. Open in browser
3. Image should load

### Blockchain Connection Testing

**Test Connection**:
```bash
node test-scripts/blockchain/test-blockchain.js
```

Expected output:
```
✅ Blockchain Connection Test
Network: sepolia (chain ID: 11155111)
Wallet: 0xYourAddress
Balance: 0.053 ETH
Contract exists: true
```

### On-Chain Registration Testing

**Test Registration**:
```bash
node test-scripts/blockchain/test-onchain.js
```

Expected output:
```
✅ Fingerprint computed
✅ Transaction sent
✅ Transaction confirmed
TX Hash: 0xabc123...
Block: 9767061
Gas Used: 140,563
```

Verify on Etherscan:
1. Copy transaction hash
2. Visit https://sepolia.etherscan.io/tx/{txHash}
3. Check status: "Success"

### Full Pipeline Testing

**Test Complete Flow**:
```bash
node test-scripts/blockchain/test-full-pipeline.js
```

Tests:
1. ✅ IPFS upload
2. ✅ Fingerprint computation
3. ✅ On-chain registration
4. ✅ Database save
5. ✅ Verification via getRecord()

---

## Integration Testing

### End-to-End Workflows

#### Workflow 1: Extension Verification

1. **Setup**:
   - Backend running
   - Frontend running
   - Extension installed
   - User logged in (learner)

2. **Steps**:
   1. Visit coursera.org certificate page
   2. Open extension
   3. Select certificate image
   4. Click "Verify Certificate"
   5. Wait for verification
   6. Check results in extension
   7. Go to web app `/credentials`
   8. Verify credential saved

3. **Expected**:
   - ✅ OCR extracts text
   - ✅ LLM parses metadata
   - ✅ Domain validated
   - ✅ Name matched
   - ✅ Score calculated
   - ✅ IPFS upload successful
   - ✅ Blockchain registration successful
   - ✅ Saved to database
   - ✅ Visible in web app

#### Workflow 2: Manual Verification

1. **Setup**:
   - Backend running
   - Frontend running
   - User logged in (learner)

2. **Steps**:
   1. Go to `/credentials/add`
   2. Select "Manual URL Verification"
   3. Enter certificate URL
   4. Click "Verify"
   5. Wait for verification (30-60s)
   6. Check results
   7. Click "Save"

3. **Expected**:
   - ✅ Screenshot captured via Puppeteer
   - ✅ OCR extracts text
   - ✅ LLM parses metadata
   - ✅ All pipeline stages complete
   - ✅ Credential saved

#### Workflow 3: Job Application

1. **Setup**:
   - Learner with verified credentials
   - Employer with posted job

2. **Steps**:
   1. Login as learner
   2. Go to `/jobs`
   3. Find job posting
   4. Click "Apply"
   5. Select credentials to attach
   6. Submit application
   7. Logout
   8. Login as employer
   9. Go to job posting
   10. View applications

3. **Expected**:
   - ✅ Application submitted
   - ✅ Employer sees application
   - ✅ Credentials attached and visible

---

## Manual Testing

### Quick Start Testing

**5-Minute Smoke Test**:

1. ✅ Backend starts without errors
2. ✅ Frontend starts without errors
3. ✅ Can signup new user
4. ✅ Can login with new user
5. ✅ Can upload credential (manual)
6. ✅ Credential appears in list
7. ✅ Can logout

### Comprehensive Testing

**30-Minute Full Test**:

**Authentication** (5 min):
- [ ] Signup (all roles)
- [ ] Login
- [ ] Logout
- [ ] Invalid credentials handling

**Credentials** (10 min):
- [ ] Upload via extension
- [ ] Upload via manual URL
- [ ] Upload via QR code (TODO)
- [ ] View credentials
- [ ] Filter credentials
- [ ] Edit credential
- [ ] Delete credential

**Verification** (5 min):
- [ ] Extension verification (whitelisted domain)
- [ ] Manual verification (URL)
- [ ] DigiLocker import (if configured)

**Jobs** (5 min):
- [ ] Post job (employer)
- [ ] Browse jobs
- [ ] Apply to job (learner)
- [ ] View applications (employer)

**Chat** (3 min):
- [ ] Send message
- [ ] Receive message
- [ ] Real-time updates

**Notifications** (2 min):
- [ ] Receive notification
- [ ] Mark as read
- [ ] View all notifications

---

## Test Scripts

### Directory Structure

```
test-scripts/
├── run-tests.js                    # Main test runner
├── package.json                    # Test dependencies
│
├── authentication/
│   └── test-auth.js                # Login, signup, token tests
│
├── verification/
│   ├── test-extension-flow.js      # Extension verification (9 stages)
│   ├── test-manual-flow.js         # Manual URL verification (10 stages)
│   └── test-verification-scoring.js # Score calculation tests
│
├── blockchain/
│   ├── test-ipfs.js                # IPFS upload tests
│   ├── test-blockchain.js          # Blockchain connection
│   ├── test-onchain.js             # Smart contract tests
│   ├── test-full-pipeline.js       # Complete blockchain flow
│   └── test-updated-pipeline.js    # Latest pipeline changes
│
├── integration/
│   ├── test-end-to-end.js          # Full user workflows
│   └── test-digilocker.js          # DigiLocker OAuth flow
│
├── platforms/
│   └── platforms-manager.js        # Platform registry CLI tool
│
├── utils/
│   └── test-helpers.js             # Shared test utilities
│
└── data/
    └── test-data.json              # Shared test data
```

### Running Tests

**Run All Tests**:
```bash
cd test-scripts
npm install
npm test
```

**Run Specific Test Suites**:
```bash
# Authentication tests only
npm run test:auth

# Verification tests only
npm run test:verification

# Blockchain tests only
npm run test:blockchain

# Integration tests only
npm run test:integration

# Quick smoke test
npm run test:quick
```

**Run Individual Tests**:
```bash
# Authentication
node authentication/test-auth.js

# Verification
node verification/test-extension-flow.js
node verification/test-manual-flow.js
node verification/test-verification-scoring.js

# Blockchain
cd blockchain
node test-ipfs.js
node test-blockchain.js
node test-onchain.js
node test-full-pipeline.js

# Integration
node integration/test-end-to-end.js
node integration/test-digilocker.js
```

### Test Utilities

The `utils/test-helpers.js` provides:
- **Colored logging**: `log(message, color)`
- **Assertions**: `assert.equal()`, `assert.assertTrue()`, etc.
- **Test runner**: `TestRunner` class
- **HTTP helpers**: `fetchJSON()`, `retry()`
- **Data generators**: `generateTestUser()`
- **Formatters**: `formatBytes()`, `formatDuration()`, `printTable()`

---

## Troubleshooting

### Backend Issues

**Backend won't start**:
- Check MongoDB is running: `mongosh`
- Check `.env` file exists and has correct values
- Check no other process on port 5000: `lsof -i :5000` (Unix) or `netstat -ano | findstr :5000` (Windows)

**API returns 401**:
- Check JWT_SECRET is set in `.env`
- Check cookies are enabled in request
- Try re-login to get new token

**Verification fails**:
- Check Gemini API key is valid
- Check Tesseract is installed (for OCR)
- Check image URL is accessible
- Check domain is whitelisted in `platforms.json`

### Frontend Issues

**Frontend won't start**:
- Check `VITE_API_URL` in `.env`
- Check backend is running
- Clear cache: `rm -rf node_modules/.vite`

**Login doesn't work**:
- Open browser DevTools → Network tab
- Check API calls to backend
- Check CORS errors
- Verify `withCredentials: true` in axios config

**Credentials not showing**:
- Check Redux state in DevTools
- Check API response in Network tab
- Verify user role is "learner"

### Extension Issues

**Extension won't load**:
- Check manifest.json has no syntax errors
- Check all files referenced in manifest exist
- Check Chrome DevTools for errors

**"Domain not whitelisted"**:
- Check URL matches domain in `platforms.json`
- Reload extension after editing `platforms.json`

**Verification fails**:
- Check backend API is accessible
- Check user is logged in
- Check browser console for errors
- Verify anti-tamper timeout hasn't expired

### Blockchain Issues

**IPFS upload fails**:
- Check `PINATA_JWT` in `.env`
- Check Pinata account has storage quota
- Check file size < 100MB

**Blockchain registration fails**:
- Check wallet has SepoliaETH
- Check `RPC_URL` is valid
- Check `CONTRACT_ADDRESS` is correct
- Check `PRIVATE_KEY` is valid

---

## Next Steps

- **Backend Architecture**: See [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
- **Frontend Guide**: See [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md)
- **Extension Guide**: See [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md)
- **Blockchain Integration**: See [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md)

---

**Last Updated**: December 4, 2025
