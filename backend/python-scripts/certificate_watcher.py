#!/usr/bin/env python3
"""
Certificate Watcher Script
Periodically fetches pending certificates, processes them with OCR + LLM,
and updates the database with extracted metadata
"""

import os
import sys
import time
import base64
import json
import logging
from datetime import datetime
from pathlib import Path

import requests
from dotenv import load_dotenv
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.interval import IntervalTrigger
from groq import Groq

# Load environment variables
load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://localhost:8003')
API_KEY = os.getenv('API_KEY', '')
GROQ_API_KEY = os.getenv('GROQ_API_KEY', '')
GROQ_MODEL = os.getenv('GROQ_MODEL', 'llama-3.1-8b-instant')
SURYA_OCR_URL = os.getenv('SURYA_OCR_URL', 'http://localhost:8005')
WATCHER_INTERVAL = float(os.getenv('WATCHER_INTERVAL_MINUTES', '1'))
LOCAL_STORAGE_PATH = os.getenv('LOCAL_STORAGE_PATH', '../storage/organization-certificates/transferred')
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

# Setup logging
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('certificate_watcher.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger('CertificateWatcher')

# Configure Groq
if GROQ_API_KEY:
    groq_client = Groq(api_key=GROQ_API_KEY)
    logger.info(f"✅ Groq LLM configured: {GROQ_MODEL}")
else:
    logger.warning("GROQ_API_KEY not set - LLM extraction will fail")
    groq_client = None

# Retry queue for failed certificates
retry_queue = []

def fetch_pending_certificates(limit=10):
    """
    Fetch pending certificates from API
    """
    url = f"{API_URL}/api/certificates/organization/pending"
    headers = {'x-api-key': API_KEY}
    params = {'limit': limit}

    try:
        response = requests.get(url, headers=headers, params=params, timeout=10)
        response.raise_for_status()

        data = response.json()
        if data.get('success'):
            certs = data.get('data', {}).get('certificates', [])
            logger.info(f"Fetched {len(certs)} pending certificates")
            return certs
        else:
            logger.error(f"API returned error: {data.get('message')}")
            return []

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch pending certificates: {str(e)}")
        return []

def extract_ocr(image_base64):
    """
    Extract text from certificate image using Surya OCR
    Fallback to basic extraction if Surya is unavailable
    """
    try:
        # Ensure we have the data URL prefix (Surya expects this format)
        if not image_base64.startswith('data:'):
            image_base64 = f"data:image/png;base64,{image_base64}"

        # Call Surya OCR service
        ocr_url = f"{SURYA_OCR_URL}/extract-text"
        payload = {'imageData': image_base64}  # Surya expects 'imageData', not 'image'

        response = requests.post(ocr_url, json=payload, timeout=30)

        if response.status_code == 200:
            result = response.json()
            # Surya returns 'full_text' in the response
            text = result.get('full_text', '') or result.get('text', '')
            print(text)
            logger.info(f"OCR extraction successful ({len(text)} characters) {text}")
            return {
                'success': True,
                'text': text,
                'confidence': result.get('confidence', 0)
            }
        else:
            error_msg = f"OCR service returned status {response.status_code}"
            if response.status_code == 400:
                try:
                    error_data = response.json()
                    error_msg += f": {error_data.get('message', error_data)}"
                except:
                    pass
            raise Exception(error_msg)

    except Exception as e:
        logger.warning(f"Surya OCR failed: {str(e)}. Using fallback...")

        # Fallback: Return minimal text indicating OCR failure
        # In production, you might want to use Tesseract as fallback
        return {
            'success': False,
            'text': 'OCR extraction failed',
            'confidence': 0,
            'error': str(e)
        }

def extract_metadata_with_llm(ocr_text):
    """
    Extract structured metadata from OCR text using Groq LLM (LLaMA 3.1)
    """
    if not groq_client:
        raise Exception("LLM client not configured (missing GROQ_API_KEY)")

    prompt = f"""You are a certificate data extraction assistant. Extract the following information from this certificate text and return it as a JSON object.

Certificate Text:
{ocr_text}

Extract these fields (if available):
- recipientName: The name of the person receiving the certificate
- certificateId: The certificate ID or number
- companyName: The organization/company issuing the certificate
- issuer: The specific division or department issuing the certificate
- courseTitle: The title of the course or program
- issueDate: The date the certificate was issued (format: YYYY-MM-DD)
- duration: The duration of the course (e.g., "120 hours")
- learningHours: Total learning hours as a number
- nsqfLevel: NSQF level (1-10) if mentioned
- skills: Array of skills learned (max 5)

Return ONLY a valid JSON object with these fields. Use null for fields not found.
Do not include any additional text or explanation.

Example format:
{{
  "recipientName": "John Doe",
  "certificateId": "CERT-2024-001",
  "companyName": "TechCorp India",
  "issuer": "TechCorp Training Division",
  "courseTitle": "Full Stack Development",
  "issueDate": "2024-12-01",
  "duration": "120 hours",
  "learningHours": 120,
  "nsqfLevel": 5,
  "skills": ["React", "Node.js", "MongoDB"]
}}"""

    try:
        # Call Groq API
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model=GROQ_MODEL,
            temperature=0.1,  # Low temperature for consistent JSON output
            max_tokens=1024,
        )

        response_text = chat_completion.choices[0].message.content.strip()

        # Extract JSON from response (handle markdown code blocks)
        if response_text.startswith('```'):
            # Remove markdown code blocks
            lines = response_text.split('\n')
            json_lines = [line for line in lines if not line.strip().startswith('```')]
            response_text = '\n'.join(json_lines).strip()

        # Parse JSON
        metadata = json.loads(response_text)

        logger.info(f"LLM extraction successful: {metadata.get('recipientName', 'Unknown')}")
        return {
            'success': True,
            'data': metadata
        }

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {str(e)}")
        logger.debug(f"LLM response: {response_text}")
        return {
            'success': False,
            'error': f"Invalid JSON response: {str(e)}"
        }

    except Exception as e:
        logger.error(f"LLM extraction failed: {str(e)}")
        return {
            'success': False,
            'error': str(e)
        }

