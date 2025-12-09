"""
NCrF/NSQF Calculator Service - Flask API
Calculate NCrF credits and determine NSQF levels
Port: 8007
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import logging
import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(__file__))

from ncrf_calculator import calculate_ncrf_credits
from nsqf_calculator import determine_nsqf_level, get_level_descriptor

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
        'service': 'ncrf-nsqf-calculator',
        'version': '1.0.0',
        'port': 8007
    }), 200

@app.route('/calculate-ncrf', methods=['POST'])
def calculate_ncrf():
    """
    Calculate NCrF credits from course data

    Request Body:
    {
        "courseData": {
            "duration": "66 total hours",
            "video_duration": "66h",
            "lectures": "142",
            ...
        }
    }

    Response:
    {
        "success": true,
        "duration_parsed": {
            "min_hours": 66,
            "max_hours": 66,
            "estimated_hours": 66,
            "parse_method": "hours_minutes",
            "original": "66h"
        },
        "credits_raw": 2.2,
        "credits_floor": 2,
        "credits_rounded": 2,
        "credits_ceiling": 3,
        "formula": "estimated_hours / 30",
        "reference": "1 NCrF credit = 30 notional learning hours",
        "can_compute": true,
        "source": "duration field"
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

        course_data = data.get('courseData', {})

        if not isinstance(course_data, dict):
            return jsonify({
                'success': False,
                'error': 'courseData must be an object'
            }), 400

        logger.info(f"📥 Received NCrF calculation request")

        # Calculate NCrF credits
        try:
            result = calculate_ncrf_credits(course_data)

            if result['can_compute']:
                logger.info(f"✅ Successfully calculated NCrF credits: {result['credits_rounded']}")
            else:
                logger.warning(f"⚠️  Could not compute NCrF credits: {result.get('error', 'Unknown error')}")

            return jsonify({
                'success': True,
                **result
            }), 200

        except Exception as calc_error:
            logger.error(f"❌ Calculation failed: {str(calc_error)}")
            return jsonify({
                'success': False,
                'error': f'Calculation failed: {str(calc_error)}'
            }), 500

    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/calculate-nsqf', methods=['POST'])
def calculate_nsqf():
    """
    Determine NSQF level from course content

    Request Body:
    {
        "courseData": {
            "skill_level": "Intermediate",
            "description": "Learn advanced Python programming...",
            "what_you_will_learn": ["Build web apps", "Use databases", ...],
            "title": "Advanced Python Development",
            ...
        }
    }

    Response:
    {
        "success": true,
        "level": 5,
        "level_descriptor": "Intermediate",
        "justification": {
            "process": "Applied knowledge in varied contexts",
            "professional_knowledge": "Applied theoretical knowledge",
            "professional_skills": "Moderate technical competence",
            "core_skills": "Effective communication, problem-solving",
            "responsibility": "Moderate independence, some supervision",
            "course_skill_level": "Intermediate"
        },
        "confidence": 0.75,
        "method": "keyword_analysis"
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

        course_data = data.get('courseData', {})

        if not isinstance(course_data, dict):
            return jsonify({
                'success': False,
                'error': 'courseData must be an object'
            }), 400

        logger.info(f"📥 Received NSQF level determination request")

        # Determine NSQF level
        try:
            result = determine_nsqf_level(course_data)

            level = result['level']
            logger.info(f"✅ Successfully determined NSQF level: {level} ({get_level_descriptor(level)})")

            # Add level descriptor
            result['level_descriptor'] = get_level_descriptor(level)

            return jsonify({
                'success': True,
                **result
            }), 200

        except Exception as calc_error:
            logger.error(f"❌ Determination failed: {str(calc_error)}")
            return jsonify({
                'success': False,
                'error': f'Determination failed: {str(calc_error)}'
            }), 500

    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.route('/calculate-both', methods=['POST'])
def calculate_both():
    """
    Calculate both NCrF credits and NSQF level in one call

    Request Body:
    {
        "courseData": {
            "duration": "66h",
            "skill_level": "Intermediate",
            "description": "...",
            ...
        }
    }

    Response:
    {
        "success": true,
        "ncrf": {...},
        "nsqf": {...}
    }
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body is required'
            }), 400

        course_data = data.get('courseData', {})

        logger.info(f"📥 Received combined NCrF + NSQF calculation request")

        # Calculate both
        ncrf_result = calculate_ncrf_credits(course_data)
        nsqf_result = determine_nsqf_level(course_data)
        nsqf_result['level_descriptor'] = get_level_descriptor(nsqf_result['level'])

        logger.info(f"✅ NCrF: {ncrf_result.get('credits_rounded', 'N/A')}, NSQF: {nsqf_result['level']}")

        return jsonify({
            'success': True,
            'ncrf': ncrf_result,
            'nsqf': nsqf_result
        }), 200

    except Exception as e:
        logger.error(f"❌ Unexpected error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
        'available_endpoints': ['/health', '/calculate-ncrf', '/calculate-nsqf', '/calculate-both']
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
    port = int(os.environ.get('PORT', 8007))
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'

    logger.info(f"🚀 Starting NCrF/NSQF Calculator Service on port {port}")
    logger.info(f"   Debug mode: {debug}")
    logger.info(f"   Formula: 1 NCrF credit = 30 notional learning hours")
    logger.info(f"   NSQF Levels: 1-10")

    app.run(host='0.0.0.0', port=port, debug=debug)
