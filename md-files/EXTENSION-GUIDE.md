# Browser Extension Guide - CredVerify

Complete documentation for the CredVerify browser extension for one-click certificate verification.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Installation](#installation)
5. [Usage](#usage)
6. [How It Works](#how-it-works)
7. [Platform Detection](#platform-detection)
8. [File Structure](#file-structure)
9. [Development Guide](#development-guide)
10. [Security](#security)

---

## Overview

### What is the Extension?

The CredVerify browser extension is a **Chrome/Firefox** extension that allows users to verify certificates with a single click directly from certification platforms. It automatically:

- Detects if you're on a trusted certification platform
- Scans the page for certificate images
- Captures screenshots of certificates
- Sends data to the backend for AI-powered verification
- Auto-saves verified certificates to your CredVerify account

### Technology Stack
- **Manifest Version**: 3 (Manifest V3)
- **Browser Support**: Chrome, Firefox (Manifest V3 compatible)
- **Backend**: CredVerify API (Node.js + Express)
- **Storage**: Chrome Storage API (local)
- **Messaging**: Chrome Messaging API

---

## Features

### ✅ Core Features

1. **One-Click Verification**
   - Select certificate image from page
   - Click "Verify" button
   - Automatic OCR + AI analysis
   - Auto-save to CredVerify account

2. **Platform Whitelisting**
   - Only works on 50+ trusted certification platforms
   - Prevents verification of non-certificate content
   - Real-time domain validation

3. **Smart Image Detection**
   - Automatically scans page for certificate images
   - Filters out small/irrelevant images
   - Allows manual selection

4. **Anti-Tamper Protection**
   - Captures image fingerprint at selection time
   - Re-validates before sending to backend
   - Prevents image manipulation

5. **User Authentication**
   - Built-in login screen
   - Secure token storage
   - Auto-logout after 7 days

6. **Visual Feedback**
   - Green checkmark for whitelisted domains
   - Warning for non-whitelisted domains
   - Progress indicator during verification
   - Success/error notifications

---

## Architecture

### Component Overview

```
Extension Components:
├── Background Script (background.js)       # Service worker, API calls
├── Popup Script (popup.js)                 # Main UI logic
├── Login Script (login.js)                 # Authentication
├── Platforms Registry (platforms.json)     # Whitelisted domains
├── Config (config.js)                      # API endpoints
└── Manifest (manifest.json)                # Extension metadata
```

### Execution Flow

```
User opens popup
  ↓
Check authentication (checkAuth)
  ↓
Get current tab URL
  ↓
Validate domain against platforms.json
  ↓
Inject content script to scan for images
  ↓
User selects certificate image
  ↓
Capture image fingerprint (anti-tamper)
  ↓
User clicks "Verify"
  ↓
Re-validate image fingerprint
  ↓
Send to backend API (/api/credentials/verify)
  ↓
Backend: OCR → LLM → Validation → Blockchain
  ↓
Display results in popup
  ↓
Auto-save to CredVerify account
```

---

## Installation

### Prerequisites

1. **CredVerify Backend Running**
   - See [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
   - Backend must be running on `http://localhost:5000` or configured URL

2. **CredVerify Account**
   - Sign up at `http://localhost:5173/signup`
   - Role must be **Learner**

### Installation Steps

#### Chrome

1. **Open Extensions Page**
   - Go to `chrome://extensions/`
   - Or: Menu → More Tools → Extensions

2. **Enable Developer Mode**
   - Toggle "Developer mode" in top-right corner

3. **Load Extension**
   - Click "Load unpacked"
   - Navigate to `credVerify/extension/` folder
   - Select folder

4. **Pin Extension (Optional)**
   - Click puzzle icon in toolbar
   - Click pin icon next to "CredVerify Certificate Extractor"

#### Firefox

1. **Open Debugging Page**
   - Go to `about:debugging#/runtime/this-firefox`

2. **Load Extension**
   - Click "Load Temporary Add-on"
   - Navigate to `credVerify/extension/manifest.json`
   - Select file

**Note**: Firefox requires loading each session (temporary extension)

---

## Usage

### Step 1: Login to Extension

1. Click the extension icon in your browser toolbar
2. Enter your CredVerify credentials (same as web app)
3. Click "Login"
4. Token is stored securely for 7 days

### Step 2: Visit a Certification Platform

Navigate to one of the **50+ supported platforms**:

- **MOOCs**: Coursera, Udemy, edX, Udacity, FutureLearn
- **Tech Companies**: Google, Microsoft, IBM, AWS, Oracle
- **Learning Platforms**: LinkedIn Learning, Pluralsight, Skillshare, Khan Academy
- **Coding Platforms**: HackerRank, LeetCode, Kaggle, DataCamp
- **Others**: DeepLearning.AI, NPTEL, Internshala, Code Alpha

See full list in `extension/platforms.json`

### Step 3: Open the Extension

Click the extension icon. You'll see:

- **Green checkmark** + platform name if domain is whitelisted
- **Warning message** if domain is not supported

### Step 4: Select Certificate

The extension automatically scans the page for images.

- **Automatic Detection**: Large images (>200x200px) are listed
- **Manual Selection**: Click any image to select it
- Preview appears in the popup

### Step 5: Verify Certificate

1. Click "Verify Certificate" button
2. Extension will:
   - Re-validate image (anti-tamper)
   - Send to backend API
   - Show progress indicator
3. Wait for verification (10-30 seconds)

### Step 6: View Results

Results displayed in popup:

- ✅ **Verified**: Green card with extracted data
- ❌ **Failed**: Red card with error message

Verified certificates are **automatically saved** to your CredVerify account.

---

## How It Works

### 1. Domain Whitelisting

**platforms.json**:
```json
{
  "platforms": [
    {
      "id": "coursera",
      "name": "Coursera",
      "category": "mooc",
      "domains": ["coursera.org", "learner.coursera.com"]
    },
    {
      "id": "ibm",
      "name": "IBM",
      "category": "tech_company",
      "domains": ["ibm.com", "skillsbuild.org"]
    }
  ]
}
```

**Domain Check** (`background.js`):
```javascript
function isWhitelistedDomain(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  return WHITELISTED_DOMAINS.some(domain => {
    const d = domain.toLowerCase();
    return hostname === d || hostname === `www.${d}` || hostname.endsWith(`.${d}`);
  });
}
```

### 2. Image Detection

**Content Script Injection** (`popup.js`):
```javascript
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
await chrome.scripting.executeScript({
  target: { tabId: tab.id },
  func: () => {
    const images = Array.from(document.querySelectorAll('img'))
      .filter(img => img.width >= 200 && img.height >= 200) // Filter small images
      .map(img => ({ src: img.src, width: img.width, height: img.height }));
    return images;
  }
});
```

### 3. Anti-Tamper Protection

**Fingerprint Capture**:
```javascript
async function captureImageFingerprint(imageUrl) {
  const response = await fetch(imageUrl);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return { hash: hashHex, timestamp: Date.now() };
}
```

**Validation Before Verify**:
```javascript
async function verifyWithAntiTamper() {
  // Re-fetch image and compute hash
  const currentHash = await captureImageFingerprint(selectedImageUrl);
  
  // Compare with baseline
  if (currentHash.hash !== baselineImageHash) {
    throw new Error('Image has been modified since selection');
  }
  
  // Check age (max 5 minutes)
  const age = Date.now() - baselineImageTimestamp;
  if (age > 5 * 60 * 1000) {
    throw new Error('Image fingerprint expired, please re-select');
  }
  
  // Proceed with verification...
}
```

### 4. Backend Communication

**API Call** (`background.js`):
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'verifyCredential') {
    const formData = new FormData();
    formData.append('screenshot', request.imageBlob, 'certificate.png');
    formData.append('sourceUrl', request.sourceUrl);
    formData.append('autoSave', 'true');
    
    fetch('http://localhost:5000/api/credentials/verify', {
      method: 'POST',
      body: formData,
      credentials: 'include' // Send cookies
    })
    .then(res => res.json())
    .then(data => sendResponse({ success: true, data }))
    .catch(err => sendResponse({ success: false, error: err.message }));
    
    return true; // Async response
  }
});
```

**Popup Trigger** (`popup.js`):
```javascript
async function verifyCredential() {
  const response = await chrome.runtime.sendMessage({
    action: 'verifyCredential',
    imageBlob: selectedImageBlob,
    sourceUrl: currentPageUrl,
    autoSave: true
  });
  
  if (response.success) {
    showSuccessResult(response.data);
  } else {
    showErrorResult(response.error);
  }
}
```

---

## Platform Detection

### Supported Platforms (50+)

**MOOCs (16 platforms)**:
- Coursera, Udemy, edX, Udacity, FutureLearn, Skillshare, Khan Academy, Pluralsight, DataCamp, Treehouse, Codecademy, Alison, Open Yale Courses, MIT OpenCourseWare, Cognitive Class, Code Institute

**Tech Companies (8)**:
- Google, Microsoft, IBM, AWS, Oracle, Salesforce, Cisco, SAP

**Learning Platforms (6)**:
- LinkedIn Learning, LinkedIn (Learning pages only), Scrimba, Educative, A Cloud Guru, Linux Academy

**Coding/Data Science (7)**:
- HackerRank, LeetCode, Kaggle, CodeChef, Codeforces, TopCoder, Project Euler

**AI/ML (3)**:
- DeepLearning.AI, Fast.ai, Elements of AI

**Indian Platforms (6)**:
- NPTEL, SWAYAM, Internshala, Code Alpha, TCS iON, Simplilearn

**Others (4)**:
- Unstop (Dare2Compete), Great Learning, Udacity Nanodegree, General Assembly

### LinkedIn Special Case

**LinkedIn Learning Only**:
```javascript
function checkLinkedIn(url) {
  const u = new URL(url);
  const host = u.hostname.toLowerCase();
  
  if (!host.includes('linkedin.com')) return null;
  
  // Allow only LinkedIn Learning
  if (url.includes('linkedin.com/learning')) {
    return { allowed: true, platform: { name: 'LinkedIn Learning' } };
  }
  
  // Block profile certificates
  return {
    allowed: false,
    reason: 'LinkedIn profile certificates are not verifiable. Only LinkedIn Learning pages are supported.'
  };
}
```

---

## File Structure

```
extension/
├── manifest.json                # Extension metadata
├── config.js                    # API endpoint configuration
├── platforms.json               # Whitelisted platforms
│
├── html/
│   ├── popup.html               # Main popup UI
│   └── login.html               # Login screen
│
├── js/
│   ├── background.js            # Background service worker
│   ├── popup.js                 # Popup logic (659 lines)
│   └── login.js                 # Login logic
│
├── css/
│   ├── popup.css                # Popup styles
│   └── tokens.css               # Design system tokens
│
├── icons/
│   ├── 16x16.png                # Extension icon (16px)
│   ├── 48x48.png                # Extension icon (48px)
│   └── 128x128.png              # Extension icon (128px)
│
└── README.md                    # Original extension docs
```

---

## Development Guide

### Setup

1. **Clone Repository**
   ```bash
   cd credVerify/extension
   ```

2. **Configure API Endpoint**
   Edit `config.js`:
   ```javascript
   const CONFIG = {
     API_URL: 'http://localhost:5000/api'
   };
   ```

3. **Load Extension** (see [Installation](#installation))

### Editing Platforms

Add/remove platforms in `platforms.json`:

```json
{
  "platforms": [
    {
      "id": "new_platform",
      "name": "New Platform Name",
      "category": "mooc",
      "domains": ["example.com", "www.example.com"]
    }
  ]
}
```

Categories:
- `mooc` - Online course platforms
- `tech_company` - Tech certification providers
- `learning` - General learning platforms
- `coding` - Coding challenge platforms
- `ai_ml` - AI/ML specific platforms
- `indian` - India-specific platforms
- `other` - Miscellaneous

### Debugging

**Chrome DevTools**:
```
1. Right-click extension icon → Inspect popup
2. Background script: chrome://extensions → Service worker (Inspect)
3. Console logs in both popup and background
```

**Firefox DevTools**:
```
1. about:debugging#/runtime/this-firefox
2. Click "Inspect" under extension
3. Console tab for logs
```

### Testing

**Manual Testing Checklist**:

1. ✅ Login with valid credentials
2. ✅ Login with invalid credentials (should fail)
3. ✅ Visit whitelisted domain (should show green)
4. ✅ Visit non-whitelisted domain (should show warning)
5. ✅ Select certificate image
6. ✅ Verify certificate (should succeed)
7. ✅ Verify non-certificate image (should fail)
8. ✅ Logout and re-login
9. ✅ Token expiry (7 days later)
10. ✅ Anti-tamper: modify image after selection (should fail)

---

## Security

### Authentication

- **Token Storage**: Chrome Storage API (local storage)
- **Token Expiry**: 7 days from login
- **Token Format**: JWT (HTTP-only cookie set by backend)
- **Auto-Logout**: On 401 response from API

### Anti-Tamper

- **SHA-256 Fingerprint**: Image hash computed at selection time
- **Re-Validation**: Image re-fetched and hashed before verification
- **Time Limit**: 5 minutes max between selection and verification
- **Error Handling**: Clear error message if tamper detected

### Domain Whitelisting

- **Prevents Phishing**: Only trusted domains allowed
- **No User Override**: Users cannot bypass whitelist
- **Centralized List**: `platforms.json` managed by CredVerify team

### API Security

- **HTTPS Only**: Production uses HTTPS (development uses HTTP)
- **CORS**: Backend restricts origins
- **Authentication Required**: All verification endpoints require auth
- **Rate Limiting**: Backend enforces rate limits (TODO)

### Permissions

**Minimal Permissions**:
- `activeTab` - Access current tab only (no browsing history)
- `storage` - Store auth token locally
- `scripting` - Inject image detection script
- `tabs` - Get current tab URL

**No Permissions For**:
- Browsing history
- All tabs (only active tab)
- Clipboard access
- File system access

---

## Common Issues

### 1. "Domain not whitelisted" Error

**Cause**: Current page is not in `platforms.json`

**Solution**:
- Check if platform should be supported
- If yes, add to `platforms.json` and reload extension
- If no, use manual verification on CredVerify web app

### 2. "Image has been modified" Error

**Cause**: Anti-tamper detected image change

**Solutions**:
- Re-select the image
- Don't wait more than 5 minutes between selection and verification
- Ensure image URL hasn't changed (some sites rotate images)

### 3. Login Not Working

**Causes**:
- Backend not running
- Wrong credentials
- CORS issue

**Solutions**:
- Verify backend is running on `http://localhost:5000`
- Check credentials on web app first
- Check browser console for errors
- Verify `config.js` has correct API URL

### 4. No Images Detected

**Causes**:
- Page has no images
- All images too small (<200x200px)
- Images loaded dynamically

**Solutions**:
- Wait for page to fully load
- Click "Refresh" button in popup
- Try scrolling page to trigger image loading
- Use manual verification on web app

---

## Next Steps

- **Backend Integration**: See [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
- **Frontend Integration**: See [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md)
- **Blockchain Verification**: See [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md)

---

**Last Updated**: December 4, 2025
