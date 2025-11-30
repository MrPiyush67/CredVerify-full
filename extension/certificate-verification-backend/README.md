# Certificate Verification Backend

A robust Express.js backend for certificate verification using OCR (Tesseract.js) and LLM-powered data extraction (Groq Llama 3.1 8B Instant).

## Features

- **OCR Processing**: Extract text from certificate images using Tesseract.js
- **LLM Data Extraction**: Use Groq's Llama 3.1 8B Instant to extract structured data from certificates
- **Domain Validation**: Verify that certificate issuer matches the website domain
- **Whitelist Protection**: Only allow certificates from trusted platforms (Coursera, IBM, DeepLearning.ai, etc.)
- **Database Storage**: Store verification records in MongoDB
- **Security**: CORS protection, rate limiting, file upload validation
- **RESTful API**: Clean and well-documented API endpoints

## Tech Stack

- **Node.js** + **Express.js**
- **Tesseract.js** (OCR)
- **Groq SDK** (LLM)
- **MongoDB** + **Mongoose**
- **Sharp** (Image preprocessing)
- **Multer** (File uploads)
- **Helmet** + **CORS** (Security)

## Installation

1. **Clone the repository**
```bash
cd certificate-verification-backend
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGODB_URI`: Your MongoDB connection string
- `GROQ_API_KEY`: Your Groq API key (get from https://console.groq.com)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins (include your extension ID)

4. **Start the server**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### 1. Health Check
```
GET /health
```

### 2. Verify Certificate
```
POST /api/verify-certificate
```

**Request:**
- `Content-Type: multipart/form-data`
- Body:
  - `file`: Certificate image file (JPEG, PNG, WebP)
  - `page_url`: URL of the page where certificate was found

**Response:**
```json
{
  "success": true,
  "isVerified": true,
  "extractedData": {
    "personName": "John Doe",
    "companyName": "Coursera",
    "issuerName": "Andrew Ng",
    "courseName": "Machine Learning",
    "certificateId": "ABC123",
    "verificationLink": "https://coursera.org/verify/ABC123",
    "issueDate": "December 2023",
    "skills": ["Machine Learning", "Python"]
  },
  "verification": {
    "isVerified": true,
    "domainMatch": true,
    "isWhitelistedDomain": true,
    "companyMatchScore": 1.0,
    "errors": []
  },
  "saveData": { ... }
}
```

### 3. Save Verification
```
POST /api/save-verification
```

**Request Body:**
```json
{
  "personName": "John Doe",
  "companyName": "Coursera",
  "isVerified": true,
  "certificateImage": "data:image/jpeg;base64,...",
  "pageUrl": "https://coursera.org/...",
  "extractedData": { ... },
  "verificationDetails": { ... }
}
```

### 4. Get All Verifications
```
GET /api/verifications?page=1&limit=10&verified=true
```

### 5. Get Single Verification
```
GET /api/verifications/:id
```

## Whitelisted Domains

The following domains are trusted for certificate verification:

- Coursera (coursera.org)
- Udacity (udacity.com)
- edX (edx.org)
- Udemy (udemy.com)
- LinkedIn Learning (linkedin.com)
- IBM (ibm.com)
- Google (google.com)
- Microsoft (microsoft.com)
- DeepLearning.AI (deeplearning.ai)
- Kaggle (kaggle.com)
- Code Alpha (codealpha.tech)
- Internshala (internshala.com)
- NPTEL (nptel.ac.in)
- And more...

See `src/config/whitelistedDomains.js` for the complete list.

## How It Works

1. **Upload**: User uploads certificate image via extension
2. **OCR**: Tesseract.js extracts text from the image
3. **LLM Extraction**: Groq Llama 3.1 8B extracts structured data (name, company, etc.)
4. **Validation**:
   - Checks if domain is whitelisted
   - Verifies company name matches domain
   - Validates required fields are present
5. **Response**: Returns verification result with extracted data
6. **Storage**: Optionally saves verification to database

## Project Structure

```
certificate-verification-backend/
├── src/
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── whitelistedDomains.js # Trusted domains
│   ├── controllers/
│   │   └── verificationController.js
│   ├── middleware/
│   │   ├── errorHandler.js
│   │   └── upload.js
│   ├── models/
│   │   └── Verification.js
│   ├── routes/
│   │   └── verificationRoutes.js
│   ├── utils/
│   │   ├── ocrProcessor.js       # OCR logic
│   │   ├── llmExtractor.js       # Groq LLM integration
│   │   └── domainValidator.js    # Domain validation
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | - |
| `GROQ_API_KEY` | Groq API key | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | - |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |
| `MAX_FILE_SIZE` | Max upload size (bytes) | 10485760 |

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin protection
- **Rate Limiting**: Prevent abuse
- **File Validation**: Type and size checks
- **Whitelist**: Only trusted domains
- **Input Sanitization**: Prevent injection attacks

## Error Handling

All errors are handled gracefully with appropriate HTTP status codes:

- `400`: Bad request (missing fields, invalid file, etc.)
- `404`: Not found
- `429`: Too many requests (rate limit)
- `500`: Internal server error

## Development

```bash
# Install dependencies
npm install

# Run in development mode (with auto-reload)
npm run dev

# Run in production mode
npm start
```

## Testing

Test the API using curl or Postman:

```bash
curl -X POST http://localhost:3000/api/verify-certificate \
  -F "file=@certificate.jpg" \
  -F "page_url=https://coursera.org/verify/ABC123"
```

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
