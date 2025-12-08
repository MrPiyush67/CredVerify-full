"""
Flask API wrapper for Surya OCR service
Provides REST API endpoints for certificate text extraction
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
from certificate_ocr_surya import SuryaCertificateOCR
import base64
import io
import os
import tempfile
from PIL import Image
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Node.js backend communication

# Initialize Surya OCR (singleton)
logger.info("Initializing Surya OCR engine...")
try:
    ocr_engine = SuryaCertificateOCR(langs=['en'])
    logger.info("✅ Surya OCR engine initialized successfully")
except Exception as e:
    logger.error(f"❌ Failed to initialize Surya OCR: {e}")
    ocr_engine = None


@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy' if ocr_engine else 'unhealthy',
        'engine': 'surya',
        'version': '1.0.0'
    })


@app.route('/extract-text', methods=['POST'])
def extract_text():
    """
    Extract text from base64 encoded image

    Request body:
    {
        "imageData": "data:image/png;base64,iVBORw0KG..."
    }

    Response:
    {
        "success": true,
        "full_text": "extracted text...",
        "avg_confidence": 85.5,
        "num_lines": 25,
        "structured_data": {...}
    }
    """
    try:
        # Validate OCR engine
        if not ocr_engine:
            return jsonify({
                'success': False,
                'error': 'OCR engine not initialized'
            }), 500

        # Get request data
        data = request.get_json()
        if not data or 'imageData' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing imageData in request'
            }), 400

        image_base64 = data['imageData']

        # Handle data URL format (data:image/png;base64,...)
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]

        logger.info("📥 Received image for OCR processing")

        # Decode base64 to image
        try:
            image_data = base64.b64decode(image_base64)
            image = Image.open(io.BytesIO(image_data))
            logger.info(f"✅ Decoded image: {image.size[0]}x{image.size[1]} pixels")
        except Exception as e:
            logger.error(f"❌ Failed to decode image: {e}")
            return jsonify({
                'success': False,
                'error': f'Invalid image data: {str(e)}'
            }), 400

        # Save to temporary file (Surya requires file path)
        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_path = temp_file.name
            image.save(temp_path)
            logger.info(f"💾 Saved to temporary file: {temp_path}")

        try:
            # Run Surya OCR
            logger.info("🔍 Running Surya OCR extraction...")
            result = ocr_engine.extract_text(temp_path)

            if result['success']:
                logger.info(f"✅ OCR successful: {len(result['full_text'])} characters extracted")

                # Extract structured data
                try:
                    structured = ocr_engine.extract_structured_data(result['full_text'])
                    result['structured_data'] = structured
                    logger.info(f"📋 Structured data extracted: {structured}")
                except Exception as e:
                    logger.warning(f"⚠️ Failed to extract structured data: {e}")
                    result['structured_data'] = None
            else:
                logger.error(f"❌ OCR failed: {result.get('error', 'Unknown error')}")

            return jsonify(result)

        finally:
            # Clean up temporary file
            try:
                os.unlink(temp_path)
                logger.info(f"🗑️ Cleaned up temporary file")
            except Exception as e:
                logger.warning(f"⚠️ Failed to delete temp file: {e}")

    except Exception as e:
        logger.error(f"❌ Unexpected error in extract_text: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/extract-text-with-layout', methods=['POST'])
def extract_text_with_layout():
    """
    Extract text with layout information
    Similar to extract-text but includes spatial layout data
    """
    try:
        if not ocr_engine:
            return jsonify({
                'success': False,
                'error': 'OCR engine not initialized'
            }), 500

        data = request.get_json()
        if not data or 'imageData' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing imageData in request'
            }), 400

        image_base64 = data['imageData']
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]

        # Decode and save image
        image_data = base64.b64decode(image_base64)
        image = Image.open(io.BytesIO(image_data))

        with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as temp_file:
            temp_path = temp_file.name
            image.save(temp_path)

        try:
            # Run Surya OCR with layout
            result = ocr_engine.extract_text_with_layout(temp_path)

            if result['success']:
                structured = ocr_engine.extract_structured_data(result['full_text'])
                result['structured_data'] = structured

            return jsonify(result)

        finally:
            try:
                os.unlink(temp_path)
            except:
                pass

    except Exception as e:
        logger.error(f"Error in extract_text_with_layout: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8005))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'

    logger.info(f"🚀 Starting Surya OCR service on port {port}")
    logger.info(f"📍 Health check: http://localhost:{port}/health")
    logger.info(f"📍 Extract text: http://localhost:{port}/extract-text")

    app.run(
        host='0.0.0.0',
        port=port,
        debug=debug
    )
