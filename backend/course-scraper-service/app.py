"""
Course Scraper Service - Flask API
Multi-platform course scraping with automatic platform detection
Port: 8006
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sys
import os

# Add scrapers directory to path
sys.path.append(os.path.dirname(__file__))

from scraper_factory import ScraperFactory

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'course-scraper',
        'version': '1.0.0',
        'port': 8006
    }), 200

@app.route('/scrape-course', methods=['POST'])
def scrape_course():
    """
    Scrape course data from any supported platform

    Request Body:
    {
        "courseUrl": "https://www.udemy.com/course/...",
        "platform": "udemy"  // Optional - will auto-detect if not provided
    }

    Response:
    {
        "success": true,
        "platform": "udemy",
        "data": {
            "title": "Course Title",
            "instructor": "Instructor Name",
            "description": "Course description...",
            "video_duration": "66h",
            "lectures": "142",
            "skill_level": "All Levels",
            "what_you_will_learn": [...],
            "requirements": [...],
            "languages": "English",
            "captions": "Yes",
            "students": "500,000"
        }
    }
    """
    try:
        # Parse request body
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400

        course_url = data.get('courseUrl')
        platform = data.get('platform')  # Optional

        # Validate course URL
        if not course_url:
            return jsonify({
                'success': False,
                'error': 'courseUrl is required'
            }), 400

        if not isinstance(course_url, str) or not course_url.strip():
            return jsonify({
                'success': False,
                'error': 'courseUrl must be a non-empty string'
            }), 400

        logger.info(f"📥 Received scrape request for: {course_url}")
        if platform:
            logger.info(f"   Platform hint: {platform}")

        # Create appropriate scraper
        try:
            scraper = ScraperFactory.create_scraper(course_url, platform)
            logger.info(f"✅ Created {scraper.platform_name} scraper")
        except ValueError as e:
            logger.error(f"❌ Platform detection failed: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e),
                'supported_platforms': list(ScraperFactory.PLATFORM_MAP.keys())
            }), 400
        except NotImplementedError as e:
            logger.error(f"❌ Platform not implemented: {str(e)}")
            return jsonify({
                'success': False,
                'error': str(e),
                'supported_platforms': [k for k, v in ScraperFactory.PLATFORM_MAP.items() if v is not None]
            }), 501

        # Scrape course data
        try:
            course_data = scraper.scrape()
            logger.info(f"✅ Successfully scraped course: {course_data.get('title', 'Unknown')}")

            return jsonify({
                'success': True,
                'platform': scraper.platform_name,
                'data': course_data
            }), 200

        except Exception as scrape_error:
            logger.error(f"❌ Scraping failed: {str(scrape_error)}")
            return jsonify({
                'success': False,
                'error': f'Scraping failed: {str(scrape_error)}',
                'platform': scraper.platform_name
            }), 500

    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/supported-platforms', methods=['GET'])
def supported_platforms():
    """Get list of supported platforms"""
    platforms = []

    for domain, scraper_class in ScraperFactory.PLATFORM_MAP.items():
        if scraper_class is not None:
            platforms.append({
                'domain': domain,
                'platform': scraper_class.__name__.replace('Scraper', '').lower(),
                'status': 'available'
            })
        else:
            platforms.append({
                'domain': domain,
                'platform': domain.split('.')[0],
                'status': 'planned'
            })

    return jsonify({
        'success': True,
        'platforms': platforms,
        'count': len([p for p in platforms if p['status'] == 'available'])
    }), 200

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': ['/health', '/scrape-course', '/supported-platforms']
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal server error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8006))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'

    logger.info(f"🚀 Starting Course Scraper Service on port {port}")
    logger.info(f"   Debug mode: {debug}")
    logger.info(f"   Supported platforms: {len([v for v in ScraperFactory.PLATFORM_MAP.values() if v is not None])}")

    app.run(host='0.0.0.0', port=port, debug=debug)
