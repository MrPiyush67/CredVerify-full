# 🛡️ Anti-Tamper Protection - Technical Documentation

## ✅ Implementation Status: ACTIVE & COMPLETE

The browser extension implements **perceptual hash-based anti-tampering** to prevent certificate image manipulation attacks.

> **Note**: For general extension documentation, see [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md). This document provides detailed technical implementation of the anti-tamper system.

---

## 🔐 How It Works

### **Attack Vector Protected:**
- Malicious user opens legitimate certificate page
- Uses DevTools/scripts to replace certificate image with fake one  
- Tries to verify fake certificate as authentic

### **Defense Mechanism:**

#### **Phase 1: Pre-Verification (First Click)**
1. User selects certificate image
2. Extension downloads image blob
3. **Calculates perceptual hash (pHash)**:
   - Resize image to 8x8 pixels (64 pixels total)
   - Convert each pixel to grayscale
   - Calculate average pixel brightness
   - Create binary hash: `pixel > average = 1, else = 0`
   - Convert 64-bit binary to 16-character hex string
4. **Stores anti-tamper data**:
   ```javascript
   {
     imageHash: "a3f5c2d8b4e1f9a6",
     imageUrl: "https://coursera.org/cert.jpg",
     pageUrl: "https://coursera.org/verify/ABC123",
     timestamp: 1701518400000
   }
   ```
5. **Automatically refreshes the page** (clears DOM modifications)
6. Popup closes

#### **Phase 2: Post-Refresh Verification**
1. Extension auto-reopens after page refresh
2. Detects pending anti-tamper check in storage
3. Shows: `🔐 Verifying certificate authenticity after page refresh...`
4. **Re-scans ALL images on the page**:
   - Filters images >200x200 pixels
   - For each image:
     - Download blob
     - Calculate perceptual hash
     - Compare with stored hash
5. **Hash Comparison** (with tolerance):
   - Calculates Hamming distance (bit differences)
   - Allows up to 10% difference (for compression variations)
   - Exact match = Authentic ✅
   - No match = Tampered ❌

#### **Phase 3: Result**
- **✅ Match Found**: 
  - "Anti-tamper check passed! Certificate is authentic"
  - Auto-proceeds with OCR + AI verification
  
- **❌ No Match**:
  - "Anti-tamper check FAILED! Image has changed or was removed"
  - Verification blocked
  - User must select certificate again

---

## 🧪 Implementation Details

### **Functions Added:**

#### 1. `calculateImageHash(blob)` 
```javascript
// Creates 64-bit perceptual hash
// Returns: "a3f5c2d8b4e1f9a6" (16 hex chars)
```

**Algorithm:**
1. Load image into canvas
2. Resize to 8x8 pixels (standardized size)
3. Convert each pixel to grayscale: `(R + G + B) / 3`
4. Calculate average pixel value
5. Create binary: `pixel > avg ? '1' : '0'`
6. Convert 64-bit binary to hex

**Why 8x8?**
- Resistant to minor compression changes
- Resistant to small resolution differences
- **But detects completely different images**

#### 2. `compareImageHashes(hash1, hash2)`
```javascript
// Returns true if hashes match within 10% tolerance
```

**Hamming Distance:**
- Counts number of differing characters
- Tolerance = 10% of hash length (1-2 characters)
- Allows for compression artifacts
- Rejects different images

#### 3. `initiateAntiTamperCheck()`
```javascript
// Phase 1: Calculate hash, store, refresh page
```

**Steps:**
1. Calculate hash of selected image
2. Store in `chrome.storage.local`
3. Refresh current tab
4. Popup closes automatically

#### 4. `performAntiTamperCheck(storedData)`
```javascript
// Phase 2: Re-scan page, find matching image
```

**Steps:**
1. Verify same page URL
2. Inject script to collect all images
3. For each image: calculate hash
4. Find match → Continue verification
5. No match → Block verification

#### 5. `checkAntiTamperStatus()`
```javascript
// Called on init() to detect pending check
```

**Checks:**
- Looks for `cv_anti_tamper_pending` in storage
- If found: triggers `performAntiTamperCheck()`
- If not: normal operation

---

## 🎯 Integration with Verification Flow

### **Updated Workflow:**

```
User clicks "Verify Certificate"
         ↓
   First time verification?
         ↓ YES
   Calculate image hash
         ↓
   Store hash + metadata
         ↓
   REFRESH PAGE (clears DOM tampering)
         ↓
   Extension reopens
         ↓
   Detect pending anti-tamper check
         ↓
   Re-scan page for images
         ↓
   Calculate hashes for all images
         ↓
   Find matching hash?
         ↓ YES               ↓ NO
   ✅ Authentic        ❌ Tampered
         ↓                   ↓
   Proceed with         Block verification
   OCR + AI            Show error
   verification
```

---

## 🔒 Security Analysis

### **Strengths:**

1. **DOM Manipulation Resistant**
   - Page refresh clears all JavaScript modifications
   - Injected images won't survive refresh

2. **Perceptual Hash (pHash)**
   - Same image = Same hash (even with minor changes)
   - Different image = Different hash
   - Resistant to compression, scaling, rotation

3. **10% Tolerance**
   - Handles JPEG compression artifacts
   - Handles minor resolution differences
   - Still rejects completely different images

