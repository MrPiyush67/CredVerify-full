# DigiLocker Integration Testing Guide

## Complete Flow Test

### Prerequisites
1. ✅ Backend server running on `http://localhost:5000`
2. ✅ Frontend running on `http://localhost:5173`
3. ✅ Mock DigiLocker server running on `http://localhost:3002`
4. ✅ User logged in to CredVerify

### Step-by-Step Testing

#### 1. Open Credentials Page
- Navigate to `http://localhost:5173/credentials`
- Click "Add with DigiLocker" button
- **Expected**: DigilockerModal opens with "Connect" screen

#### 2. Connect to DigiLocker
- Click "Connect DigiLocker" button
- **Expected Console Logs**:
  ```
  🔍 Testing authentication before DigiLocker redirect...
  Auth test result: { authenticated: true, user: {...} }
  ✅ User authenticated: <email>
  🚀 Redirecting to DigiLocker OAuth...
  ```
- **Backend Console Logs**:
  ```
  ========================================
  🚀 DigiLocker OAuth Flow Starting
  ========================================
  User ID: <userId>
  User Email: <email>
  📋 OAuth Config:
  ...
  ✅ State cookie set: digistate
  🔀 Redirecting to DigiLocker...
  ```

#### 3. DigiLocker Login Page
- **Expected**: Redirected to `http://localhost:3002/public/oauth2/1/authorize`
- See login page with "Meri Pehchaan" design
- Test credentials displayed at bottom:
  - Email: `test@example.com`
  - Password: `password123`

**Action**: Enter credentials and click "Sign In"

- **Expected Console Log** (Browser):
  ```
  🔐 DigiLocker Login Attempt
  Email: test@example.com
  Client ID: ...
  Redirect URI: ...
  ```
- **Expected Toast**: "🔐 Signing in to DigiLocker..."

- **Mock DigiLocker Console Log**:
  ```
  🔐 LOGIN ENDPOINT CALLED
  Email: test@example.com
  Client ID: ...
  ```

#### 4. Authorization/Consent Page
- **Expected**: Purple gradient page asking for permission
- Shows "CredVerify wants to access your DigiLocker"
- Lists: Name, Date of Birth, Documents

**Action**: Click "Approve" button

- **Expected Console Log** (Browser):
  ```
  ✅ User approved access
  ```
- **Expected Toast**: "Access authorized! Selecting documents..."

- **Mock DigiLocker Console Log**:
  ```
  ✅ APPROVE ENDPOINT CALLED
  User: test@example.com
  ```

#### 5. Document Selection Page
- **Expected**: Shows all 9 mock documents with purple theme
- Documents should include:
  - Advanced Web Development Certificate (NSQF Level 6)
  - Data Science Fundamentals (NSQF Level 7)
  - Cloud Computing Specialist (NSQF Level 8)
  - Cybersecurity Professional (NSQF Level 9)
  - AI & Machine Learning Expert (NSQF Level 10)
  - Bachelor of Computer Science
  - Master of Technology
  - Full Stack Developer
  - DevOps Engineer

**Action**: Select 2-3 documents and click "Continue with Selected"

- **Expected Console Logs** (Browser):
  ```
  📤 Submitting document selection
  Selected document count: 3
  Selected document IDs: [...]
  📄 Documents to import: ["Doc 1", "Doc 2", "Doc 3"]
  Form data: { redirectUri: ..., state: ..., userId: ..., documentCount: 3 }
  ```
- **Expected Toast**: "✅ Importing 3 document(s) to CredVerify..."

- **Mock DigiLocker Console Log**:
  ```
  📄 CONFIRM SELECTION ENDPOINT CALLED
  Request body: { selectedDocuments: [...] }
  📄 User selected 3 documents
  🔑 Generated auth code: ...
  🔀 Redirecting to: ...
  ```

#### 6. OAuth Callback
- **Expected**: Redirected back to backend callback endpoint
  
- **Backend Console Logs**:
  ```
  ========================================
  🔄 DIGILOCKER CALLBACK RECEIVED
  ========================================
  Code: abc123...
  State: xyz789...
  ✅ DigiLocker callback received for user: <userId>
  🔑 Exchanging code for tokens...
  ✅ Tokens received
  👤 Fetching user info...
  ✅ User info received: Test User
  ✅ DigiLocker account linked successfully
  📄 Fetching documents from DigiLocker...
  📄 Found 3 documents
  ✅ Redirecting to frontend with documents...
  ```

#### 7. Import Documents
- **Expected**: DigilockerModal shows document selection with 3 documents
- Frontend automatically detects documents from URL params

**Action**: Select all 3 documents and click "Import Selected"

- **Frontend Console Logs**:
  ```
  📤 Sending import request with files: [...]
  ✅ Import result: { count: 3, credentials: [...] }
  ```
- **Expected Toast**: "Loading" toast → "Successfully imported 3 documents!" toast

- **Backend Console Logs**:
  ```
  ========================================
  📥 IMPORT DOCUMENTS ENDPOINT CALLED
  ========================================
  User ID: <userId>
  Request body: { files: [...] }
  📄 Number of files to import: 3
  ✅ DigiLocker account found
  
  📄 Processing document: Advanced Web Development Certificate
  Creating credential with issuer: Digital India Corporation
  ✅ Created credential: <credentialId>
  
  📄 Processing document: Data Science Fundamentals
  Creating credential with issuer: NSDC
  ✅ Created credential: <credentialId>
  
  📄 Processing document: Cloud Computing Specialist
  Creating credential with issuer: AWS Training
  ✅ Created credential: <credentialId>
  
  ========================================
  📊 Import Summary:
    Successfully imported: 3
    Failed: 0
  ========================================
  ```

#### 8. Verify Credentials Page
- **Expected**: Page reloads after 1.5 seconds
- New credentials appear in the credentials list
- Each credential shows:
  - Title from DigiLocker
  - Issuer name
  - Issue date
  - "VERIFIED" status
  - 100% verification score

### Common Issues & Solutions

#### Issue: Documents not appearing
- **Check**: Backend console logs for import errors
- **Solution**: Verify Credential model schema matches the data being sent

#### Issue: "Not authenticated" error
- **Check**: User is logged in to CredVerify
- **Check**: Token is in cookies
- **Solution**: Login to CredVerify first

#### Issue: State mismatch error
- **Check**: Cookie settings (sameSite, httpOnly)
- **Solution**: Clear cookies and try again

#### Issue: Import fails silently
- **Check**: Backend /import endpoint logs
- **Check**: MongoDB connection
- **Solution**: Verify Credential model can be created with the data

### Success Criteria
✅ All 9 documents visible in mock DigiLocker  
✅ User can select multiple documents  
✅ Documents successfully imported to credentials page  
✅ Toast notifications show at each step  
✅ Console logs show detailed flow tracking  
✅ Credentials appear with correct metadata  
✅ Verification status is "VERIFIED" with 100% score  

