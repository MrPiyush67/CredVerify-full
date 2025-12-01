# API Quick Reference - Certificate Verification

## Base URL
```
http://localhost:5000/api/credentials
```

## Authentication
All endpoints require JWT token in header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Endpoint 1: Verify & Save Certificate

**POST** `/verify-certificate`

Process certificate and save to database.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,/9j/4AAQ...",
  "sourceUrl": "https://coursera.org/verify/ABC123",
  "imageType": "base64",
  "fileData": {
    "url": "https://ik.imagekit.io/...",
    "fileName": "cert.jpg",
    "fileType": "image/jpeg",
    "storageId": "file-123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Certificate verified and saved successfully",
  "data": {
    "credential": {
      "_id": "...",
      "nameMatchConfidence": 87,
      "title": "Machine Learning",
      "issuer": "Coursera",
      "isDomainTrusted": true
    },
    "processing": {
      "extractionMethod": "llm",
      "nameValidation": { "confidence": 87 },
      "warnings": []
    }
  }
}
```

---

## Endpoint 2: Extract Preview (No Save)

**POST** `/extract-preview`

Extract and validate data without saving.

**Request:**
```json
{
  "imageData": "data:image/jpeg;base64,...",
  "sourceUrl": "https://coursera.org/verify/ABC123",
  "imageType": "base64"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "extractedData": {
      "personName": "John Smith",
      "certificateName": "Machine Learning",
      "issuerName": "Coursera",
      "certificateId": "ABC123",
      "skills": ["ML", "Python"]
    },
    "nameValidation": {
      "match": true,
      "confidence": 87
    },
    "domainValidation": {
      "isValid": true,
      "isTrusted": true
    },
    "warnings": []
  }
}
```

---

## Endpoint 3: Get Trusted Domains

**GET** `/trusted-domains`

Get whitelist of trusted certificate issuers.

**Response:**
```json
{
  "success": true,
  "data": {
    "domains": [
      "coursera.org",
      "udacity.com",
      "edx.org",
      "ibm.com",
      "google.com",
      ...
    ],
    "count": 30
  }
}
```

---

## Request Fields

### Required
- `imageData` - Base64 image or URL
- `sourceUrl` - Original certificate page URL

### Optional
- `imageType` - "base64" or "url" (default: "base64")
- `fileData` - Storage info (required to save credential)

---

## Extracted Data Format

```typescript
{
  personName: string | null,
  certificateName: string | null,
  issuerName: string | null,
  companyName: string | null,
  certificateId: string | null,
  verificationLink: string | null,
  issueDate: string | null,        // YYYY-MM-DD
  completionDate: string | null,
  duration: string | null,
  grade: string | null,
  NSQFLevel: number | null,         // 1-10
  learningHours: number | null,
  skills: string[],
  description: string | null
}
```

---

## Validation Results

### Name Match
```json
{
  "legalName": "John Michael Smith",
  "certificateName": "John M Smith",
  "match": true,
  "confidence": 87,
  "reason": "High similarity match"
}
```

**Confidence Levels:**
- 90-100%: Exact/near-exact match
- 75-89%: High similarity
- 60-74%: Moderate similarity
- <60%: No match

### Domain Validation
```json
{
  "sourceUrl": "https://coursera.org/verify/ABC123",
  "domain": "coursera.org",
  "isValid": true,
  "isTrusted": true,
  "reason": "Domain is whitelisted as trusted issuer"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Image data is required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "OCR extraction failed: insufficient text",
  "error": "Stack trace (dev mode only)"
}
```

---

## cURL Examples

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya.sharma@example.com",
    "password": "password123",
    "role": "credentialist"
  }'
```

### Verify Certificate
```bash
TOKEN="your-token"

curl -X POST http://localhost:5000/api/credentials/verify-certificate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d @certificate-request.json
```

### Get Trusted Domains
```bash
curl http://localhost:5000/api/credentials/trusted-domains
```

---

## JavaScript Example

```javascript
const token = 'your-jwt-token';
const imageBase64 = 'data:image/jpeg;base64,...';

const response = await fetch('http://localhost:5000/api/credentials/verify-certificate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageData: imageBase64,
    sourceUrl: window.location.href,
    imageType: 'base64'
  })
});

const result = await response.json();
console.log(result);
```

---

## Trusted Domains

coursera.org, udacity.com, edx.org, udemy.com, linkedin.com, google.com, microsoft.com, ibm.com, deeplearning.ai, codealpha.tech, nptel.ac.in, unstop.com, and 18+ more.

---

## Pipeline Flow

1. **Authenticate** - Verify JWT token
2. **Fetch User** - Get legal name from database
3. **OCR** - Extract text from image (Tesseract)
4. **LLM** - Structure data (Gemini 2.5-flash)
5. **Post-Process** - Clean and normalize
6. **Name Match** - Compare with legal name
7. **Domain Validate** - Check against whitelist
8. **Save** - Store in MongoDB (if fileData provided)
9. **Return** - Complete result with warnings

---

**Status:** 🟢 Production Ready
**Model:** Gemini 2.5-flash
**Response Time:** ~5-10 seconds