4. **Automatic Process**
   - User doesn't need to do anything extra
   - Transparent security layer
   - Clear feedback on success/failure

### **Potential Weaknesses:**

1. **Advanced Image Editing**
   - If attacker creates visually similar fake certificate
   - With same perceptual hash (extremely difficult)
   - Mitigation: Combine with dual domain validation

2. **Timing Attack**
   - If attacker modifies image during refresh
   - Extremely difficult to execute
   - Window is <500ms

3. **Browser Extension Conflicts**
   - Other extensions might interfere with page refresh
   - Mitigation: Error handling and retry logic

### **Combined Security (Anti-Tamper + Dual Domain):**

```
Anti-Tamper Check (Image Authenticity)
         ↓
   OCR Extraction
         ↓
   Domain Validation #1 (pageUrl)
         ↓
   Domain Validation #2 (certificateUrl from OCR)
         ↓
   Name Matching (User vs Certificate)
         ↓
   LLM Metadata Extraction
         ↓
   Final Verification Score
```

**Defense Layers:**
1. ✅ Anti-Tamper (Prevents image swap)
2. ✅ Dual Domain (Validates source + certificate URL)
3. ✅ Name Matching (Validates ownership)
4. ✅ LLM Extraction (Validates metadata)

---

## 📊 User Experience

### **First Verification:**
```
1. User selects certificate image
2. User clicks "Verify Certificate"
3. Shows: "🔄 Step 1/2: Calculating image fingerprint..."
4. Shows: "🔄 Step 2/2: Refreshing page to verify authenticity..."
5. Page refreshes (popup closes)
```

### **After Refresh:**
```
1. Extension auto-reopens
2. Shows: "🔐 Verifying certificate authenticity after page refresh..."
3. Shows: "Scanning page for certificate image..."
4. Shows: "Checking image 1/5..."
5. Shows: "Checking image 2/5..."
6. Match found!
7. Shows: "✅ Anti-tamper check passed! Certificate is authentic"
8. Auto-proceeds with verification
```

### **If Tampered:**
```
Shows: "⚠️ Anti-tamper check FAILED! The certificate image has 
changed or was removed after page refresh. This may indicate 
tampering. Please select the certificate again."
```

---

## 🧪 Testing Scenarios

### **Test 1: Normal Verification**
1. Open Coursera certificate page
2. Select certificate image
3. Click verify
4. **Expected**: Page refreshes → Anti-tamper passes → Verification succeeds

### **Test 2: DOM Manipulation Attack**
1. Open Coursera certificate page
2. Select certificate image
3. **Before clicking verify**: Use DevTools to replace image src
4. Click verify
5. Page refreshes (clears modification)
6. **Expected**: Original image still on page → Anti-tamper passes

### **Test 3: Image Removal Attack**
1. Open Coursera certificate page
2. Select certificate image
3. Click verify
4. **During refresh**: Remove image from DOM
5. **Expected**: Anti-tamper fails → Verification blocked

### **Test 4: Different Image Swap**
1. Open Coursera certificate page
2. Select certificate image
3. Note the certificate ID
4. **After refresh, before anti-tamper check**: Replace with different certificate
5. **Expected**: Hash mismatch → Anti-tamper fails

---

## 📝 Configuration

### **Storage Keys:**

```javascript
cv_anti_tamper_pending: {
  imageHash: string,      // 16-character hex hash
  imageUrl: string,       // Original image URL
  pageUrl: string,        // Page URL for validation
  timestamp: number       // Epoch milliseconds
}
```

### **Constants:**

```javascript
HASH_SIZE = 8              // 8x8 pixel grid (64 pixels)
HASH_TOLERANCE = 0.1       // 10% Hamming distance allowed
MIN_IMAGE_SIZE = 200       // Minimum 200x200 pixels to scan
```

---

## ✅ Verification Checklist

- [x] Perceptual hash algorithm implemented
- [x] Hash comparison with tolerance
- [x] Anti-tamper initiation function
- [x] Post-refresh verification function
- [x] Storage management (save/clear)
- [x] Integration with verify workflow
- [x] Error handling
- [x] User feedback messages
- [x] Auto-proceed after success
- [x] Page URL validation
- [x] Image scanning on refresh
- [x] Progress indicators

---

## 🚀 Next Steps

### **Immediate:**
1. ✅ Test with real certificates
2. ✅ Verify page refresh behavior
3. ✅ Test hash matching tolerance

### **Future Enhancements:**
1. **Certificate ID Extraction**: Extract ID from URL and validate format
2. **Image Metadata Check**: Analyze EXIF data for tampering signs
3. **Blockchain Verification**: Cross-validate with platform's blockchain records
4. **Multiple Hash Algorithms**: Combine pHash with dHash for stronger detection
5. **Machine Learning**: Detect AI-generated fake certificates

---

## 📚 References

- **Perceptual Hash (pHash)**: http://www.phash.org/
- **Hamming Distance**: https://en.wikipedia.org/wiki/Hamming_distance
- **Image Fingerprinting**: https://en.wikipedia.org/wiki/Digital_watermarking

---

**Status**: ✅ **ACTIVE AND OPERATIONAL**

**Last Updated**: December 2, 2025

**Version**: 1.0.0
