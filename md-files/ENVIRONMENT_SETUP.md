# Environment Variables Setup Guide

This guide explains all environment variables needed for the **Organization Certificate Verification System**.

---

## 📁 File Locations

### Backend Environment Variables
- **File:** `backend/.env`
- **Template:** `backend/.env.example`

### Python Scripts Environment Variables
- **File:** `backend/python-scripts/.env`
- **Template:** `backend/python-scripts/.env.example`

---

## 🔧 Backend Environment Variables (`backend/.env`)

### 1. Organization Certificate System (NEW)

```env
# ========================================
# Organization Certificate Verification System
# ========================================

# API Key for Python scripts (random generator & watcher)
# This key authenticates Python scripts when they call backend APIs
# IMPORTANT: Change this to a secure random string in production!
PYTHON_SCRIPT_API_KEY=credverify_org_cert_2024_secure_key_change_in_production

# Storage path for organization certificate images
# This is where certificate images will be stored locally
# Default: ./storage/organization-certificates (relative to backend folder)
ORGANIZATION_CERT_STORAGE_PATH=./storage/organization-certificates
```

**How to Generate a Secure API Key:**
```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Example Production Key:**
```env
PYTHON_SCRIPT_API_KEY=8a7f3e2d1c9b4a6f5e8d7c3b2a1f9e8d7c6b5a4f3e2d1c9b8a7f6e5d4c3b2a1f
```

---

### 2. Existing Required Variables

These are already in your `.env` file and are required for the organization system to work:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?appName=YourApp

# Groq API (for LLM metadata extraction - backend only, watcher uses separate config)
GROQ_API_KEY=gsk_...
USE_GROQ_FALLBACK=true

# Surya OCR Service (must be running)
SURYA_OCR_URL=http://127.0.0.1:8005
USE_SURYA_OCR=true

# JWT Authentication (for user auth on frontend endpoints)
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7

# Server Configuration
PORT=8003

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

---

## 🐍 Python Scripts Environment Variables (`backend/python-scripts/.env`)

### Complete Configuration

```env
# ========================================
# Backend API Configuration
# ========================================

# Backend API base URL
# This is where the Python scripts will send requests
API_URL=http://localhost:8003

# API Key for authentication
# MUST match PYTHON_SCRIPT_API_KEY in backend/.env
API_KEY=credverify_org_cert_2024_secure_key_change_in_production

# ========================================
# AI Services
# ========================================

# Groq API for LLM extraction (watcher script)
# Used to extract structured data from OCR text using LLaMA 3.1
# Get your key from: https://console.groq.com/keys
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.1-8b-instant

# Surya OCR Service URL
# Must be running before starting the watcher script
# Start with: cd surya-ocr && python app.py
SURYA_OCR_URL=http://127.0.0.1:8005

# ========================================
# Certificate Generator Configuration
# ========================================

# Number of certificates to generate
CERTIFICATE_GENERATION_COUNT=50

# Random delay range (in seconds) between certificate generations
# This creates a realistic feel (not all at once)
GENERATION_DELAY_MIN=0
GENERATION_DELAY_MAX=10

# ========================================
# Certificate Watcher Configuration
# ========================================

# How often to check for pending certificates (in minutes)
WATCHER_INTERVAL_MINUTES=5

# Local storage path for processed certificate images
# Relative to python-scripts folder
# Images will be organized as: YYYY/MM/company-name/cert-id.png
LOCAL_STORAGE_PATH=../storage/organization-certificates

# ========================================
# Logging
# ========================================

# Log level: DEBUG, INFO, WARNING, ERROR, CRITICAL
LOG_LEVEL=INFO
```

---

## 🚀 Quick Setup Instructions

### Step 1: Backend Environment Setup

```bash
cd backend

# If .env doesn't exist, copy from example
cp .env.example .env

# Edit .env and add/verify these variables:
nano .env

# Add these lines at the end:
PYTHON_SCRIPT_API_KEY=credverify_org_cert_2024_secure_key_change_in_production
ORGANIZATION_CERT_STORAGE_PATH=./storage/organization-certificates
```

### Step 2: Python Scripts Environment Setup

```bash
cd backend/python-scripts

# If .env doesn't exist, copy from example
cp .env.example .env

# Edit .env
nano .env

# Ensure API_KEY matches PYTHON_SCRIPT_API_KEY from backend/.env
# Add your GEMINI_API_KEY
```

### Step 3: Verify Configuration

```bash
# Check backend .env has organization variables
cd backend
grep "PYTHON_SCRIPT_API_KEY" .env
grep "ORGANIZATION_CERT_STORAGE_PATH" .env

# Check python scripts .env
cd python-scripts
grep "API_KEY" .env
grep "GEMINI_API_KEY" .env
```

---

## 🔐 Security Best Practices

### 1. API Key Security

**Development:**
```env
# It's okay to use a simple key for local development
PYTHON_SCRIPT_API_KEY=dev-local-key-2024
```

**Production:**
```env
# Use a cryptographically secure random string
PYTHON_SCRIPT_API_KEY=8a7f3e2d1c9b4a6f5e8d7c3b2a1f9e8d7c6b5a4f3e2d1c9b8a7f6e5d4c3b2a1f
```

### 2. Never Commit `.env` Files

Ensure `.gitignore` includes:
```
.env
.env.local
.env.*.local
*.env
```

### 3. Separate Keys for Different Environments

```env
# Development
PYTHON_SCRIPT_API_KEY=dev-key-123

# Staging
PYTHON_SCRIPT_API_KEY=staging-key-456

