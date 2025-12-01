# Certificate Verification System

Complete production-grade OCR + LLM pipeline for certificate verification.

## Architecture

```
Image → Tesseract OCR → Raw Text → Gemini LLM → Structured JSON → Post-Processing → Name Matching → Domain Validation → Database
```

## Pipeline Steps

1. **OCR Extraction** - Tesseract.js extracts text from certificate image
2. **LLM Processing** - Gemini API structures the data into JSON (with regex fallback)
3. **Post-Processing** - Cleans data, removes noise, normalizes dates/skills
4. **Name Matching** - Fuzzy comparison with user's legal name from DB (not from frontend)
5. **Domain Validation** - Verifies source URL against whitelist and issuer
6. **Database Storage** - Saves credential with all metadata

## Folder Structure

```
backend/src/features/credential/
├── ocr/
│   └── ocr.service.js              # Tesseract OCR extraction
├── llm/
│   └── llm.service.js              # Gemini LLM + regex fallback
├── processing/
│   └── postProcessor.service.js    # Data cleaning & normalization
├── validation/
│   ├── nameMatcher.service.js      # Fuzzy name comparison
│   └── domainValidator.service.js  # Domain whitelist & verification
├── verification/
│   ├── verification.service.js     # Main pipeline orchestration
│   └── verification.controller.js  # API controllers
├── credential.model.js             # Mongoose schema
└── credential.routes.js            # API routes
```

## Installation

```bash
cd backend
npm install
```

## New Dependencies

```json
{
  "@google/generative-ai": "^0.21.0",
  "tesseract.js": "^5.1.1",
  "string-similarity": "^4.0.4"
}
```

## Environment Variables

Add to `.env`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

## API Endpoints

### 1. Verify Certificate (Complete Pipeline)

**POST** `/api/credentials/verify-certificate`

Process certificate image through complete pipeline and optionally save to database.

**Headers:**
```
Authorization: Bearer <jwt-token>
Content-Type: application/json
```

**Body:**
```json
{
  "imageData": "base64-encoded-image-string",
  "sourceUrl": "https://coursera.org/verify/ABC123",
  "imageType": "base64",
  "fileData": {
    "url": "https://storage.com/cert.jpg",
    "fileName": "certificate.jpg",
    "fileType": "image/jpeg",
    "storageId": "file-123"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Certificate verified and saved successfully",
  "data": {
    "credential": {
      "_id": "507f1f77bcf86cd799439011",
      "user": "507f1f77bcf86cd799439012",
      "legalNameSnapshot": "John Michael Smith",
      "certificateName": "John M Smith",
      "nameMatchConfidence": 87,
      "title": "Machine Learning Specialization",
      "issuer": "Coursera",
      "issueDate": "2024-11-15T00:00:00.000Z",
      "credentialId": "ABC123XYZ456",
      "skills": ["Machine Learning", "Python", "Neural Networks"],
      "isDomainTrusted": true,
      "isIssuerVerified": true
    },
    "processing": {
      "success": true,
      "extractionMethod": "llm",
      "extractedData": { ... },
      "nameValidation": {
        "legalName": "John Michael Smith",
        "certificateName": "John M Smith",
        "match": true,
        "confidence": 87,
        "reason": "High similarity match"
      },
      "domainValidation": {
        "sourceUrl": "https://coursera.org/verify/ABC123",
        "domain": "coursera.org",
        "isValid": true,
        "isTrusted": true,
        "reason": "Domain is whitelisted as trusted issuer"
      },
      "warnings": []
    }
  }
}
```

### 2. Extract Preview (No Save)

**POST** `/api/credentials/extract-preview`

Extract data without saving to database (for preview/testing).

**Body:**
```json
{
  "imageData": "base64-encoded-image-string",
  "sourceUrl": "https://coursera.org/verify/ABC123",
  "imageType": "base64"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Certificate data extracted successfully",
  "data": {
    "extractedData": {
      "personName": "John M Smith",
      "certificateName": "Machine Learning Specialization",
      "issuerName": "Coursera",
      "certificateId": "ABC123XYZ456",
      "issueDate": "2024-11-15",
      "skills": ["Machine Learning", "Python"],
      "NSQFLevel": 7,
      "learningHours": 120
    },
    "nameValidation": { ... },
    "domainValidation": { ... },
    "warnings": ["Name match confidence is low - please verify identity"]
  }
}
```

### 3. Get Trusted Domains

**GET** `/api/credentials/trusted-domains`

