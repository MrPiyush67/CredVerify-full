# 🔌 CredVerify Extension - API Endpoints Reference

## Backend Server Information

**Development Backend:** `http://127.0.0.1:5000`  
**Port:** `5000` (configured in `backend/src/core/config/env.js`)  
**Base Path:** `/api`

---

## 📍 Available Endpoints

### 1. User Authentication

#### Extension Login
```
POST /api/users/extension-login
```
**Purpose:** Authenticate extension user with main CredVerify platform  
**Headers:**
```json
{
  "Content-Type": "application/json"
}
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```
**Response:**
```json
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "credentialist"
  }
}
```
**Used In:** `extension/js/login.js`

---

### 2. Certificate Verification (Primary Feature)

#### Verify Certificate (OCR + LLM Pipeline)
```
POST /api/credentials/verify-certificate
```
**Purpose:** Upload certificate image for OCR extraction + AI verification  
**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "multipart/form-data"
}
```
**Request Body (Form Data):**
```javascript
{
  certificateImage: File | Blob,      // Certificate image file
  imageUrl: String (optional),        // URL if image is hosted
  platform: String (optional),        // Platform name (e.g., "Coursera")
  metadata: JSON (optional)           // Additional metadata
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "ocrText": "Certificate text extracted via OCR",
    "extractedData": {
      "name": "John Doe",
      "course": "Machine Learning",
      "issuer": "Coursera",
      "issueDate": "2025-01-15",
      "certificateId": "ABC123XYZ"
    },
    "aiVerification": {
      "isValid": true,
      "confidence": 0.95,
      "remarks": "Certificate appears authentic"
    },
    "platform": {
      "name": "Coursera",
      "domain": "coursera.org",
      "category": "mooc"
    }
  }
}
```
**Used In:** `extension/js/background.js` (verifyCertificate function)

---

#### Extract Preview (Fast OCR Only)
```
POST /api/credentials/extract-preview
```
**Purpose:** Quick OCR extraction without full AI verification  
**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "multipart/form-data"
}
```
**Request Body:**
```javascript
{
  certificateImage: File | Blob
}
```
**Response:**
```json
{
  "success": true,
  "preview": {
    "ocrText": "Extracted text...",
    "name": "John Doe",
    "course": "Data Science"
  }
}
```

---

### 3. Credential Management

#### Create Credential from Extension
```
POST /api/credentials/from-extension
```
**Purpose:** Save verified credential to user's CredVerify account  
**Headers:**
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```
**Request Body:**
```json
{
  "title": "Machine Learning Certificate",
  "issuer": "Coursera",
  "issueDate": "2025-01-15",
  "certificateUrl": "https://...",
  "verificationData": { /* OCR + AI results */ }
}
```

---

#### Get Public Credentials
```
GET /api/credentials/public
```
**Purpose:** Retrieve publicly shared credentials  
**Headers:** None required (public endpoint)

---

### 4. Trusted Domains

#### Get Trusted Domains List
```
GET /api/credentials/trusted-domains
```
**Purpose:** Fetch list of whitelisted platforms for certificate verification  
**Headers:** None required (public endpoint)  
**Response:**
```json
{
  "success": true,
  "domains": [
    {
      "name": "Coursera",
      "domain": "coursera.org",
      "category": "mooc",
      "verified": true
    },
    // ... more domains
  ],
  "total": 37
}
```
**Note:** This complements the local `platforms.json` file in the extension

---

## 🔧 Extension Configuration

### Current Settings (Development)

**Files Updated:**
- ✅ `extension/js/background.js` - Verify endpoint: `http://127.0.0.1:5000/api/credentials/verify-certificate`
- ✅ `extension/js/background.js` - Base endpoint: `http://127.0.0.1:5000/api`
- ✅ `extension/js/login.js` - Main backend: `http://127.0.0.1:5000`
- ✅ `extension/js/login.js` - Frontend app: `http://127.0.0.1:5173`

### Backend Port Configuration

**Location:** `backend/src/core/config/env.js`
```javascript
export const config = {
  port: process.env.PORT || 5000,  // ← Backend runs on port 5000
  // ... other config
};
```

**To change port:**
1. Create `.env` file in `backend/` folder
2. Add: `PORT=5000`
3. Restart backend: `npm run dev`

---

## 🚀 Production Deployment

When deploying to production:

### 1. Update Extension Config
```javascript
// In extension/config.js
const CONFIG = {
  ENV: 'production', // ← Change this
  PRODUCTION: {
    MAIN_BACKEND: 'https://api.credverify.com',
    FRONTEND_APP: 'https://app.credverify.com',
  }
};
```

### 2. Update Hardcoded URLs
- `extension/js/background.js` - Update default endpoints
- `extension/js/login.js` - Update `MAIN_BACKEND_URL` and `CREDVERIFY_APP_URL`

### 3. Backend CORS Configuration
Ensure backend allows extension origin:
```javascript
// backend/src/app.js
app.use(cors({
  origin: ['chrome-extension://*', 'https://app.credverify.com'],
  credentials: true
}));
```

---

## 🧪 Testing Endpoints

### Test Certificate Verification
```bash
# From extension folder
cd extension

# Start backend (separate terminal)
cd ../backend
npm run dev

# Test verify endpoint with curl
curl -X POST http://127.0.0.1:5000/api/credentials/verify-certificate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "certificateImage=@test-certificate.jpg" \
  -F "platform=Coursera"
```

### Check Backend Status
```bash
# Visit in browser
http://127.0.0.1:5000/api/credentials/trusted-domains

# Should return list of trusted platforms
```

---

## 📊 API Flow (Extension → Backend)

```
User Action (Extension)
    ↓
1. Select Certificate Image
    ↓
2. Anti-Tamper Check (hash image)
    ↓
3. Page Refresh
    ↓
4. Re-verify Image Hash
    ↓
5. Send to Background Script
    ↓
background.js → verifyCertificate()
    ↓
6. POST /api/credentials/verify-certificate
    {
      certificateImage: blob,
      platform: "Coursera",
      imageUrl: "https://..."
    }
    ↓
Backend Processing
    ↓
7. OCR Extraction (Tesseract)
    ↓
8. LLM Verification (OpenAI/Gemini)
    ↓
9. Platform Validation
    ↓
10. Response to Extension
    {
      ocrText: "...",
      extractedData: {...},
      aiVerification: {...}
    }
    ↓
11. Display Results in Popup
```

---

## 🔐 Authentication Flow

```
1. User opens extension
    ↓
2. Not logged in → Redirect to login.html
    ↓
3. User enters credentials
    ↓
4. POST /api/users/extension-login
    ↓
5. Backend validates + returns JWT
    ↓
6. Extension stores JWT in chrome.storage
    ↓
7. All API calls include: Authorization: Bearer <JWT>
    ↓
8. Backend verifies JWT on each request
```

---

## 📝 Notes

- **Port Change:** Backend moved from `3001` → `5000`
- **Route Change:** `/api/verify-certificate` → `/api/credentials/verify-certificate`
- **New Feature:** Platform metadata now included in verification response
- **Security:** All verification endpoints require JWT authentication
- **Anti-Tamper:** Image hash verification happens before API call

---

**Last Updated:** December 2, 2025  
**Backend Version:** 1.0.0  
**Extension Version:** 1.0.0
