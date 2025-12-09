#!/usr/bin/env python3
"""
Random Certificate Generator
Generates random organization certificates and submits them to the backend API
"""

import os
import sys
import json
import random
import time
import base64
from datetime import datetime, timedelta
from io import BytesIO
import uuid

import requests
from faker import Faker
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv
import qrcode

# Load environment variables
load_dotenv()

# Configuration
API_URL = os.getenv('API_URL', 'http://localhost:8003')
API_KEY = os.getenv('API_KEY', '')
CERTIFICATE_COUNT = int(os.getenv('CERTIFICATE_GENERATION_COUNT', '50'))
DELAY_MIN = int(os.getenv('GENERATION_DELAY_MIN', '0'))
DELAY_MAX = int(os.getenv('GENERATION_DELAY_MAX', '10'))

# Initialize Faker with Indian locale
fake = Faker(['en_IN'])

# Load configuration
def load_config():
    """Load configuration from config.json"""
    config_path = os.path.join(os.path.dirname(__file__), 'config.json')
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"❌ Configuration file not found: {config_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in config file: {e}")
        sys.exit(1)

CONFIG = load_config()

def generate_random_name():
    """Generate a random Indian name"""
    return fake.name()

def generate_certificate_id():
    """Generate a unique certificate ID"""
    prefix = CONFIG.get('certificate_id_prefix', 'CERT')
    year = datetime.now().year
    unique_id = str(uuid.uuid4())[:8].upper()
    return f"{prefix}-{year}-{unique_id}"

def generate_random_date():
    """Generate a random date within the last N years"""
    years = CONFIG.get('date_range_years', 2)
    days_back = years * 365
    random_days = random.randint(0, days_back)
    return datetime.now() - timedelta(days=random_days)

def generate_random_hours():
    """Generate random learning hours between min and max (supports decimals)"""
    hours_range = CONFIG.get('hours_range', {'min': 7.5, 'max': 30})
    min_hours = hours_range['min']
    max_hours = hours_range['max']

    # Generate random float and round to 0.5 increments for cleaner values
    random_hours = random.uniform(min_hours, max_hours)
    # Round to nearest 0.5 (e.g., 7.5, 8.0, 8.5, 9.0, etc.)
    return round(random_hours * 2) / 2

def generate_random_nsqf():
    """Generate random NSQF level"""
    levels = CONFIG.get('nsqf_levels', [3, 4, 5, 6, 7])
    return random.choice(levels)

def select_random_company():
    """Select a random company and course"""
    company = random.choice(CONFIG['companies'])
    course = random.choice(company['courses'])
    instructor = random.choice(CONFIG.get('instructors', ['Admin']))

    return {
        'company_name': company['name'],
        'issuer': company['issuer'],
        'course_title': course,
        'instructor': instructor
    }

