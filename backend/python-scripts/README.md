# Organization Certificate Python Scripts

Python scripts for generating and processing organization certificates.

## Scripts

### 1. random_certificate_generator.py
Generates random organization certificates with realistic data and submits them to the backend API.

### 2. certificate_watcher.py
Watches for pending certificates, processes them with OCR and LLM, and updates the database.

## Setup

### Prerequisites
- Python 3.8 or higher
- Backend API running (default: http://localhost:8003)
- Surya OCR service running (default: http://localhost:8005)

### Installation

1. Create virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env and set your API keys
```

Required environment variables:
- `API_KEY` - Backend API key (must match backend's PYTHON_SCRIPT_API_KEY)
- `GEMINI_API_KEY` - Google Gemini API key for LLM extraction
- `API_URL` - Backend API URL (default: http://localhost:8003)
- `SURYA_OCR_URL` - Surya OCR service URL (default: http://localhost:8005)

## Usage

### Certificate Generator

Generate 50 random certificates with 0-10 second delays:
```bash
python random_certificate_generator.py
```

Environment variables:
- `CERTIFICATE_GENERATION_COUNT` - Number of certificates to generate (default: 50)
- `GENERATION_DELAY_MIN` - Minimum delay in seconds (default: 0)
- `GENERATION_DELAY_MAX` - Maximum delay in seconds (default: 10)

### Certificate Watcher

Run the watcher to process pending certificates:
```bash
python certificate_watcher.py
```

The watcher will:
1. Check for pending certificates every 5 minutes
2. Process each certificate with Surya OCR
3. Extract metadata using Gemini LLM
4. Save images locally
5. Update database with extracted data

Environment variables:
- `WATCHER_INTERVAL_MINUTES` - Check interval in minutes (default: 5)
- `LOCAL_STORAGE_PATH` - Local storage path for images (default: ../storage/organization-certificates)

### Run as Background Service

#### Using systemd (Linux):

1. Create service file `/etc/systemd/system/certificate-watcher.service`:
```ini
[Unit]
Description=Certificate Watcher Service
After=network.target

[Service]
Type=simple
User=your_user
WorkingDirectory=/path/to/backend/python-scripts
Environment="PATH=/path/to/venv/bin"
ExecStart=/path/to/venv/bin/python certificate_watcher.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

2. Enable and start:
```bash
sudo systemctl enable certificate-watcher
sudo systemctl start certificate-watcher
sudo systemctl status certificate-watcher
```

#### Using cron (Any Unix-like OS):

Add to crontab:
```bash
*/5 * * * * cd /path/to/python-scripts && /path/to/venv/bin/python certificate_watcher.py >> watcher.log 2>&1
```

## Configuration

### config.json

Edit `config.json` to customize:
- Companies and their courses
- Instructor names
- NSQF levels
- Hours range
- Certificate ID prefix

### Logging

Logs are written to:
- Console (stdout)
- `certificate_watcher.log` file

Set log level with `LOG_LEVEL` environment variable (DEBUG, INFO, WARNING, ERROR).

## Testing

### Test Certificate Generator

Generate 1 test certificate:
```bash
CERTIFICATE_GENERATION_COUNT=1 python random_certificate_generator.py
```

### Test Certificate Watcher

Run watcher once without scheduling:
```python
# Modify certificate_watcher.py to call process_batch() directly
python certificate_watcher.py
```

## Troubleshooting

### API Connection Errors
- Ensure backend is running on `API_URL`
- Check `API_KEY` matches backend configuration
- Verify firewall/network allows connection

### OCR Failures
- Ensure Surya OCR service is running on `SURYA_OCR_URL`
- Check OCR service logs for errors
- Verify image is valid PNG/JPEG

### LLM Extraction Failures
- Verify `GEMINI_API_KEY` is valid
- Check Gemini API quota/limits
- Review watcher logs for detailed error messages

### Permission Errors
- Ensure write access to `LOCAL_STORAGE_PATH`
- Check file permissions on storage directory

## File Structure

```
python-scripts/
├── random_certificate_generator.py  # Certificate generator
├── certificate_watcher.py           # Certificate watcher/processor
├── config.json                      # Configuration (companies, courses, etc.)
├── requirements.txt                 # Python dependencies
├── .env.example                     # Environment variables template
├── .env                            # Your environment variables (gitignored)
├── README.md                        # This file
└── certificate_watcher.log         # Watcher logs (generated)
```

## API Endpoints Used

### Certificate Generator
- `POST /api/certificates/organization/submit` - Submit new certificate

### Certificate Watcher
- `GET /api/certificates/organization/pending` - Fetch pending certificates
- `PUT /api/certificates/organization/:id/process` - Update certificate status

## Performance

### Certificate Generator
- Generates ~5-10 certificates per minute (with delays)
- Memory usage: ~50-100MB
- Network: ~200KB per certificate (image + metadata)

### Certificate Watcher
- Processes ~10 certificates per batch
- Batch runs every 5 minutes
- OCR: ~2-5 seconds per certificate
- LLM: ~3-7 seconds per certificate
- Total: ~5-12 seconds per certificate

## License

Part of the CredVerify project.
