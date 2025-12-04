# DigiLocker Integration Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         DIGILOCKER INTEGRATION FLOW                         │
│                         (Complete End-to-End Process)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│   FRONTEND   │  User clicks "Add with DigiLocker"
│  (Port 5173) │  
└──────┬───────┘
       │
       │ 1. Test Auth
       ├───────────────────────────────────────────────┐
       │                                               │
       ▼                                               ▼
┌──────────────┐                                ┌─────────────┐
│   BACKEND    │                                │   CONSOLE   │
│  (Port 5000) │ ◄─────────────────────────────┤ 🔍 Testing  │
│              │  { authenticated: true }       │     auth... │
└──────┬───────┘                                └─────────────┘
       │
       │ 2. GET /api/digilocker/auth
       │    • Generate state token (CSRF protection)
       │    • Store in cookie
       │    • Build OAuth URL
       │
       │ 3. Redirect to Mock DigiLocker
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         MOCK DIGILOCKER SERVER                              │
│                              (Port 3002)                                    │
└─────────────────────────────────────────────────────────────────────────────┘

       ▼
┌──────────────────────┐
│  LOGIN PAGE          │  🎨 Purple theme, "Meri Pehchaan" design
│  /authorize          │  📝 Test credentials displayed
└──────┬───────────────┘  
       │                  
       │ User enters: testuser@digilocker.mock / Test@123
       │
       │ 4. POST /login
       │    Toast: "🔐 Signing in to DigiLocker..."
       │    Console: "🔐 LOGIN ENDPOINT CALLED"
       │             "✅ User authenticated: Test User"
       │
       ▼
┌──────────────────────┐
│  CONSENT PAGE        │  🎨 Purple gradient, permission list
│  /approve            │  ✅ Approve button | ❌ Deny button
└──────┬───────────────┘
       │
       │ User clicks "Approve"
       │
       │ 5. POST /approve
       │    Toast: "✅ Access authorized! Selecting documents..."
       │    Console: "✅ APPROVE ENDPOINT CALLED"
       │             "📄 User has 9 documents"
       │
       ▼
┌──────────────────────┐
│  DOCUMENT SELECTION  │  🎨 Multi-select with checkboxes
│  /document-selection │  📄 Shows all 9 documents
└──────┬───────────────┘  ✅ Selection counter
       │                  🎯 NSQF levels, categories, descriptions
       │
       │ User selects 3 documents
       │
       │ 6. POST /confirm-selection
       │    Toast: "✅ Importing 3 document(s) to CredVerify..."
       │    Console: "📄 CONFIRM SELECTION ENDPOINT CALLED"
       │             "📄 User selected 3 documents"
       │             "🔑 Generated auth code: MOCK_CODE_..."
       │
       │ Generate auth code with embedded document data
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OAUTH TOKEN EXCHANGE FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

       │ 7. Redirect to backend callback
       │    with code + state
       │
       ▼
┌──────────────┐
│   BACKEND    │  GET /api/digilocker/callback
│  /callback   │  
└──────┬───────┘  Console: "🔄 DIGILOCKER CALLBACK RECEIVED"
       │                   "Code: abc123..."
       │                   "✅ DigiLocker callback received"
       │
       │ 8. Validate state (CSRF protection)
       │
       │ 9. POST /token (exchange code for tokens)
       │
       ▼
┌──────────────────────┐
│  MOCK DIGILOCKER     │  POST /public/oauth2/1/token
│  Token Endpoint      │
└──────┬───────────────┘  Console: "🎫 TOKEN ENDPOINT CALLED"
       │                          "🔑 Generated tokens for user"
       │                          "✅ Token response sent"
       │
       │ Returns: access_token, refresh_token, id_token
       │
       ▼
┌──────────────┐
│   BACKEND    │  Receives tokens
│  /callback   │  
└──────┬───────┘  Console: "✅ Tokens received"
       │
       │ 10. GET /userinfo (fetch user details)
       │
       ▼
