# Quick Setup Guide - Certificate Verification System

## ✅ Configuration Complete

All API keys and credentials have been configured from the extension backend.

## 1. Install Dependencies

```bash
cd backend
npm install
```

This will install:
- ✅ `tesseract.js@5.1.1` - OCR engine
- ✅ `@google/generative-ai@0.21.0` - Gemini LLM
- ✅ `string-similarity@4.0.4` - Fuzzy name matching
- ✅ `imagekit@5.2.0` - Image storage

## 2. Environment Variables (Already Configured)

Your `backend/.env` now includes:

```env
# Gemini API
GEMINI_API_KEY=AIzaSyDwhUbis7s49JW5mel9qf9LJcdfxqGZvMk

# ImageKit (for certificate storage)
IMAGEKIT_PUBLIC_KEY=public_nSy15Pdsg7qLe8IR8g4KBWiYNl8=
IMAGEKIT_PRIVATE_KEY=private_Ele+RFtGscjAnIohMQjZXi8/uRY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/k1qgzf2uu
IMAGEKIT_FOLDER_PATH=/Credentials
```

**Gemini Model:** `models/gemini-2.5-flash` (stable, free tier, fast and accurate)

## 3. Start the Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 4. Test the API

### Option A: Using cURL

First, login to get a JWT token:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "priya.sharma@example.com",
    "password": "password123",
    "role": "credentialist"
  }'
```

Copy the token from response, then test certificate verification:

```bash
TOKEN="your-jwt-token-here"

curl -X POST http://localhost:5000/api/credentials/extract-preview \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
    "sourceUrl": "https://coursera.org/verify/ABC123"
  }'
```

### Option B: Using Postman

1. **Login Request**
   - Method: POST
   - URL: `http://localhost:5000/api/auth/login`
   - Body (JSON):
     ```json
     {
       "email": "priya.sharma@example.com",
       "password": "password123",
       "role": "credentialist"
     }
     ```
   - Copy the `token` from response

2. **Verify Certificate Request**
   - Method: POST
   - URL: `http://localhost:5000/api/credentials/verify-certificate`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer <your-token>`
   - Body (JSON):
     ```json
     {
       "imageData": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
       "sourceUrl": "https://coursera.org/verify/ABC123",
       "imageType": "base64"
     }
     ```

### Option C: Using Browser Console

```javascript
// 1. Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'priya.sharma@example.com',
    password: 'password123',
    role: 'credentialist'
  })
});
const { token } = await loginResponse.json();

// 2. Verify certificate
const verifyResponse = await fetch('http://localhost:5000/api/credentials/verify-certificate', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    imageData: 'data:image/jpeg;base64,...',
    sourceUrl: 'https://coursera.org/verify/ABC123'
  })
});
const result = await verifyResponse.json();
console.log(result);
```

## 5. Available Endpoints

### Verify Certificate (Full Pipeline)
```
POST /api/credentials/verify-certificate
```
Extracts data and saves to database.

### Extract Preview (No Save)
```
POST /api/credentials/extract-preview
```
Extracts data but doesn't save to database (useful for testing).

### Get Trusted Domains
```
GET /api/credentials/trusted-domains
```
Returns whitelist of trusted certificate issuers.

## 6. Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "extractedData": {
      "personName": "John Smith",
      "certificateName": "Machine Learning",
      "issuerName": "Coursera",
      "certificateId": "ABC123",
      "issueDate": "2024-11-15",
      "skills": ["ML", "Python"]
    },
    "nameValidation": {
      "match": true,
      "confidence": 87,
      "reason": "High similarity match"
    },
    "domainValidation": {
      "isValid": true,
      "isTrusted": true,
      "domain": "coursera.org"
    },
    "warnings": []
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Image data is required"
}
```

## 7. Integration with Chrome Extension

Update your extension to call the new endpoint:

```javascript
// In extension popup.js
async function verifyCertificate(imageBase64) {
  const token = await getStoredToken();
  
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
  
  return await response.json();
}
```

## 8. Troubleshooting

### "OCR failed to extract meaningful text"
- Image quality too low
- Text not readable
- Try a clearer image

### "Missing required fields: personName"
- OCR or LLM couldn't extract the certificate recipient's name
- Check image contains certificate with visible name
- Note: certificateName and issuerName are optional but recommended

### "User not found"
- Invalid userId or user doesn't exist
- Check authentication token is valid

### "GEMINI_API_KEY not configured"
- Add API key to `.env` file
- Restart the server

## 9. Production Deployment

When deploying to production:

1. Set `GEMINI_API_KEY` in production environment variables
2. Update `CLIENT_URL` in `.env` to production frontend URL
3. Ensure MongoDB connection string is production-ready
4. Consider rate limiting for OCR/LLM endpoints
5. Add logging for debugging

## 10. Next Steps

- Test with real certificate images
- Integrate with Chrome extension
- Add error handling in frontend
- Monitor API usage and performance
- Customize domain whitelist as needed

For full documentation, see: `CERTIFICATE_VERIFICATION_SYSTEM.md`
