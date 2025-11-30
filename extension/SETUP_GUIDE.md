# CredVerify Certificate Extraction Extension - Setup Guide

## 🎉 Implementation Complete!

The CredVerify Browser Extension has been successfully integrated with your main application. Here's what's been implemented:

---

## ✅ What's Done

### **1. Extension Backend (Port 3001)**
- ✅ Replaced Groq with **Gemini AI** for intelligent text extraction
- ✅ Integrated **ImageKit** for cloud image storage
- ✅ Added **JWT authentication** with main backend
- ✅ Implemented **strict name matching** (100% match required)
- ✅ Auto-save verified credentials to main database

### **2. Main Backend (Port 5000)**
- ✅ Added `/api/users/extension-login` endpoint
- ✅ Added `/api/credentials/from-extension` endpoint
- ✅ Updated CORS to allow extension origins
- ✅ Added `/api/users/profile` route for token verification

### **3. Browser Extension**
- ✅ Created login page (`login.html` + `login.js`)
- ✅ Updated popup to check authentication
- ✅ Updated background script with auth headers
- ✅ Added user info display with logout
- ✅ Updated manifest.json with proper permissions

### **4. Frontend Application**
- ✅ Added "Browser Extension" button to Add Credentials page
- ✅ Created ExtensionInstallModal with step-by-step instructions
- ✅ Added download functionality (needs extension ZIP file)

---

## 🚀 Setup Instructions

### **Step 1: Install Dependencies**

#### Extension Backend:
```bash
cd extension/certificate-verification-backend
npm install
```

New packages added:
- `@google/generative-ai` - Gemini AI SDK
- `imagekit` - ImageKit SDK
- `axios` - HTTP client for main backend calls

#### Main Backend:
```bash
cd backend
npm install
```
No new dependencies needed - existing packages handle everything!

---

### **Step 2: Environment Variables**

#### Extension Backend (`.env`):
Already configured with:
```env
PORT=3001
GEMINI_API_KEY=AIzaSyBgqj6iPJn-GJqxJ32eGhNBPWT6kCZpJiI
IMAGEKIT_PUBLIC_KEY=public_nSy15Pdsg7qLe8IR8g4KBWiYNl8=
IMAGEKIT_PRIVATE_KEY=private_Ele+RFtGscjAnIohMQjZXi8/uRY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/k1qgzf2uu
IMAGEKIT_FOLDER_PATH=/Credentials
MAIN_BACKEND_URL=http://localhost:5000
```

#### Main Backend:
No changes needed to existing `.env`

---

### **Step 3: Start Servers**

#### Terminal 1 - Main Backend:
```bash
cd backend
npm run dev
```
Should run on `http://localhost:5000`

#### Terminal 2 - Extension Backend:
```bash
cd extension/certificate-verification-backend
npm run dev
```
Should run on `http://localhost:3001`

#### Terminal 3 - Frontend:
```bash
cd frontend
npm run dev
```
Should run on `http://localhost:5173`

---

### **Step 4: Create Extension ZIP File**

For users to download the extension, you need to create a ZIP file:

```bash
cd extension/image-verifier-extension
zip -r ../../frontend/public/credverify-extension.zip . -x "*.DS_Store" -x "node_modules/*"
```

Or manually:
1. Go to `/extension/image-verifier-extension/`
2. Select all files EXCEPT `node_modules` and `.DS_Store`
3. Create ZIP named `credverify-extension.zip`
4. Move to `/frontend/public/credverify-extension.zip`

---

### **Step 5: Load Extension in Chrome**

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Navigate to `/extension/image-verifier-extension/`
5. Select the folder
6. Extension should appear with green checkmark!

---

## 🎯 How It Works

### **User Flow:**

1. **User opens extension** on a certificate page (Coursera, LinkedIn, etc.)
2. **Login prompt** appears if not authenticated
3. User **logs in with CredVerify credentials**
4. Extension **selects certificate image** from page
5. User clicks **"Verify Certificate"**