# Production
PYTHON_SCRIPT_API_KEY=prod-key-789-super-secure-long-random-string
```

### 4. Rotate Keys Regularly

Change your API keys periodically:
```bash
# Generate new key
NEW_KEY=$(openssl rand -hex 32)

# Update backend/.env
echo "PYTHON_SCRIPT_API_KEY=$NEW_KEY"

# Update python-scripts/.env
echo "API_KEY=$NEW_KEY"
```

---

## ✅ Verification Checklist

Before running the system, verify:

- [ ] `backend/.env` exists and contains `PYTHON_SCRIPT_API_KEY`
- [ ] `backend/.env` contains `ORGANIZATION_CERT_STORAGE_PATH`
- [ ] `backend/.env` contains `GEMINI_API_KEY`
- [ ] `backend/.env` contains `SURYA_OCR_URL`
- [ ] `backend/.env` contains `MONGO_URI`
- [ ] `python-scripts/.env` exists
- [ ] `python-scripts/.env` `API_KEY` matches backend's `PYTHON_SCRIPT_API_KEY`
- [ ] `python-scripts/.env` contains `GEMINI_API_KEY`
- [ ] `python-scripts/.env` contains `SURYA_OCR_URL`
- [ ] Storage directory exists: `backend/storage/organization-certificates/`

---

## 🧪 Test Configuration

### Test Backend API Key Auth

```bash
# From python-scripts folder
python3 -c "
import os
from dotenv import load_dotenv
import requests

load_dotenv()

api_url = os.getenv('API_URL')
api_key = os.getenv('API_KEY')

response = requests.get(
    f'{api_url}/api/certificates/organization/pending',
    headers={'x-api-key': api_key}
)

print(f'Status: {response.status_code}')
print(f'Response: {response.json()}')
"
```

**Expected Output:**
```
Status: 200
Response: {'success': True, 'data': {'certificates': [], 'count': 0}}
```

### Test Gemini API Key

```bash
python3 -c "
import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-1.5-flash')

response = model.generate_content('Hello')
print('Gemini API working:', response.text[:50])
"
```

### Test Surya OCR Service

```bash
curl http://localhost:8005/health
```

**Expected Output:**
```json
{"status": "healthy", "service": "Surya OCR"}
```

---

## 🐛 Troubleshooting

### Error: "Invalid or missing API key"

**Cause:** API keys don't match between backend and Python scripts

**Solution:**
```bash
# Check backend key
cd backend
grep PYTHON_SCRIPT_API_KEY .env

# Check python key
cd python-scripts
grep API_KEY .env

# They must be identical!
```

### Error: "GEMINI_API_KEY not found"

**Solution:**
1. Get API key from https://makersuite.google.com/app/apikey
2. Add to both `backend/.env` and `python-scripts/.env`

### Error: "Cannot connect to Surya OCR service"

**Solution:**
```bash
# Check if Surya OCR is running
curl http://localhost:8005/health

# If not running, start it:
cd path/to/surya-ocr
python app.py
```

### Error: "Permission denied: storage/organization-certificates"

**Solution:**
```bash
# Create storage directory with proper permissions
cd backend
mkdir -p storage/organization-certificates
chmod 755 storage/organization-certificates
```

---

## 📊 Environment Variables Reference Table

| Variable | Backend | Python Scripts | Required | Default | Description |
|----------|---------|----------------|----------|---------|-------------|
| `PYTHON_SCRIPT_API_KEY` | ✅ | ❌ | Yes | - | Backend API key for Python scripts |
| `API_KEY` | ❌ | ✅ | Yes | - | Must match backend's PYTHON_SCRIPT_API_KEY |
| `ORGANIZATION_CERT_STORAGE_PATH` | ✅ | ❌ | No | `./storage/organization-certificates` | Storage path for cert images |
| `LOCAL_STORAGE_PATH` | ❌ | ✅ | No | `../storage/organization-certificates` | Python's local storage path |
| `GEMINI_API_KEY` | ✅ | ✅ | Yes | - | Google Gemini API key for LLM |
| `SURYA_OCR_URL` | ✅ | ✅ | Yes | `http://localhost:8005` | Surya OCR service URL |
| `API_URL` | ❌ | ✅ | Yes | `http://localhost:8003` | Backend API base URL |
| `MONGO_URI` | ✅ | ❌ | Yes | - | MongoDB connection string |
| `CERTIFICATE_GENERATION_COUNT` | ❌ | ✅ | No | `50` | Number of certs to generate |
| `GENERATION_DELAY_MIN` | ❌ | ✅ | No | `0` | Min delay between certs (seconds) |
| `GENERATION_DELAY_MAX` | ❌ | ✅ | No | `10` | Max delay between certs (seconds) |
| `WATCHER_INTERVAL_MINUTES` | ❌ | ✅ | No | `5` | Watcher check interval (minutes) |
| `LOG_LEVEL` | ❌ | ✅ | No | `INFO` | Python logging level |

---

## 🎯 Production Deployment Checklist

Before deploying to production:

- [ ] Generate secure random API key (32+ characters)
- [ ] Store API keys in secure vault (AWS Secrets Manager, HashiCorp Vault, etc.)
- [ ] Use environment-specific keys (dev, staging, prod)
- [ ] Enable rate limiting on API endpoints
- [ ] Set up monitoring for failed authentication attempts
- [ ] Rotate API keys regularly (every 90 days)
- [ ] Use HTTPS for all API communications
- [ ] Restrict API key usage by IP address if possible
- [ ] Set up alerts for unusual API activity
- [ ] Document key rotation procedures

---

**Last Updated:** December 9, 2024
**Status:** Production Ready ✅
