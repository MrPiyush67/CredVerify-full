# 🚀 QUICK START - Testing Guide

## ✅ Setup Complete!

### Image URL Added:
```
https://s3.amazonaws.com/coursera_assets/meta_images/generated/CERTIFICATE_LANDING_PAGE/CERTIFICATE_LANDING_PAGE~OUD4PJJPOHVH/CERTIFICATE_LANDING_PAGE~OUD4PJJPOHVH.jpeg
```

### Enhanced Debugging Added:
- ✅ Background script now has detailed console logs
- ✅ Popup script now has detailed console logs
- ✅ Every step of the verification flow is tracked

---

## 🎯 Run Tests Now (3 Easy Steps)

### Step 1: Start Backend
```bash
cd backend
npm run dev
```
Should see: "Server running on port 5000"

### Step 2: Run Test 1 (Authentication)
```bash
node test-1-auth.js
```
**Expected:** Gets auth token and saves to `test-data.json`

### Step 3: Run Test 2 (Image Fetch)
```bash
node test-2-fetch-image.js
```
**Expected:** Downloads certificate and converts to base64

### Step 4: Run Test 3 (Verification API)
```bash
node test-3-verify-api.js
```
**Expected:** Complete verification with results

---

## 🔍 Extension Debugging (Enhanced)

### Reload Extension:
1. Go to `chrome://extensions/`
2. Find CredVerify extension
3. Click reload icon 🔄

### Check Logs:

**Background Script Logs:**
1. Go to `chrome://extensions/`
2. Click "Inspect views: service worker"
3. Check console - you'll see detailed logs like:
   ```
   🔧 [BACKGROUND] Starting verification...
   🔧 [BACKGROUND] Configuration: { endpoint, hasToken, ... }
   🔧 [BACKGROUND] ✅ Using base64 from fileData, length: 335872
   🔧 [BACKGROUND] 📤 Sending to backend...
   ```

**Popup Script Logs:**
1. Right-click extension icon → Inspect
2. Check console - you'll see:
   ```
   📱 [POPUP] verifyCertificate() called
   📱 [POPUP] selectedImageUrl: https://...
   📱 [POPUP] 📤 Sending message to background...
   📱 [POPUP] 📥 Received response from background
   ```

---

## 🐛 Debug "Failed to fetch" Error

With the new enhanced logging, you'll see EXACTLY where it fails:

### Scenario 1: Fails in POPUP
```
📱 [POPUP] ❌ Background returned error: Network request failed
```
**Cause:** Background script can't reach backend

### Scenario 2: Fails in BACKGROUND (Fetch)
```
🔧 [BACKGROUND] ❌ Fetch failed after 2000ms
🔧 [BACKGROUND] Error: Failed to fetch
```
**Cause:** 
- Backend not running
- CORS issue
- Network blocked

### Scenario 3: Fails in BACKGROUND (Response)
```
🔧 [BACKGROUND] ❌ Non-OK response: 400
🔧 [BACKGROUND] Error data: { message: "Image data is required" }
```
**Cause:** Backend received request but validation failed

---

## 📊 What to Share With Me

After running the tests and trying the extension, share:

1. **Test Results:**
   - ✅ or ❌ for test-1-auth.js
   - ✅ or ❌ for test-2-fetch-image.js
   - ✅ or ❌ for test-3-verify-api.js

2. **Extension Console Logs:**
   - Copy ALL logs from background script console
   - Copy ALL logs from popup console
   - Screenshot if needed

3. **Error Message:**
   - The exact error shown in extension
   - The exact error in console

---

## 🎬 Ready to Test!

**Run this sequence:**
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Run tests
cd backend
node test-1-auth.js
node test-2-fetch-image.js
node test-3-verify-api.js

# Then test extension with enhanced logging
# Check browser console for detailed logs!
```

All tests should now work perfectly with the provided credentials and image URL!