Get whitelist of trusted certificate issuers.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "domains": [
      "coursera.org",
      "udacity.com",
      "edx.org",
      "nptel.ac.in",
      "google.com",
      ...
    ],
    "count": 30
  }
}
```

## Extracted Data Format

All certificates return this structure:

```typescript
{
  personName: string | null,
  certificateName: string | null,    // Course/Program name
  issuerName: string | null,
  companyName: string | null,
  certificateId: string | null,
  verificationLink: string | null,
  issueDate: string | null,          // YYYY-MM-DD
  completionDate: string | null,     // YYYY-MM-DD
  duration: string | null,
  grade: string | null,
  NSQFLevel: number | null,          // 1-10
  learningHours: number | null,
  skills: string[],
  description: string | null
}
```

## Identity Protection Rules

1. **User's legal name** is ALWAYS fetched from backend database (`user.name`)
2. **NEVER** accept name from frontend/extension
3. Name comparison uses fuzzy matching with confidence scoring
4. Minimum confidence threshold: 60%
5. Supports variations: initials, middle name differences, spelling variations

## Domain Validation Rules

1. **Only trust the page URL** from extension (`sourceUrl`)
2. Check against whitelist of 30+ trusted domains
3. Fuzzy match domain with certificate issuer name
4. Mark as trusted if:
   - Domain is whitelisted, OR
   - Domain fuzzy matches issuer name (≥60% confidence)

## Post-Processing Rules

1. Remove noise words from `personName`: "for", "participating", "has completed", etc.
2. Nullify `certificateId` if:
   - Length < 4 characters, OR
   - Contains no digits
3. Normalize dates to ISO format (YYYY-MM-DD)
4. Convert skills to array, remove duplicates
5. Validate NSQF level (1-10)
6. Validate learning hours (≥0)

## Error Handling

### Common Errors

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Image data is required"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "OCR extraction failed: insufficient text extracted",
  "error": "Stack trace (development only)"
}
```

### LLM Fallback

If Gemini API fails, system automatically falls back to regex extraction:

```json
{
  "extractionMethod": "regex",
  "warnings": ["LLM extraction failed, using regex fallback"]
}
```

## Testing

### Using cURL

```bash
# Get JWT token first
TOKEN="your-jwt-token"

# Verify certificate
curl -X POST http://localhost:5000/api/credentials/verify-certificate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "sourceUrl": "https://coursera.org/verify/ABC123",
    "imageType": "base64"
  }'
```

### Using Postman

1. Create new POST request to `http://localhost:5000/api/credentials/verify-certificate`
2. Add Authorization header: `Bearer <token>`
3. Body (JSON):
   ```json
   {
     "imageData": "<base64-image>",
     "sourceUrl": "https://coursera.org/verify/ABC123"
   }
   ```

## Chrome Extension Integration

```javascript
// In extension background.js or popup.js
const token = await getAuthToken();
const imageBase64 = await captureImage();

const response = await fetch('http://localhost:5000/api/credentials/verify-certificate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    imageData: imageBase64,
    sourceUrl: window.location.href,
    imageType: 'base64',
  }),
});

const result = await response.json();
console.log(result);
```

## Performance

- OCR: ~3-5 seconds per image
- LLM: ~2-3 seconds per request
- Total pipeline: ~5-10 seconds
- Concurrent requests: Tested up to 10 simultaneous

## Security

1. All routes require JWT authentication
2. User identity verified via database, not client input
3. CORS configured for trusted origins only
4. Input sanitization via express-mongo-sanitize
5. Helmet.js security headers enabled

## Monitoring

Enable logging in production:

```javascript
// In verification.service.js
console.log('Step 1/6: Extracting text via OCR...');
console.log('Step 2/6: Extracting structured data via LLM...');
// etc.
```

## Future Enhancements

- [ ] Support for PDF certificates
- [ ] Multi-language OCR support
- [ ] Machine learning model for issuer verification
- [ ] Blockchain-based certificate validation
- [ ] Real-time issuer API integration
- [ ] Batch processing for multiple certificates

## Troubleshooting

### OCR returns empty text
- Check image quality (min 300 DPI recommended)
- Ensure text is horizontal and clear
- Try preprocessing: increase contrast, remove noise

### LLM returns invalid JSON
- Fallback to regex is automatic
- Check GEMINI_API_KEY is valid
- Verify API quota not exceeded

### Name match confidence low
- Check for spelling variations
- Verify user.name in database is correct
- Review normalization logic in nameMatcher.service.js

### Domain not trusted
- Add domain to whitelist in domainValidator.service.js
- Or improve fuzzy matching threshold
- Verify sourceUrl is correct

## License

MIT
