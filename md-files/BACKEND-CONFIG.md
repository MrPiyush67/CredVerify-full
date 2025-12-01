# ⚡ Quick Start - CredVerify Extension Backend Configuration

## ✅ What Changed

**OLD Configuration (Before):**
- Backend Port: `3001`
- Endpoint: `http://127.0.0.1:3001/api/verify-certificate`

**NEW Configuration (Now):**
- Backend Port: `5000`
- Endpoint: `http://127.0.0.1:5000/api/credentials/verify-certificate`

---

## 🚀 Start Backend Server

```bash
# Navigate to backend folder
cd backend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

**Expected Output:**
```
🚀 Server running on port 5000
📦 MongoDB connected successfully
```

---

## 🔌 Extension Endpoints (Updated)

| Feature | Endpoint | Port |
|---------|----------|------|
| **Certificate Verification** | `/api/credentials/verify-certificate` | 5000 |
| **User Login** | `/api/users/extension-login` | 5000 |
| **Trusted Domains** | `/api/credentials/trusted-domains` | 5000 |

---

## 📂 Files Modified

✅ **extension/js/background.js**
- Line ~152: Verify endpoint updated to port 5000
- Line ~224: Base endpoint updated to port 5000

✅ **extension/js/login.js**
- Already using port 5000 (no changes needed)

✅ **NEW: extension/config.js**
- Central configuration file created
- Easy switch between dev/production

✅ **NEW: extension/API-ENDPOINTS.md**
- Complete API documentation
- All available endpoints listed

---

## 🧪 Test the Connection

### 1. Start Backend
```bash
cd backend
npm run dev
```

### 2. Test API Endpoint
Open in browser: http://127.0.0.1:5000/api/credentials/trusted-domains

Should return:
```json
{
  "success": true,
  "domains": [...]
}
```

### 3. Load Extension
1. Open Chrome/Brave
2. Go to `chrome://extensions`
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select `extension/` folder

### 4. Test Extension
1. Visit whitelisted site (e.g., coursera.org)
2. Click extension icon
3. Select certificate image
4. Click "Verify Certificate"
5. Should see: Anti-tamper → Refresh → Verification

---

## 🔧 Configuration Files

### Backend Port
**File:** `backend/src/core/config/env.js`
```javascript
export const config = {
  port: process.env.PORT || 5000,  // ← Backend port
  // ...
};
```

### Extension Endpoints
**File:** `extension/js/background.js`
```javascript
// Certificate verification
const endpoint = storage.cv_endpoint || 
  'http://127.0.0.1:5000/api/credentials/verify-certificate';

// Base API endpoint
const baseEndpoint = storage.cv_endpoint || 
  'http://127.0.0.1:5000/api';
```

### User Login
**File:** `extension/js/login.js`
```javascript
const MAIN_BACKEND_URL = 'http://127.0.0.1:5000';
const CREDVERIFY_APP_URL = 'http://127.0.0.1:5173';
```

---

## 🌐 Production Setup

When deploying to production:

### 1. Update Extension Config
```javascript
// extension/config.js
const CONFIG = {
  ENV: 'production', // Change from 'development'
  PRODUCTION: {
    MAIN_BACKEND: 'https://api.credverify.com',
    FRONTEND_APP: 'https://app.credverify.com',
  }
};
```

### 2. Update Environment Variables
```bash
# backend/.env
PORT=5000
MONGO_URI=mongodb+srv://your-production-db
JWT_SECRET=your-secure-secret-key
NODE_ENV=production
```

### 3. Enable CORS for Extension
```javascript
// backend/src/app.js
app.use(cors({
  origin: [
    'chrome-extension://*',
    'https://app.credverify.com'
  ],
  credentials: true
}));
```

---

## ✨ New Features Enabled

With the updated backend integration:

✅ **Certificate OCR + AI Verification**
- Tesseract OCR text extraction
- LLM-powered authenticity check
- Platform metadata validation

✅ **Anti-Tampering Protection**
- Image hash verification
- Page refresh validation
- DOM manipulation detection

✅ **Dynamic Platform Whitelist**
- 37 trusted platforms
- JSON-based configuration
- Real-time domain validation

✅ **Secure Authentication**
- JWT token-based auth
- Chrome storage persistence
- Role-based access control

---

## 📊 System Architecture

```
Extension (Frontend)
    ↓
Anti-Tamper Check
    ↓
background.js (Service Worker)
    ↓
HTTP POST to Backend
    ↓
Backend (Port 5000)
    ↓
/api/credentials/verify-certificate
    ↓
OCR + LLM Pipeline
    ↓
Response to Extension
    ↓
Display Results
```

---

## 🆘 Troubleshooting

### Backend Not Starting
```bash
# Check if port 5000 is in use
netstat -ano | findstr :5000

# Kill process if needed (Windows)
taskkill /PID <PID> /F

# Restart backend
npm run dev
```

### Extension Can't Connect
1. Check backend is running: http://127.0.0.1:5000
2. Check browser console for errors
3. Verify extension has correct permissions in manifest.json
4. Reload extension in chrome://extensions

### CORS Errors
Add extension origin to backend CORS config:
```javascript
// backend/src/app.js
origin: ['chrome-extension://*']
```

---

**Status:** ✅ Configuration Complete  
**Backend Port:** 5000  
**Endpoints Updated:** 3 files  
**Documentation:** API-ENDPOINTS.md, config.js
