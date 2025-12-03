# Certificate Verification Workflow - Implementation Plan

## Current State Analysis

### Existing Components (OLD MODEL - TO REFACTOR)
- ✅ `ocr.service.js` - Tesseract.js OCR extraction
- ✅ `llm.service.js` - Gemini API for metadata extraction
- ✅ `nameMatcher.service.js` - String similarity matching
- ✅ `domainValidator.service.js` - Platform whitelist validation
- ✅ `imagekitService.js` - Image upload to ImageKit
- ✅ `verification.service.js` - OLD workflow (extension-based)
- ✅ `verification.controller.js` - OLD controller
- ✅ `manualVerification.service.js` - QR extraction + Puppeteer scraping
- ✅ `manualVerification.controller.js` - Manual verification endpoint

### Dependencies Available
- Tesseract.js (OCR)
- Google Generative AI (Gemini 2.5 Flash)
- Puppeteer + Stealth Plugin (web scraping)
- Jimp + jsQR (QR code extraction)
- String-similarity (name matching)
- ImageKit (image storage)
- Sharp (image processing)

---

## New Unified Workflow Design

### Input Types
1. **Extension Flow**: Screenshot + extracted text (already processed)
2. **Manual Flow**: Link OR Certificate image with QR

### Core Principle
- **Separate reusable functions** for each stage
- **Two orchestrator functions**:
  - `verifyFromExtension()` - For extension data
  - `verifyFromManualInput()` - For link/QR/certificate

---

## Pipeline Stages

### Stage 1: Input Normalization
**Function**: `normalizeInput(input)`
- Input: `{ type: 'link' | 'qr' | 'extension', data: ... }`
- Output: `{ verificationUrl: string, skipScraping: boolean }`
- Logic:
  - If type = 'link': validate URL → return URL
  - If type = 'qr': extract QR → validate URL → return URL
  - If type = 'extension': return URL from extension data

**Reuses**: `extractUrlFromImage()` from `manualVerification.service.js`

---

### Stage 2: Domain Validation
**Function**: `validateDomain(url)`
- Input: verification URL
- Output: `{ isTrusted: boolean, issuer: object, confidence: number }`
- Logic: Check against `platforms.json` whitelist
- Early rejection if untrusted

**Reuses**: `resolveIssuerFromUrl()` from `domainValidator.service.js`

---

### Stage 3: Page Scraping (Manual flow only)
**Function**: `scrapeCertificatePage(url)`
- Input: verification URL
- Output: `{ screenshot: Buffer, pageText: string, images: [] }`
- Logic: Puppeteer loads page, extracts screenshot + images
- Extension flow skips this (data already provided)

**Reuses**: `scrapeCertificate()` from `manualVerification.service.js`

---

### Stage 4: Certificate Image Extraction
**Function**: `extractCertificateImages(scrapedData)`
- Input: scraped page data OR extension screenshot
- Output: `[{ image: Buffer, source: 'page' | 'extension' }]`
- Logic:
  - For manual: analyze images from page, filter by size/aspect ratio
  - For extension: use provided screenshot directly
  - Fallback: use page screenshot if no images found

**New function needed**

---

### Stage 5: OCR Text Extraction
**Function**: `extractTextFromCertificate(imageBuffer)`
- Input: certificate image buffer
- Output: `{ text: string, confidence: number }`
- Logic: Run Tesseract OCR, filter low-quality results

**Reuses**: `extractTextFromImage()` from `ocr.service.js`

---

### Stage 6: LLM Interpretation
**Function**: `interpretCertificateText(ocrText)`
- Input: raw OCR text
- Output: `{ recipientName, courseTitle, issuer, date, ... }`
- Logic: Send to Gemini, parse structured JSON

**Reuses**: `extractCertificateMetadata()` from `llm.service.js`

---

### Stage 7: Name Matching
**Function**: `matchNameWithUser(extractedName, userProfile)`
- Input: LLM-extracted name + user's legal name
- Output: `{ match: boolean, confidence: number, reason: string }`
- Logic: Fuzzy string matching with similarity threshold

**Reuses**: `findBestNameMatchFromOcr()` from `nameMatcher.service.js`

---

### Stage 8: Calculate Verification Score
**Function**: `calculateVerificationScore(matchResults)`
- Input: name confidence, domain confidence, metadata validity
- Output: `{ score: number, status: 'VERIFIED' | 'REVIEW' | 'REJECTED' }`
- Logic: Weighted scoring (60% name, 30% domain, 10% metadata)

**Reuses**: `calculateFinalVerificationScore()` from `verification.service.js`

---

### Stage 9: Save Verified Credential
**Function**: `saveVerifiedCredential(userId, verificationData, certificateImage)`
- Input: user ID, verification results, certificate image
- Output: saved credential document
- Logic:
  - Upload image to ImageKit
  - Save to MongoDB with all metadata
  - Link to user profile

**Reuses**: `uploadCredentialFile()` from `imagekitService.js`

---

## Implementation Files Structure

```
/backend/src/features/credential/
  verification/
    ├── pipeline/
    │   ├── inputNormalizer.js          [NEW]
    │   ├── domainValidator.js          [REFACTOR existing]
    │   ├── certificateExtractor.js     [NEW]
    │   ├── ocrExtractor.js             [REFACTOR existing]
    │   ├── llmInterpreter.js           [REFACTOR existing]
    │   ├── nameMatcher.js              [REFACTOR existing]
    │   ├── scoreCalculator.js          [REFACTOR existing]
    │   └── credentialSaver.js          [NEW]
    │
    ├── orchestrators/
    │   ├── extensionVerification.js    [NEW - replaces old verification.service.js]
    │   └── manualVerification.js       [NEW - replaces old verification.service.js]
    │
    ├── controllers/
    │   ├── extension.controller.js     [REFACTOR verification.controller.js]
    │   └── manual.controller.js        [REFACTOR manualVerification.controller.js]
    │
    └── routes/
        └── verification.routes.js      [UPDATE]
```

---

## Migration Strategy

### Phase 1: Create new pipeline functions (reusable)
1. Create `pipeline/` folder
2. Extract logic from old services into new pipeline functions
3. Keep old files temporarily for reference

### Phase 2: Create orchestrators
1. Build `extensionVerification.js` orchestrator
2. Build `manualVerification.js` orchestrator
3. Both call the same pipeline functions in correct order

### Phase 3: Update controllers
1. Refactor controllers to use new orchestrators
2. Keep API endpoints unchanged for backward compatibility

### Phase 4: Testing & Cleanup
1. Test both flows thoroughly
2. Remove old `verification.service.js` once confirmed working
3. Update documentation

---

## API Endpoints (No Changes)

### Extension Flow
```
POST /api/credentials/verify-certificate
Body: {
  imageData: "base64...",
  sourceUrl: "https://...",
  extractedText: "..." (optional - if extension did OCR)
}
```

### Manual Flow
```
POST /api/credentials/manual-verify
Body (multipart/form-data): {
  certificateImage: File (optional),
  link: "https://..." (optional)
}
```

---

## Key Improvements Over Old Model

1. **Separation of Concerns**: Each function does ONE thing
2. **Reusability**: Same functions for both extension and manual flows
3. **Testability**: Each pipeline stage can be tested independently
4. **Maintainability**: Clear flow, easy to debug
5. **Extensibility**: Easy to add new verification methods (e.g., API-based verification)

---

## Next Steps

1. ✅ Document current state
2. ⏳ Create pipeline functions
3. ⏳ Build orchestrators
4. ⏳ Update controllers
5. ⏳ Test both flows
6. ⏳ Clean up old code