def create_certificate_image(data):
    """
    Create a certificate image matching the template design
    Returns base64 encoded PNG image
    """
    # Certificate dimensions (A4 landscape: 297mm x 210mm = 1123px x 794px at 96 DPI)
    width, height = 1123, 794

    # Create image with cream/beige background for professional look
    img = Image.new('RGB', (width, height), '#F5F5DC')  # Beige color
    draw = ImageDraw.Draw(img)

    # Colors
    BLACK = (0, 0, 0)
    GRAY = (74, 85, 104)

    try:
        # Try to load fonts (fallback to default if not available)
        title_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman.ttf', 48)
        course_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 36)
        name_font = ImageFont.truetype('/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf', 52)
        info_font = ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc', 16)
    except:
        # Fallback to default font
        title_font = ImageFont.load_default()
        course_font = ImageFont.load_default()
        name_font = ImageFont.load_default()
        info_font = ImageFont.load_default()

    # Draw decorative border
    border_margin = 30
    PRIMARY = (17, 100, 102)  # Brand teal
    GOLD = (212, 175, 55)  # Gold for accents

    # Outer border (thick)
    draw.rectangle([border_margin, border_margin, width - border_margin, height - border_margin],
                   outline=PRIMARY, width=8)
    # Inner border (thin gold)
    draw.rectangle([border_margin + 15, border_margin + 15, width - border_margin - 15, height - border_margin - 15],
                   outline=GOLD, width=2)

    # Certificate ID at top right (prominent)
    draw.text((width - 80, 60), f"ID: {data['certificate_id']}", fill=PRIMARY, font=info_font, anchor='rm')

    # Title
    draw.text((width//2, 150), "CERTIFICATE", fill=PRIMARY, font=title_font, anchor='mm')
    draw.text((width//2, 195), "OF COMPLETION", fill=BLACK, font=info_font, anchor='mm')

    # Company/Issuer name (smaller, below subtitle)
    issuer_text = data.get('issuer', data.get('company_name', ''))
    draw.text((width//2, 220), issuer_text, fill=GRAY, font=info_font, anchor='mm')

    # Decorative line under title
    draw.line([(width//2 - 200, 245), (width//2 + 200, 245)], fill=GOLD, width=3)

    # "This is to certify that" text
    draw.text((width//2, 280), "This is to certify that", fill=GRAY, font=info_font, anchor='mm')

    # Recipient name with decorative underline
    name_y = 330
    draw.text((width//2, name_y), data['recipient_name'], fill=BLACK, font=name_font, anchor='mm')
    # Draw decorative gold underline
    name_bbox = draw.textbbox((width//2, name_y), data['recipient_name'], font=name_font, anchor='mm')
    underline_y = name_y + 35
    draw.line([(name_bbox[0] - 60, underline_y), (name_bbox[2] + 60, underline_y)], fill=GOLD, width=3)

    # "has successfully completed" text
    draw.text((width//2, 400), "has successfully completed", fill=GRAY, font=info_font, anchor='mm')

    # Course name (uppercase, in brand color)
    course_text = data['course_title'].upper()
    draw.text((width//2, 460), course_text, fill=PRIMARY, font=course_font, anchor='mm')

    # Footer section with better layout
    footer_y = height - 140

    # Decorative line above footer
    draw.line([(border_margin + 50, footer_y - 20), (width - border_margin - 50, footer_y - 20)],
              fill=GOLD, width=2)

    # Left section: Date and Duration
    left_x = 100
    formatted_date = data['issue_date'].strftime('%b %d, %Y')
    draw.text((left_x, footer_y), "Issue Date:", fill=GRAY, font=info_font)
    draw.text((left_x, footer_y + 25), formatted_date, fill=BLACK, font=info_font)

    draw.text((left_x, footer_y + 55), "Duration:", fill=GRAY, font=info_font)
    # Format hours nicely (remove .0 for whole numbers, show decimals otherwise)
    hours_text = f"{data['hours']:.1f}".rstrip('0').rstrip('.') if data['hours'] % 1 != 0 else str(int(data['hours']))
    draw.text((left_x, footer_y + 80), f"{hours_text} hours", fill=BLACK, font=info_font)

    # Center section: Instructor with signature line
    center_x = width // 2
    draw.line([(center_x - 100, footer_y + 10), (center_x + 100, footer_y + 10)], fill=BLACK, width=2)
    draw.text((center_x, footer_y + 20), data['instructor'], fill=BLACK, font=info_font, anchor='mt')
    draw.text((center_x, footer_y + 43), "Instructor", fill=GRAY, font=info_font, anchor='mt')

    # Right section: QR Code and NSQF
    qr_x = width - 180
    qr_y = footer_y - 10

    # Generate QR code with certificate ID
    cert_url = f"https://credverify.vercel.app/verify/{data['certificate_id']}"
    qr = qrcode.QRCode(version=1, box_size=4, border=1)
    qr.add_data(cert_url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="black", back_color="white")
    qr_img = qr_img.resize((110, 110))

    # Add white background for QR code
    qr_bg = Image.new('RGB', (120, 120), 'white')
    qr_bg.paste(qr_img, (5, 5))
    img.paste(qr_bg, (qr_x, qr_y))

    # NSQF level badge
    draw.text((qr_x + 60, qr_y + 125), f"NSQF Level {data['nsqf_level']}",
              fill=PRIMARY, font=info_font, anchor='mt')

    # Convert to base64
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')

    return f"data:image/png;base64,{img_str}"

def submit_certificate(certificate_data, retry_count=3):
    """
    Submit certificate to backend API with retry logic
    """
    url = f"{API_URL}/api/certificates/organization/submit"

    payload = {
        "apiKey": API_KEY,
        "certificate": certificate_data
    }

    for attempt in range(retry_count):
        try:
            response = requests.post(url, json=payload, timeout=30)

            if response.status_code == 201:
                data = response.json()
                return {
                    'success': True,
                    'data': data.get('data', {}),
                    'message': 'Certificate submitted successfully'
                }
            elif response.status_code == 409:
                return {
                    'success': False,
                    'error': 'Duplicate certificate',
                    'message': 'Certificate already exists in database'
                }
            else:
                error_data = response.json() if response.headers.get('content-type') == 'application/json' else {}
                raise Exception(f"API returned status {response.status_code}: {error_data.get('message', response.text)}")

        except requests.exceptions.Timeout:
            if attempt < retry_count - 1:
                wait_time = 2 ** attempt  # Exponential backoff
                print(f"  ⏳ Timeout. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                return {
                    'success': False,
                    'error': 'Timeout',
                    'message': 'Request timed out after multiple attempts'
                }

        except requests.exceptions.ConnectionError:
            if attempt < retry_count - 1:
                wait_time = 2 ** attempt
                print(f"  🔌 Connection error. Retrying in {wait_time}s...")
                time.sleep(wait_time)
            else:
                return {
                    'success': False,
                    'error': 'Connection failed',
                    'message': 'Could not connect to API server'
                }

        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'message': f'Error: {str(e)}'
            }

    return {
        'success': False,
        'error': 'Max retries exceeded',
        'message': 'Failed after multiple retry attempts'
    }

def generate_and_submit():
    """Generate a single random certificate and submit it"""
    # Generate random data
    recipient_name = generate_random_name()
    certificate_id = generate_certificate_id()
    issue_date = generate_random_date()
    hours = generate_random_hours()
    nsqf_level = generate_random_nsqf()
    company_data = select_random_company()

    # Prepare certificate data
    cert_data = {
        'recipient_name': recipient_name,
        'certificate_id': certificate_id,
        'company_name': company_data['company_name'],
        'issuer': company_data['issuer'],
        'course_title': company_data['course_title'],
        'issue_date': issue_date,
        'hours': hours,
        'nsqf_level': nsqf_level,
        'instructor': company_data['instructor']
    }

    # Generate certificate image
    print(f"📝 Generating certificate for {recipient_name}...")
    certificate_image_base64 = create_certificate_image(cert_data)

    # Prepare API payload
    # Format hours nicely for display (remove .0 for whole numbers)
    hours_display = f"{hours:.1f}".rstrip('0').rstrip('.') if hours % 1 != 0 else str(int(hours))

    api_data = {
        'recipientName': recipient_name,
        'certificateId': certificate_id,
        'companyName': company_data['company_name'],
        'issuer': company_data['issuer'],
        'courseTitle': company_data['course_title'],
        'issueDate': issue_date.strftime('%Y-%m-%d'),
        'duration': f"{hours_display} hours",
        'learningHours': hours,
        'nsqfLevel': nsqf_level,
        'skills': [],  # Could be populated based on course
        'certificateImageBase64': certificate_image_base64
    }

    # Submit to API
    print(f"📤 Submitting to API...")
    result = submit_certificate(api_data)

    return {
        'cert_data': api_data,
        'result': result
    }

def main():
    """Main function to generate multiple certificates"""
    print("=" * 80)
    print("🎓 Random Organization Certificate Generator")
    print("=" * 80)
    print(f"API URL: {API_URL}")
    print(f"Certificates to generate: {CERTIFICATE_COUNT}")
    print(f"Delay range: {DELAY_MIN}-{DELAY_MAX} seconds")
    print("=" * 80)

    if not API_KEY:
        print("❌ Error: API_KEY not found in environment variables")
        print("Please set API_KEY in your .env file")
        sys.exit(1)

    success_count = 0
    failed_count = 0
    duplicate_count = 0

    for i in range(CERTIFICATE_COUNT):
        print(f"\n[{i+1}/{CERTIFICATE_COUNT}] Generating certificate...")

        try:
            result = generate_and_submit()

            if result['result']['success']:
                print(f"✅ Success: {result['cert_data']['recipientName']} ({result['cert_data']['certificateId']})")
                success_count += 1
            elif result['result'].get('error') == 'Duplicate certificate':
                print(f"⚠️  Duplicate: {result['cert_data']['certificateId']}")
                duplicate_count += 1
            else:
                print(f"❌ Failed: {result['result'].get('message', 'Unknown error')}")
                failed_count += 1

        except Exception as e:
            print(f"❌ Error: {str(e)}")
            failed_count += 1

        # Random delay before next certificate (except for last one)
        if i < CERTIFICATE_COUNT - 1:
            delay = random.uniform(DELAY_MIN, DELAY_MAX)
            print(f"⏱️  Waiting {delay:.1f}s before next certificate...")
            time.sleep(delay)

    # Final summary
    print("\n" + "=" * 80)
    print("📊 Generation Summary")
    print("=" * 80)
    print(f"✅ Successful: {success_count}")
    print(f"⚠️  Duplicates: {duplicate_count}")
    print(f"❌ Failed: {failed_count}")
    print(f"📈 Total: {CERTIFICATE_COUNT}")
    print(f"📊 Success Rate: {(success_count/CERTIFICATE_COUNT*100):.1f}%")
    print("=" * 80)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Generation interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Fatal error: {str(e)}")
        sys.exit(1)