def save_image_locally(cert_id, image_data, extracted_data):
    """
    Save certificate image to local storage
    Creates folder structure: YYYY/MM/company-name/
    """
    try:
        # Parse base64 image
        if image_data.startswith('data:'):
            image_data = image_data.split(',', 1)[1]

        image_bytes = base64.b64decode(image_data)

        # Create folder structure
        now = datetime.now()
        year = now.strftime('%Y')
        month = now.strftime('%m')

        company_name = extracted_data.get('companyName') or 'unknown'
        # Handle None or empty string
        if not company_name or company_name == 'null':
            company_name = 'unknown'
        company_slug = company_name.lower().replace(' ', '-').replace('/', '-')

        storage_path = Path(LOCAL_STORAGE_PATH) / year / month / company_slug
        storage_path.mkdir(parents=True, exist_ok=True)

        # Save image
        cert_filename = f"{cert_id}.png"
        file_path = storage_path / cert_filename

        with open(file_path, 'wb') as f:
            f.write(image_bytes)

        logger.info(f"Saved image to: {file_path}")
        return str(file_path)

    except Exception as e:
        logger.error(f"Failed to save image locally: {str(e)}")
        return None

def update_certificate_status(cert_id, ocr_text, extracted_data, status='processed'):
    """
    Update certificate in database after processing
    """
    url = f"{API_URL}/api/certificates/organization/{cert_id}/process"

    payload = {
        'apiKey': API_KEY,
        'ocrText': ocr_text,
        'extractedData': extracted_data,
        'processingStatus': status
    }

    try:
        response = requests.put(url, json=payload, timeout=15)
        response.raise_for_status()

        result = response.json()
        if result.get('success'):
            logger.info(f"Updated certificate {cert_id} status to '{status}'")
            return True
        else:
            logger.error(f"Failed to update certificate: {result.get('message')}")
            return False

    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to update certificate {cert_id}: {str(e)}")
        return False