┌──────────────────────┐
│  MOCK DIGILOCKER     │  GET /public/oauth2/1/userinfo
│  UserInfo Endpoint   │
└──────┬───────────────┘  Console: "👤 USER INFO ENDPOINT CALLED"
       │                          "✅ Returning user info for: Test User"
       │
       │ Returns: { name, email, dob, ... }
       │
       ▼
┌──────────────┐
│   BACKEND    │  Save to DigilockerAccount model
│  /callback   │
└──────┬───────┘  Console: "✅ User info received: Test User"
       │                   "✅ DigiLocker account linked successfully"
       │
       │ 11. GET /files (fetch documents)
       │
       ▼
┌──────────────────────┐
│  MOCK DIGILOCKER     │  GET /public/oauth2/1/files
│  Files Endpoint      │
└──────┬───────────────┘  Console: "📄 FILES ENDPOINT CALLED"
       │                          "📄 Found 9 documents"
       │
       │ Returns: Array of 9 documents with metadata
       │
       ▼
┌──────────────┐
│   BACKEND    │  Encode documents as URL params
│  /callback   │
└──────┬───────┘  Console: "📄 Found 9 documents"
       │                   "✅ Redirecting to frontend with documents..."
       │
       │ 12. Redirect to frontend with docs
       │     /credentials?digilocker=connected&docs=[...]
       │
       ▼
┌──────────────┐
│   FRONTEND   │  DigilockerModal receives documents
│  Modal       │
└──────┬───────┘  State: 'select'
       │          Shows 9 documents in list
       │
       │ User selects 3 documents
       │ Clicks "Import Selected"
       │
       │ 13. POST /api/digilocker/import
       │     Body: { files: [doc1, doc2, doc3] }
       │
       │     Console: "📤 Sending import request with files: [...]"
       │
       ▼
┌──────────────┐
│   BACKEND    │  POST /api/digilocker/import
│  /import     │
└──────┬───────┘  Console: "========================================
       │                   📥 IMPORT DOCUMENTS ENDPOINT CALLED
       │                   ========================================
       │                   User ID: ...
       │                   📄 Number of files to import: 3
       │                   ✅ DigiLocker account found"
       │
       │ For each document:
       │
       ├──────────────────────────────────────────────────────┐
       │                                                      │
       │ Document 1:                                          │
       │ Console: "📄 Processing document: Web Development"   │
       │          "Creating credential with issuer: MoE"      │
       │          "✅ Created credential: 507f1f77..."        │
       │                                                      │
       │ Document 2:                                          │
       │ Console: "📄 Processing document: Data Science"      │
       │          "Creating credential with issuer: NSDC"     │
       │          "✅ Created credential: 507f1f78..."        │
       │                                                      │
       │ Document 3:                                          │
       │ Console: "📄 Processing document: Cloud Computing"   │
       │          "Creating credential with issuer: AWS"      │
       │          "✅ Created credential: 507f1f79..."        │
       │                                                      │
       └──────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   MONGODB    │  Credentials saved to database
│  Database    │
└──────┬───────┘  Collection: credentials
       │          Count: +3 documents
       │
       │ Response sent back to frontend
       │
       ▼
┌──────────────┐
│   FRONTEND   │  Receives import result
│  Modal       │
└──────┬───────┘  Console: "✅ Import result: { count: 3, ... }"
       │
       │ Toast: "Successfully imported 3 documents!"
       │
       │ 14. After 1.5s → window.location.reload()
       │
       ▼
┌──────────────┐
│ CREDENTIALS  │  Refreshed page shows new credentials
│    PAGE      │
└──────────────┘  ✅ 3 new credentials displayed
                  📊 Each with:
                     • Title
                     • Issuer
                     • Issue Date
                     • Status: VERIFIED
                     • Score: 100%
                     • NSQF Level (if applicable)

┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUCCESS! 🎉                                    │
│                                                                             │
│  ✅ Documents imported from DigiLocker                                      │
│  ✅ Credentials created in database                                         │
│  ✅ Visible on credentials page                                             │
│  ✅ Full verification metadata                                              │
└─────────────────────────────────────────────────────────────────────────────┘


═══════════════════════════════════════════════════════════════════════════════
                            KEY COMPONENTS
═══════════════════════════════════════════════════════════════════════════════

📁 FILES INVOLVED:

Frontend:
  └─ src/features/credentials/components/DigilockerModal.jsx
     • Handles UI state
     • Shows document selection
     • Calls import API

Backend:
  └─ src/features/digilocker/
     ├─ routes.js (OAuth endpoints)
     ├─ model.js (DigilockerAccount schema)
     └─ ../credential/credential.model.js (Credential schema)

Mock DigiLocker:
  └─ mock-digilocker/
     ├─ routes/oauth.js (OAuth server)
     ├─ templates/login.js (Login UI)
     ├─ templates/consent.js (Consent UI)
     ├─ templates/documentSelection.js (Selection UI)
     ├─ data/documents.js (9 mock documents)
     └─ utils/tokenManager.js (Token/code storage)

═══════════════════════════════════════════════════════════════════════════════
                         TOAST NOTIFICATIONS 🍞
═══════════════════════════════════════════════════════════════════════════════

1. Login: "🔐 Signing in to DigiLocker..."
2. Approve: "✅ Access authorized! Selecting documents..."
3. Deny: "❌ Access denied"
4. Selection: "✅ Importing X document(s) to CredVerify..."
5. Import Loading: "Importing X document(s)..."
6. Import Success: "✅ Successfully imported X documents!"
7. Import Error: "❌ Failed to import documents"
8. Selection Error: "⚠️ Please select at least one document"

═══════════════════════════════════════════════════════════════════════════════
                          SECURITY MEASURES 🔒
═══════════════════════════════════════════════════════════════════════════════

✅ OAuth 2.0 Authorization Code Flow
✅ State parameter (CSRF protection)
✅ HttpOnly cookies for sensitive data
✅ Token validation before each request
✅ User authentication verification
✅ Secure token storage
✅ SameSite cookie policy

═══════════════════════════════════════════════════════════════════════════════
                          DATA TRANSFORMATION 🔄
═══════════════════════════════════════════════════════════════════════════════

DigiLocker Document        →        CredVerify Credential
────────────────────────────────────────────────────────────────────────
name                       →        title
issuer/issuerName          →        issuer
date                       →        issueDate
category                   →        type (mapped)
uri                        →        credentialId
description                →        description
nsqfLevel                  →        nsqfLevel
schemeName                 →        meta.schemeName
documentFile               →        (reference only)

Additional Fields Added:
  • user: User._id (from authenticated user)
  • sourceDomain: "digilocker.gov.in"
  • isDomainTrusted: true
  • isIssuerVerified: true
  • status: "verified"
  • verificationStatus: "VERIFIED"
  • finalVerificationScore: 100
  • autoApproved: true

═══════════════════════════════════════════════════════════════════════════════
                            MOCK DOCUMENTS 📄
═══════════════════════════════════════════════════════════════════════════════

1. Certificate in AI Fundamentals          (NSQF 4, Skill)
2. Full Stack Web Development Certificate  (NSQF 5, Education)
3. Data Science and Analytics Certificate  (NSQF 6, Skill)
4. Advanced Web Development Certificate    (NSQF 6, Technology)
5. Data Science Fundamentals              (NSQF 7, Skill)
6. Cloud Computing Specialist             (NSQF 8, Technology)
7. Cybersecurity Professional             (NSQF 9, Skill)
8. AI & Machine Learning Expert           (NSQF 10, Technology)
9. Bachelor of Computer Science           (N/A, Education)

All reference PDF: mock-certificate-digilocker.pdf

```
