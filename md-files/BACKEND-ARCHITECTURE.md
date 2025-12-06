# Backend Architecture - CredVerify

Complete documentation for the CredVerify backend API server.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Features](#core-features)
5. [Verification Pipeline](#verification-pipeline)
6. [Blockchain Integration](#blockchain-integration)
7. [API Endpoints](#api-endpoints)
8. [Authentication & Authorization](#authentication--authorization)
9. [Database Models](#database-models)
10. [Services & Business Logic](#services--business-logic)
11. [Environment Configuration](#environment-configuration)
12. [Development Guide](#development-guide)

---

## Overview

### Technology Stack
- **Runtime**: Node.js 16+ (ES Modules)
- **Framework**: Express.js 4.19
- **Database**: MongoDB 8.4 (Mongoose ODM)
- **Authentication**: JWT (jsonwebtoken + HTTP-only cookies)
- **File Upload**: Multer + ImageKit (deprecated) + IPFS (Pinata)
- **AI/ML**: Google Gemini API, Tesseract.js
- **Blockchain**: ethers.js v6 (Ethereum Sepolia Testnet)
- **Web Scraping**: Puppeteer, Cheerio
- **Real-time**: Socket.IO

### Key Capabilities
- ✅ AI-powered credential verification (OCR + LLM)
- ✅ Blockchain registration (Ethereum Sepolia)
- ✅ IPFS decentralized storage (Pinata)
- ✅ Multi-platform support (50+ platforms)
- ✅ Role-based access control (3 roles)
- ✅ Real-time notifications (Socket.IO)
- ✅ DigiLocker OAuth integration
- ✅ Automated verification scoring

---

## Architecture

### Feature-Based Structure

The backend follows a **modular, feature-based architecture** where each domain is encapsulated:

```
features/
├── user/                   # Base authentication & profiles
├── credential/             # Certificate management & verification
├── credentialist/          # Credential holder profiles
├── validant/               # Verifier profiles & manual review
├── curator/                # Recruiter profiles
├── job/                    # Job postings & applications
├── chat/                   # Real-time messaging
├── notification/           # User notifications
├── dashboard/              # Analytics & stats
├── platform/               # Supported platforms registry
└── digilocker/             # DigiLocker OAuth integration
```

Each feature module contains:
- **Model** (`*.model.js`): Mongoose schema
- **Service** (`*.service.js`): Business logic
- **Controller** (`*.controller.js`): HTTP request handlers
- **Routes** (`*.routes.js`): Express route definitions

### Layered Architecture

```
Client Request
     ↓
[Route Layer] → Define HTTP routes & methods
     ↓
[Middleware] → Auth, validation, error handling
     ↓
[Controller Layer] → Parse request, call services
     ↓
[Service Layer] → Business logic, data processing
     ↓
[Model Layer] → Database operations (Mongoose)
     ↓
[Database] → MongoDB
```

### Core Infrastructure (`core/`)

```
core/
├── config/
│   ├── db.js              # MongoDB connection
│   └── env.js             # Environment variables
├── constants/
│   ├── roles.js           # User roles
│   └── messages.js        # Response messages
├── middleware/
│   ├── authMiddleware.js  # JWT verification
│   ├── roleGuard.js       # RBAC enforcement
│   └── errorHandler.js    # Global error handling
└── utils/
    ├── response.js        # Standardized API responses
    ├── imagekitService.js # ImageKit upload (deprecated)
    ├── ipfsService.js     # IPFS upload (Pinata)
    └── blockchainService.js # Smart contract interaction
```

---

## Project Structure

```
backend/
├── src/
│   ├── app.js                    # Express app configuration
│   ├── server.js                 # HTTP + Socket.IO server
│   ├── core/                     # Shared infrastructure
│   │   ├── config/
│   │   │   ├── db.js             # MongoDB connection
│   │   │   └── env.js            # Environment config
│   │   ├── constants/
│   │   │   ├── roles.js          # ROLES enum
│   │   │   └── messages.js       # Standardized messages
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js # JWT authentication
│   │   │   ├── roleGuard.js      # Role-based access
│   │   │   └── errorHandler.js   # Global error handler
│   │   └── utils/
│   │       ├── response.js        # sendSuccess/sendError
│   │       ├── imagekitService.js # ImageKit (legacy)
│   │       ├── ipfsService.js     # IPFS Pinata upload
│   │       └── blockchainService.js # ethers.js wrapper
│   │
│   └── features/                  # Domain modules
│       ├── user/
│       │   ├── user.model.js      # Base user schema
│       │   ├── user.service.js    # Auth, profile logic
│       │   ├── user.controller.js # Auth endpoints
│       │   └── user.routes.js     # /api/user routes
│       │
│       ├── credential/
│       │   ├── credential.model.js       # Credential schema
│       │   ├── credential.controller.js  # CRUD endpoints
│       │   ├── credential.routes.js      # /api/credentials
│       │   ├── services/
│       │   │   ├── credential.service.js # Core CRUD logic
│       │   │   ├── llm.service.js        # Gemini AI integration
│       │   │   ├── ocr.service.js        # Tesseract OCR
│       │   │   ├── domainValidator.service.js # Platform validation
│       │   │   └── manualVerification.service.js # Scraping utilities
│       │   └── verification/
│       │       ├── pipeline/              # Reusable verification stages
│       │       │   ├── inputNormalizer.js
│       │       │   ├── domainValidator.js
│       │       │   ├── certificateExtractor.js
│       │       │   ├── ocrExtractor.js
│       │       │   ├── llmInterpreter.js
│       │       │   ├── nameMatcher.js
│       │       │   ├── scoreCalculator.js
│       │       │   └── credentialSaver.js
│       │       ├── orchestrators/         # Workflow coordinators
│       │       │   ├── extensionVerification.js # Extension flow (9 stages)
│       │       │   └── manualVerification.js    # Manual flow (10 stages)
│       │       └── controllers/
│       │           ├── verification.controller.js # Extension endpoint
│       │           └── manualVerification.controller.js # Manual endpoint
│       │
│       ├── credentialist/
│       │   ├── credentialist.model.js    # Profile schema
│       │   ├── credentialist.service.js  # Profile management
│       │   ├── credentialist.controller.js
│       │   └── credentialist.routes.js
│       │
│       ├── validant/
│       │   ├── validant.model.js
│       │   ├── validant.service.js
│       │   ├── validant.controller.js
│       │   └── validant.routes.js
│       │
│       ├── curator/
│       │   ├── curator.model.js
│       │   ├── curator.service.js
│       │   ├── curator.controller.js
│       │   └── curator.routes.js
│       │
│       ├── job/
│       │   ├── job.model.js
│       │   ├── job.service.js
│       │   ├── job.controller.js
│       │   └── job.routes.js
│       │
│       ├── chat/
│       │   ├── chat.model.js
│       │   ├── chat.service.js
│       │   ├── chat.controller.js
│       │   └── chat.routes.js
│       │
│       ├── notification/
│       │   ├── notification.model.js
│       │   ├── notification.service.js
│       │   ├── notification.controller.js
│       │   └── notification.routes.js
│       │
│       ├── dashboard/
│       │   ├── dashboard.controller.js
│       │   └── dashboard.routes.js
│       │
│       ├── platform/
│       │   ├── platform.controller.js
│       │   └── platform.routes.js
│       │
│       └── digilocker/
│           ├── controller.js
│           └── routes.js
│
├── contracts/                      # Smart contracts
│   ├── CertificateRegistry.sol    # Solidity contract
│   ├── CertificateRegistryABI.json # Contract ABI
│   └── README.md                   # Deployment guide
│
├── .env.example                    # Environment template
├── package.json
└── README.md
```

---

## Core Features

### 1. User Management & Authentication

#### Roles
```javascript
ROLES = {
  CREDENTIALIST: 'credentialist',  // Certificate holders
  VALIDANT: 'validant',            // Verifiers
  CURATOR: 'curator'               // Recruiters
}
```

#### Authentication Flow
1. User signs up with role selection
2. Base `User` document created in MongoDB
3. Role-specific profile created (CredentialistProfile/ValidantProfile/CuratorProfile)
4. JWT token generated and sent as HTTP-only cookie
5. Subsequent requests include cookie for authentication

#### JWT Strategy
- **Token Storage**: HTTP-only cookie (secure, prevents XSS)
- **Expiration**: 7 days (configurable via `JWT_EXPIRE`)
- **Payload**: `{ userId, role, email }`
- **Middleware**: `protect` middleware verifies token on protected routes

### 2. Credential Verification Pipeline

The verification system is the **core feature** of CredVerify. It processes certificates through a multi-stage pipeline:

#### Verification Stages

**Pipeline Stages** (`/verification/pipeline/`)

1. **Input Normalizer** (`inputNormalizer.js`)
   - Extracts verification URL from various input formats
   - Handles extension data, manual URL, QR code data
   - Output: Clean URL string

2. **Domain Validator** (`domainValidator.js`)
   - Checks URL against `platforms.json` whitelist
   - Validates trusted issuer domains
   - Output: Platform metadata + trust score

3. **Certificate Extractor** (`certificateExtractor.js`)
   - Takes screenshot if URL provided (Puppeteer)
   - Or uses pre-captured screenshot from extension
   - Output: Image buffer

4. **OCR Extractor** (`ocrExtractor.js`)
   - Runs Tesseract.js on certificate image
   - Extracts raw text with confidence scores
   - Output: OCR text + quality metrics

5. **LLM Interpreter** (`llmInterpreter.js`)
   - Sends OCR text to Google Gemini AI
   - Extracts structured data (name, course, date, etc.)
   - Output: Parsed metadata JSON

6. **Name Matcher** (`nameMatcher.js`)
   - Fuzzy matches extracted name with user's legal name
   - Uses string similarity algorithm
   - Output: Match confidence (0-100%)

7. **Score Calculator** (`scoreCalculator.js`)
   - Weighted scoring: 60% name + 30% domain + 10% metadata
   - Auto-approve if ≥85%
   - Output: Final score + decision

8. **Duplicate Check** (`credentialSaver.js` - checkDuplicateCertificate)
   - Computes fingerprint: `keccak256(sourceUrl)`
   - Checks MongoDB for existing certificate with same fingerprint
   - Prevents duplicate uploads from same URL
   - Output: Existing credential (if found) or null

9. **IPFS Upload** (`credentialSaver.js` - uploadToIpfs)
   - Uploads certificate image to IPFS via Pinata
   - Returns CID (Content Identifier)
   - Output: `{ cid, url, provider: 'pinata' }`

10. **Blockchain Registration** (`credentialSaver.js` - registerOnChain)
   - Registers fingerprint → CID mapping on smart contract
   - Uses ethers.js to call `register(bytes32 fingerprint, string cid)`
   - Output: `{ txHash, blockNumber, gasUsed }`

11. **Database Save** (`credentialSaver.js` - saveCredential)
   - Saves credential document to MongoDB
   - Includes IPFS CID, blockchain txHash, and fingerprint
   - Output: Saved credential document

#### Orchestrators

**Extension Verification** (`orchestrators/extensionVerification.js`)
- **11-stage workflow** for browser extension submissions:
  1. Input Normalization → 2. Domain Validation → 3. Certificate Extraction (pre-captured) 
  → 4. OCR Extraction → 5. LLM Interpretation → 6. Name Matching → 7. Score Calculation 
  → 8. Duplicate Check → 9. IPFS Upload → 10. Blockchain Registration → 11. Database Save
- Pre-captured screenshot eliminates scraping step
- Input: `{ screenshot (base64), sourceUrl, autoSave (boolean) }`

**Manual Verification** (`orchestrators/manualVerification.js`)
- **11-stage workflow** for manual URL/QR submissions (includes Puppeteer scraping):
  1. Input Normalization → 2. Domain Validation → 3. Puppeteer Scraping 
  → 4. OCR Extraction → 5. LLM Interpretation → 6. Name Matching → 7. Score Calculation 
  → 8. Duplicate Check → 9. IPFS Upload → 10. Blockchain Registration → 11. Database Save
- Input: `{ verificationUrl OR qrImage }`

### Trust Boundaries

- OCR (Tesseract.js) and LLM (Gemini) are treated as *untrusted helpers*:
  - OCR is allowed to misread text → we handle uncertainty.
  - LLM is allowed to misinterpret text → we never let it make final decisions.
- Verification decisions (approve / reject) are always made by deterministic backend logic:
  - Name matching happens via code, not LLM.
  - Scores are computed via `scoreCalculator.js` (no AI).
  - LLM output is always validated (e.g., `recipientName` must be a substring of OCR text).


### 3. Blockchain Integration

#### Components
- **Smart Contract**: `CertificateRegistry.sol` (Solidity 0.8.17)
  - Deployed on Ethereum Sepolia testnet
  - Owner-only `register(fingerprint, cid)` function
  - Public `getRecord(fingerprint)` view function

- **IPFS Service**: `ipfsService.js`
  - Uploads certificate images to Pinata
  - Returns CID (Content Identifier)
  - Replaces ImageKit as primary storage

- **Blockchain Service**: `blockchainService.js`
  - Computes fingerprint: `keccak256(sourceUrl)`
  - Calls contract via ethers.js
  - Returns transaction hash

#### Registration Flow
```
Certificate Verified (Score ≥ 85%)
  ↓
Compute Fingerprint: keccak256(sourceUrl)
  ↓
Check for Duplicates: MongoDB query by fingerprint
  ↓
[If duplicate found] → Return existing certificate (409 Conflict)
  ↓
[If unique] → Upload to IPFS → CID: QmXXX...
  ↓
Register on-chain: contract.register(fingerprint, CID)
  ↓
Store in MongoDB: credential + IPFS CID + txHash + fingerprint
```

#### Why URL-Based Fingerprint?

**Current Implementation**: `fingerprint = keccak256(sourceUrl)`

**Benefits**:
1. **Deterministic**: Same URL always produces same fingerprint
2. **Verifiable**: Anyone can recompute by hashing the URL
3. **Tamper-Proof**: Changing URL invalidates the fingerprint
4. **No PII**: URL is public information (e.g., `https://coursera.org/verify/ABC123`)
5. **Duplicate Detection**: Prevents same certificate from being uploaded twice

**Note**: Perceptual image hashing (pHash) is NOT currently implemented. The system relies on URL uniqueness for duplicate detection.

### 4. DigiLocker Integration

OAuth 2.0 flow for importing government-issued documents:

1. User clicks "Connect DigiLocker"
2. Redirect to DigiLocker OAuth consent page
3. User authorizes
4. Callback receives authorization code
5. Exchange code for access token
6. Fetch user's documents list
7. User selects documents to import
8. Documents added as credentials (with `sourceUrl` pointing to DigiLocker)

Currently using **mock server** (`mock-digilocker/`) for testing.

### 5. Real-Time Features

#### Socket.IO Events
- **Notifications**: Push new notifications to connected clients
- **Chat Messages**: Real-time message delivery
- **Verification Updates**: Live status updates during verification

#### Connection Flow
```javascript
// Client connects with JWT
socket.on('authenticate', (token) => {
  // Verify JWT and join user-specific room
  socket.join(`user:${userId}`);
});

// Server emits to specific user
io.to(`user:${userId}`).emit('notification', notificationData);
```

---

## API Endpoints

See **[API-REFERENCE.md](./API-REFERENCE.md)** for complete endpoint documentation.

### Summary

| Feature | Base Path | Auth Required | Roles |
|---------|-----------|---------------|-------|
| Authentication | `/api/auth` | No | All |
| User Profile | `/api/user` | Yes | All |
| Credentials | `/api/credentials` | Yes | Credentialist |
| Verification (Extension) | `/api/credentials/verify` | Yes | Credentialist |
| Manual Verification | `/api/credentials/verify-manual` | Yes | Credentialist |
| Validant Dashboard | `/api/validant` | Yes | Validant |
| Curator Jobs | `/api/curator` | Yes | Curator |
| Public Jobs | `/api/jobs` | No | All |
| Chat | `/api/chat` | Yes | All |
| Notifications | `/api/notifications` | Yes | All |
| DigiLocker | `/api/digilocker` | Yes | Credentialist |
| Dashboard | `/api/dashboard` | Yes | All |
| Platforms | `/api/platforms` | No | All |

---

## Authentication & Authorization

### Middleware Stack

#### `protect` (authMiddleware.js)
Verifies JWT token from HTTP-only cookie:
```javascript
const protect = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return sendError(res, 401, 'Not authorized');
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.userId);
  next();
};
```

#### `authorize(...roles)` (roleGuard.js)
Checks user role:
```javascript
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return sendError(res, 403, 'Access denied');
  }
  next();
};
```

### Route Protection Example
```javascript
router.post(
  '/verify',
  protect,                     // Must be authenticated
  authorize('credentialist'),  // Must be credentialist
  verifyController.verify
);
```

---

## Database Models

### User (Base Model)
```javascript
{
  name: String,
  username: String (unique),
  email: String (unique, required),
  password: String (hashed, required),
  role: Enum ['credentialist', 'validant', 'curator'],
  avatar: String,
  bio: String,
  location: String,
  website: String,
  isEmailVerified: Boolean,
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Credential
```javascript
{
  user: ObjectId (ref: User),
  legalNameSnapshot: String (user's name at save time),
  certificateName: String (name on certificate),
  nameMatchConfidence: Number (0-100),
  
  verificationStatus: Enum ['VERIFIED', 'REVIEW_REQUIRED', 'REJECTED', 'PENDING'],
  finalVerificationScore: Number (0-100),
  autoApproved: Boolean,
  
  title: String (course/program name),
  issuer: String (organization),
  issueDate: Date,
  type: Enum ['certificate', 'micro_credential', 'degree', 'other'],
  credentialId: String,
  
  skills: [String],
  description: String,
  
  file: {
    url: String (IPFS gateway URL),
    fileName: String,
    fileType: String,
    storageId: String (IPFS CID),
    uploadedAt: Date,
    ipfs: {
      cid: String,
      provider: String ('pinata')
    },
    blockchain: {
      txHash: String (Ethereum tx hash)
    }
  },
  
  sourceUrl: String (verification page URL - used for fingerprint),
  sourceDomain: String,
  isDomainTrusted: Boolean,
  
  meta: {
    verificationDetails: { ... },
    blockchain: {
      ipfs: { cid, provider },
      onChainTx: String
    },
    platform: { id, name, category }
  },
  
  status: Enum ['draft', 'pending', 'verified', 'rejected'] (legacy),
  verifiedBy: ObjectId (ref: User),
  verifiedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Job
```javascript
{
  curator: ObjectId (ref: User),
  title: String,
  company: String,
  description: String,
  requirements: [String],
  skills: [String],
  location: String,
  jobType: Enum ['full-time', 'part-time', 'contract', 'internship'],
  salaryRange: { min: Number, max: Number },
  applicationDeadline: Date,
  status: Enum ['active', 'closed', 'draft'],
  applicants: [{
    user: ObjectId (ref: User),
    appliedAt: Date,
    status: Enum ['pending', 'shortlisted', 'rejected'],
    credentials: [ObjectId (ref: Credential)]
  }],
  createdAt: Date,
  updatedAt: Date
}
```

See other models in their respective feature directories.

---

## Services & Business Logic

### credentialService.js

**Key Functions:**

- `createCredential(userId, credentialData)` - Upload credential (manual/draft)
- `getMyCredentials(userId, filters)` - Fetch user's credentials
- `requestVerification(userId, credentialId)` - Request manual review
- `updateCredential(userId, credentialId, updates)` - Edit credential
- `deleteCredential(userId, credentialId)` - Remove credential

### Verification Services

#### ocrService.js
```javascript
export async function runOCR(imageBuffer) {
  const worker = await createWorker();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');
  const { data } = await worker.recognize(imageBuffer);
  await worker.terminate();
  return data.text;
}
```

#### llmService.js
```javascript
export async function extractMetadataWithLLM(ocrText) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const prompt = `Extract structured data from certificate: ${ocrText}`;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text());
}
```

#### blockchainService.js
```javascript
export async function registerOnChain(fingerprintBytes32, cid) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    wallet
  );
  const tx = await contract.register(fingerprintBytes32, cid);
  const receipt = await tx.wait(1);
  return { txHash: tx.hash, receipt };
}
```

---

## Environment Configuration

### Required Variables

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGO_URI=mongodb://localhost:27017/credverify

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Frontend
CLIENT_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173

# IPFS (Pinata)
PINATA_JWT=your-pinata-jwt-token
PINATA_API_KEY=your-api-key
PINATA_API_SECRET=your-api-secret

# Blockchain (Ethereum Sepolia)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your-deployer-wallet-private-key
CONTRACT_ADDRESS=0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35

# AI/ML
GEMINI_API_KEY=your-google-gemini-api-key

# Legacy (ImageKit - deprecated)
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=

# DigiLocker (currently using mock)
DIGILOCKER_CLIENT_ID=mock-client-id
DIGILOCKER_CLIENT_SECRET=mock-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5000/api/digilocker/callback
```

---

## Development Guide

### Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Scripts

- `npm start` - Production server
- `npm run dev` - Development with nodemon (auto-restart)
- `npm run seed` - Seed database with test data

### Adding a New Feature

1. **Create feature directory** in `src/features/`:
   ```
   src/features/myFeature/
   ├── myFeature.model.js
   ├── myFeature.service.js
   ├── myFeature.controller.js
   └── myFeature.routes.js
   ```

2. **Define Mongoose model** (`*.model.js`)
3. **Implement business logic** (`*.service.js`)
4. **Create controllers** (`*.controller.js`)
5. **Define routes** (`*.routes.js`)
6. **Register routes** in `src/app.js`:
   ```javascript
   import myFeatureRoutes from './features/myFeature/myFeature.routes.js';
   app.use('/api/myFeature', myFeatureRoutes);
   ```

### Best Practices

- ✅ Use ES modules (`import/export`)
- ✅ Handle errors with try-catch + global error handler
- ✅ Use `sendSuccess` and `sendError` for consistent responses
- ✅ Add JSDoc comments for complex functions
- ✅ Validate inputs before processing
- ✅ Use middleware for common tasks (auth, validation)
- ✅ Keep controllers thin (delegate to services)
- ✅ Use async/await (avoid callbacks)

---

## Next Steps

- **API Reference**: See [API-REFERENCE.md](./API-REFERENCE.md)
- **Blockchain Details**: See [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md)
- **Testing**: See [TESTING-GUIDE.md](./TESTING-GUIDE.md)
- **Deployment**: See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

**Last Updated**: December 4, 2025