def process_certificate(cert):
    """
    Process a single certificate: OCR -> LLM -> Save -> Update DB
    """
    cert_id = cert.get('_id')
    logger.info(f"Processing certificate {cert_id}...")

    try:
        # Get image data
        image_data = cert.get('certificateImage', {})
        image_url = image_data.get('url') or image_data.get('localPath')

        if not image_url:
            raise Exception("No image URL or local path found")

        # Check if it's a URL (has http:// or https://)
        is_url = image_url.startswith('http://') or image_url.startswith('https://')

        if is_url:
            # Download image from URL
            img_response = requests.get(image_url, timeout=10)
            img_response.raise_for_status()
            image_base64 = base64.b64encode(img_response.content).decode('utf-8')
        else:
            # It's a local file path - resolve it relative to backend directory
            # The backend stores in backend/storage/..., watcher is in backend/python-scripts/
            if not image_url.startswith('/'):
                # Relative path - resolve from backend directory (parent of python-scripts)
                backend_dir = Path(__file__).parent.parent
                image_path = backend_dir / image_url
            else:
                # Absolute path
                image_path = Path(image_url)

            if not image_path.exists():
                raise Exception(f"Image file not found: {image_path}")

            with open(image_path, 'rb') as f:
                image_bytes = f.read()
                image_base64 = base64.b64encode(image_bytes).decode('utf-8')

        # Step 1: OCR Extraction
        ocr_result = extract_ocr(image_base64)

        if not ocr_result.get('success'):
            raise Exception(f"OCR extraction failed: {ocr_result.get('error')}")

        ocr_text = ocr_result.get('text', '')

        # Step 2: LLM Extraction
        llm_result = extract_metadata_with_llm(ocr_text)

        if not llm_result.get('success'):
            # Retry once
            logger.warning("LLM extraction failed, retrying...")
            time.sleep(2)
            llm_result = extract_metadata_with_llm(ocr_text)

            if not llm_result.get('success'):
                raise Exception(f"LLM extraction failed: {llm_result.get('error')}")

        extracted_data = llm_result.get('data', {})

        # Step 3: Save image locally
        save_image_locally(cert_id, image_base64, extracted_data)

        # Step 4: Update database
        success = update_certificate_status(cert_id, ocr_text, extracted_data, 'processed')

        if success:
            logger.info(f"✅ Successfully processed certificate {cert_id}")
            return True
        else:
            raise Exception("Failed to update certificate status")

    except Exception as e:
        logger.error(f"❌ Failed to process certificate {cert_id}: {str(e)}")

        # Mark as failed in database
        update_certificate_status(cert_id, '', {}, 'failed')

        # Add to retry queue
        retry_queue.append({
            'cert': cert,
            'error': str(e),
            'retry_at': time.time() + 3600  # Retry in 1 hour
        })

        return False

def process_batch():
    """
    Process a batch of pending certificates
    """
    logger.info("=" * 80)
    logger.info("Starting certificate processing batch...")

    # Fetch pending certificates
    certificates = fetch_pending_certificates(limit=10)

    if not certificates:
        logger.info("No pending certificates to process")
        return

    # Process each certificate
    success_count = 0
    failed_count = 0

    for cert in certificates:
        try:
            if process_certificate(cert):
                success_count += 1
            else:
                failed_count += 1

            # Small delay between certificates
            time.sleep(1)

        except Exception as e:
            logger.error(f"Unexpected error processing certificate: {str(e)}")
            failed_count += 1

    # Summary
    logger.info(f"Batch complete: {success_count} succeeded, {failed_count} failed")
    logger.info("=" * 80)

def process_retry_queue():
    """
    Process certificates in the retry queue
    """
    if not retry_queue:
        return

    current_time = time.time()
    to_retry = [item for item in retry_queue if item['retry_at'] <= current_time]

    if not to_retry:
        return

    logger.info(f"Processing {len(to_retry)} certificates from retry queue...")

    for item in to_retry:
        if process_certificate(item['cert']):
            retry_queue.remove(item)
        else:
            # Update retry time (double the wait time)
            item['retry_at'] = current_time + 7200  # 2 hours

def main():
    """
    Main function - sets up scheduler and starts watching
    """
    logger.info("=" * 80)
    logger.info("🔍 Certificate Watcher Starting...")
    logger.info("=" * 80)
    logger.info(f"API URL: {API_URL}")
    logger.info(f"Surya OCR URL: {SURYA_OCR_URL}")
    logger.info(f"Interval: Every {WATCHER_INTERVAL} minutes")
    logger.info(f"Storage Path: {LOCAL_STORAGE_PATH}")
    logger.info("=" * 80)

    if not API_KEY:
        logger.error("❌ API_KEY not set in environment variables")
        sys.exit(1)

    if not GROQ_API_KEY:
        logger.error("❌ GROQ_API_KEY not set in environment variables")
        sys.exit(1)

    # Create storage directory
    Path(LOCAL_STORAGE_PATH).mkdir(parents=True, exist_ok=True)

    # Setup scheduler
    scheduler = BlockingScheduler()

    # Main processing job (every N minutes)
    scheduler.add_job(
        process_batch,
        trigger=IntervalTrigger(minutes=WATCHER_INTERVAL),
        id='process_batch',
        name='Process pending certificates',
        replace_existing=True
    )

    # Retry queue processing (every hour)
    scheduler.add_job(
        process_retry_queue,
        trigger=IntervalTrigger(hours=1),
        id='process_retry_queue',
        name='Process retry queue',
        replace_existing=True
    )

    logger.info("✅ Scheduler configured")

    # Run once immediately, then start scheduler
    logger.info("Running initial batch...")
    process_batch()

    try:
        logger.info("Starting scheduler...")
        scheduler.start()

        # Show next run time after scheduler starts
        jobs = scheduler.get_jobs()
        if jobs:
            logger.info(f"Next scheduled run: {jobs[0].next_run_time}")
    except (KeyboardInterrupt, SystemExit):
        logger.info("Shutting down gracefully...")
        scheduler.shutdown()

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)