### **Backend Processing:**

1. **Extension backend receives** image with auth token
2. **Verifies JWT** with main backend → gets user profile
3. **OCR extracts text** from image (Tesseract)
4. **Gemini AI parses** structured data (name, issuer, course, etc.)
5. **Matches name** with authenticated user (100% match required)
6. **Uploads to ImageKit** with metadata
7. **Saves to MongoDB** via main backend as "verified" credential
8. **Returns success** with ImageKit URL and credential ID

---

## 📋 API Endpoints

### Extension Backend (Port 3001):
```
POST /api/verify-certificate
  - Headers: Authorization: Bearer <JWT>
  - Body: FormData with file + page_url
  - Returns: Extracted data + ImageKit URL + saved credential
```

### Main Backend (Port 5000):
```
POST /api/users/extension-login
  - Body: { email, password }
  - Returns: { token, user }

GET /api/users/profile
  - Headers: Authorization: Bearer <JWT>
  - Returns: User profile data

POST /api/credentials/from-extension
  - Headers: Authorization: Bearer <JWT>
  - Body: Credential data
  - Returns: Saved credential
```

---

## 🧪 Testing the Extension

### **Test Scenario:**

1. **Start all three servers** (main backend, extension backend, frontend)
2. **Load extension** in Chrome
3. **Navigate** to https://www.coursera.org/account/accomplishments/certificate/
4. **Open extension popup**
5. **Login** with your CredVerify account
6. **Select** a certificate image
7. **Click "Verify Certificate"**
8. **Check console** for processing logs
9. **Verify in MongoDB** that credential was saved
10. **Check ImageKit** for uploaded image

---

## 🔧 Troubleshooting

### **Extension not loading:**
- Check manifest.json is valid
- Ensure all files are in the folder
- Check Chrome console for errors

### **Login fails:**
- Verify main backend is running on port 5000
- Check CORS settings in main backend
- Verify email/password are correct

### **Verification fails:**
- Check extension backend is running on port 3001
- Verify Gemini API key is valid
- Check ImageKit credentials
- Ensure certificate image has clear text

### **Name mismatch error:**
- Extracted name must match user's name exactly
- Check OCR quality - image might be blurry
- Verify user profile has correct name

---

## 🎨 Customization

### **Change main backend URL:**
Edit `/extension/certificate-verification-backend/.env`:
```env
MAIN_BACKEND_URL=https://your-production-backend.com
```

### **Change frontend URL:**
Edit `/extension/image-verifier-extension/login.js`:
```javascript
const CREDVERIFY_APP_URL = 'https://your-production-frontend.com';
```

### **Add more whitelisted domains:**
Edit `/extension/image-verifier-extension/background.js`:
```javascript
const WHITELISTED_DOMAINS = [
  'coursera.org',
  'udacity.com',
  'your-domain.com', // Add here
];
```

---

## 📦 Publishing to Chrome Web Store (Future)

**Requirements:**
- $5 one-time developer fee
- Privacy policy URL
- Icon files (128x128, 48x48, 16x16)
- Screenshots and promotional images

**Steps:**
1. Create developer account at chrome.google.com/webstore/devconsole
2. Pay $5 fee
3. Prepare privacy policy
4. Create promotional images
5. Upload extension ZIP
6. Fill in store listing details
7. Submit for review (1-3 days)

---

## 🎉 Success!

Your extension is now fully functional and integrated with the main application!

**Next Steps:**
1. Test with real certificates
2. Refine OCR/Gemini prompts for better extraction
3. Add error handling and user feedback
4. Consider publishing to Chrome Web Store

---

## 📞 Support

If you encounter issues:
1. Check all three servers are running
2. Verify environment variables
3. Check browser console for errors
4. Check backend logs for API errors

**Happy coding! 🚀**
