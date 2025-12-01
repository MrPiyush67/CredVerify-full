# 🧪 Complete Testing Guide - Certificate Verification

## 📋 Test Scripts Created

I've created 5 comprehensive test scripts to debug the "Failed to fetch" error:

### Test Scripts:
1. **`test-1-auth.js`** ✅ - Test authentication & get token
2. **`test-2-fetch-image.js`** - Fetch certificate image & convert to base64
3. **`test-3-verify-api.js`** - Test complete verification API
4. **`test-4-extension-simulation.js`** - Simulate exact extension flow
5. **`debug-extension.html`** - Visual debug tool (browser-based)

---

## 🚀 Step-by-Step Testing Instructions

### Prerequisites:
✅ User Credentials: `susi20091998@gmail.com` / `@Piyush9152`
✅ Certificate URL: https://www.coursera.org/account/accomplishments/verify/OUD4PJJPOHVH

---

### STEP 1: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB connected
```

**Verify:**
```bash
curl http://127.0.0.1:5000/health
```

---

### STEP 2: Run Authentication Test

```bash
cd backend
node test-1-auth.js
```

**What it does:**
- ✅ Logs in with provided credentials
- ✅ Gets auth token
- ✅ Retrieves user profile (including legal name)
- ✅ Saves to `test-data.json`

**Expected Output:**
```
✅ Login successful!
📋 User Information:
  - Name: [User's name from database]
  - Email: susi20091998@gmail.com
  - Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**If it fails:**
- Check backend is running
- Verify MongoDB connection
- Check user credentials

---

### STEP 3: Get Certificate Image URL

**Option A: Manual (Recommended)**
1. Go to: https://www.coursera.org/account/accomplishments/verify/OUD4PJJPOHVH
2. Right-click on the certificate image
3. Select "Copy Image Address"
4. Paste the URL in `test-2-fetch-image.js` at line 11:
   ```javascript
   const CERTIFICATE_IMAGE_URL = 'PASTE_YOUR_IMAGE_URL_HERE';
   ```

**Option B: Extract from Page**
1. Go to the certificate page
2. Open browser console (F12)
3. Run:
   ```javascript
   document.querySelector('img[src*="certificate"]')?.src ||
   document.querySelector('img[alt*="certificate"]')?.src ||
   Array.from(document.querySelectorAll('img')).find(img => img.naturalWidth > 500)?.src
   ```
4. Copy the URL

---

### STEP 4: Run Image Fetch Test

```bash
node test-2-fetch-image.js
```

**What it does:**
- ✅ Fetches certificate image from Coursera
- ✅ Converts to base64
- ✅ Saves to `test-data.json` and `test-certificate.jpg`

**Expected Output:**
```
✅ Image fetched successfully
  - Size: 245 KB
  - Type: image/jpeg
✅ Conversion complete
  - Base64 length: 335,872 characters
```

---

### STEP 5: Run Verification API Test

```bash
node test-3-verify-api.js
```

**What it does:**
- ✅ Sends verification request to backend
- ✅ Shows complete verification result
- ✅ Tests exact API the extension uses

**Expected Output:**
```
✅ Verification successful!

📊 VERIFICATION RESULTS
Status: VERIFIED / REVIEW_REQUIRED / REJECTED
Final Score: 92%
Person Name: [Extracted name]
Course: [Course name]
Issuer: Coursera
```

**If it fails here:**
- Check the error message
- Verify OCR is working (Tesseract)
- Check LLM API (Gemini key)
- Review backend logs

---

### STEP 6: Run Extension Flow Simulation

```bash
node test-4-extension-simulation.js
```

**What it does:**
- ✅ Simulates EXACT extension workflow
- ✅ Shows step-by-step flow
- ✅ Identifies where the issue occurs

**Expected Output:**
```
📱 [POPUP] User clicks "Verify Certificate"
🔧 [BACKGROUND] Received message
🌐 [BACKGROUND] Sending to backend...
✅ EXTENSION FLOW SIMULATION COMPLETE!
```

---

### STEP 7: Use Visual Debug Tool

```bash
# In backend directory
open debug-extension.html
# Or just double-click the file
```

**What it does:**
- 🎨 Visual interface to test verification
- 📊 Real-time console output
- 🔍 See exactly what's being sent

**Features:**
- Auto-loads token from `test-data.json`
- Shows request/response in real-time
- Displays formatted results
- Easy debugging

---

## 🔍 Debugging "Failed to fetch" Error

If you get "Failed to fetch" error, check:

### 1. CORS Issue
**Check browser console for:**
```
Access to fetch at 'http://127.0.0.1:5000/...' has been blocked by CORS policy
```

**Solution:** Backend already allows `chrome-extension://` origins (verified in app.js)

### 2. Extension Permissions
**Check manifest.json has:**
```json
{
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "http://127.0.0.1:5000/*",
    "http://localhost:5000/*",
    "https://*/*"
  ]
}
```

### 3. Extension Not Reloaded
**After code changes:**
1. Go to `chrome://extensions/`
2. Find your extension
3. Click the reload icon 🔄

### 4. Background Script Error
**Check extension service worker:**
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker"
3. Check console for errors

### 5. Network Request Blocked
**Check:**
- Antivirus/Firewall blocking localhost
- VPN interfering with local requests
- Browser privacy extensions blocking requests

---

## 📊 Test Data Structure

After running tests, `test-data.json` contains:

```json
{
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "name": "User Name",
    "email": "susi20091998@gmail.com",
    "role": "credentialist"
  },
  "certificate": {
    "pageUrl": "https://www.coursera.org/...",
    "imageUrl": "https://...",
    "base64": "iVBORw0KGgoAAAA...",
    "size": 251234,
    "type": "image/jpeg"
  },
  "verificationResult": {
    "response": { ... },
    "duration": 5234
  }
}
```

---

## 🎯 What I Need From You

### To Continue Testing:

1. **Start backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Run test 1:**
   ```bash
   node test-1-auth.js
   ```

3. **Get certificate image URL:**
   - Go to: https://www.coursera.org/account/accomplishments/verify/OUD4PJJPOHVH
   - Right-click certificate image → Copy Image Address
   - Paste URL here: ________________

4. **Tell me the results of each test**

---

## 📝 Quick Test Command Sequence

```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run all tests
cd backend
node test-1-auth.js
# Then update image URL in test-2-fetch-image.js
node test-2-fetch-image.js
node test-3-verify-api.js
node test-4-extension-simulation.js

# Or open debug tool in browser
open debug-extension.html
```

---

## ✅ Success Criteria

All tests pass when you see:
- ✅ TEST 1 PASSED - Authentication Working
- ✅ TEST 2 PASSED - Image Fetched & Converted
- ✅ TEST 3 PASSED - Verification API Working
- ✅ TEST 4 PASSED - Extension Flow Works

Then we know the backend is working and can focus on extension-specific issues!
