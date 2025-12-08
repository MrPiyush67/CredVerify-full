# Surya OCR Microservice

A Python-based OCR microservice using Surya OCR for high-accuracy certificate text extraction. This service provides REST API endpoints for the CredVerify backend to extract text from certificate images.

## Overview

This microservice replaces Tesseract OCR with Surya OCR, a state-of-the-art OCR engine that provides better accuracy for certificate and document recognition. The Node.js backend communicates with this Python service via HTTP.

## Architecture

```
Browser Extension
    ↓ [sends base64 image]
Node.js Backend API
    ↓ [HTTP POST]
Python OCR Microservice (Flask) ← You are here
    ↓ [uses Surya OCR]
Returns extracted text + confidence + structured data
```

## Features

- **High-accuracy OCR**: Uses Surya OCR for better certificate text extraction
- **Structured data extraction**: Automatically extracts name, course, date, issuer
- **Base64 image support**: Accepts images as base64 data URLs
- **REST API**: Simple HTTP endpoints for integration
- **Health checks**: Monitor service status
- **Error handling**: Comprehensive error responses

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

## Installation

### 1. Navigate to the OCR service directory

```bash
cd backend/ocr-service
```

### 2. Create and activate a virtual environment

**On macOS/Linux:**
```bash
python3 -m venv venv
source venv/bin/activate
```

**On Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

**Note:** The first time you run the service, Surya will download its ML models (~500MB). This happens automatically but requires an internet connection.

### 4. Verify installation

```bash
python app.py
```

You should see:
```
🚀 Starting Surya OCR service on port 5000
📍 Health check: http://localhost:5000/health
📍 Extract text: http://localhost:5000/extract-text
 * Running on http://0.0.0.0:5000
```

## Usage

### Starting the service

**Development mode:**
```bash
python app.py
```

**Production mode:**
```bash
PORT=5000 DEBUG=false python app.py
```

**With environment variables:**
```bash
export PORT=5000
export DEBUG=true
python app.py
```

### API Endpoints

#### 1. Health Check

```bash
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "engine": "surya",
  "version": "1.0.0"
}
```

#### 2. Extract Text

```bash
POST /extract-text
Content-Type: application/json

{
  "imageData": "data:image/png;base64,iVBORw0KG..."
}
```

**Response:**
```json
{
  "success": true,
  "full_text": "CERTIFICATE OF COMPLETION\nThis certifies that...",
  "avg_confidence": 87.5,
  "num_lines": 12,
  "image_size": [1920, 1080],
  "engine": "surya",
  "text_blocks": [...],
  "structured_data": {
    "name": "John Doe",
    "course": "Python Programming",
    "date": "2024-01-15",
    "instructor": "Jane Smith",
    "issuer": "Tech Academy"
  }
}
```

#### 3. Extract Text with Layout

```bash
POST /extract-text-with-layout
Content-Type: application/json

{
  "imageData": "data:image/png;base64,iVBORw0KG..."
}
```

Returns additional spatial layout information for each text block.

## Integration with Node.js Backend

The Node.js backend automatically calls this service when `USE_SURYA_OCR=true` is set in the backend `.env` file.

### Backend configuration (already set up):

```env
# In backend/.env
SURYA_OCR_URL=http://localhost:5000
USE_SURYA_OCR=true
```

### Automatic fallback:

If the Python service is unavailable, the Node.js backend automatically falls back to Tesseract OCR. No manual intervention required.

## Running Both Services

You need to run both services simultaneously:

### Terminal 1: Start Python OCR Service
```bash
cd backend/ocr-service
source venv/bin/activate  # or venv\Scripts\activate on Windows
python app.py
```

### Terminal 2: Start Node.js Backend
```bash
cd backend
npm install  # first time only
npm run dev
```

### Terminal 3: Load Extension
1. Open Chrome/Firefox
2. Go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select `CredVerify-full/extension/` directory

## Testing

### Test health endpoint:
```bash
curl http://localhost:5000/health
```

### Test OCR with a sample image:
```bash
curl -X POST http://localhost:5000/extract-text \
  -H "Content-Type: application/json" \
  -d '{"imageData": "data:image/png;base64,iVBORw0KG..."}'
```

### Test from Node.js backend:

The backend will automatically test the connection when processing a certificate. Check the logs for:
```
✅ [SURYA-OCR] Extraction successful
📊 [SURYA-OCR] Confidence: 87.5%
```

## Troubleshooting

### Issue: "Connection refused" error

**Solution:** Make sure the Python service is running on port 5000.

```bash
# Check if port 5000 is in use
lsof -i :5000  # macOS/Linux
netstat -ano | findstr :5000  # Windows

# Start the service if not running
cd backend/ocr-service
source venv/bin/activate
python app.py
```

### Issue: "Module not found" errors

**Solution:** Reinstall dependencies in the virtual environment.

```bash
cd backend/ocr-service
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Slow first request

**Cause:** Surya downloads ML models (~500MB) on first use.

**Solution:** Wait for the download to complete. Subsequent requests will be fast.

### Issue: Out of memory errors

**Cause:** Surya OCR uses significant memory for ML models.

**Solution:**
- Close other applications
- Increase system memory
- Use smaller images (resize before sending)

### Issue: Backend still using Tesseract

**Check:**
1. Is the Python service running? (`curl http://localhost:5000/health`)
2. Is `USE_SURYA_OCR=true` set in `backend/.env`?
3. Check backend logs for Surya connection attempts

## Performance

- **First request:** 5-10 seconds (model loading)
- **Subsequent requests:** 1-3 seconds per image
- **Memory usage:** ~2-3 GB (ML models)
- **Accuracy:** 85-95% (better than Tesseract for certificates)

## Dependencies

See [requirements.txt](requirements.txt) for the complete list:

- **flask**: Web framework
- **surya-ocr**: OCR engine
- **pillow**: Image processing
- **torch**: ML framework
- **transformers**: NLP models

## Development

### Adding new endpoints:

Edit `app.py` and add new routes:

```python
@app.route('/your-endpoint', methods=['POST'])
def your_function():
    # Your code here
    return jsonify({'result': 'data'})
```

### Modifying OCR behavior:

Edit `certificate_ocr_surya.py` to customize:
- Language support (change `langs=['en']`)
- Confidence thresholds
- Structured data extraction patterns

### Environment variables:

- `PORT`: Service port (default: 5000)
- `DEBUG`: Enable debug mode (default: false)

## Production Deployment

### Using Docker:

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t surya-ocr-service .
docker run -p 5000:5000 surya-ocr-service
```

### Using docker-compose:

See main project `docker-compose.yml` for multi-service setup.

## License

Part of the CredVerify project. See main project LICENSE.

## Support

For issues or questions:
1. Check this README
2. Review backend logs for error messages
3. Ensure both services are running
4. Test endpoints individually with curl

## Related Files

- **Backend OCR service**: `backend/src/features/credential/services/ocr.service.js`
- **OCR pipeline**: `backend/src/features/credential/verification/pipeline/04_ocrExtractor.js`
- **Extension**: `extension/js/popup.js`
