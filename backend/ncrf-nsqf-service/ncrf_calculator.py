"""
NCrF Credit Calculator
National Credit Framework (NCrF) credit calculation
Formula: 1 NCrF credit = 30 notional learning hours
"""

import logging
from duration_parser import parse_duration, duration_to_string
import math

logger = logging.getLogger(__name__)

def calculate_ncrf_credits(course_data):
    """
    Calculate NCrF credits from course duration

    Args:
        course_data (dict): Course data with duration-related fields
            Expected fields:
            - duration: Duration string
            - video_duration: Video duration string
            - lectures: Number of lectures
            - totalHours: Total hours (if available)

    Returns:
        dict: NCrF credit calculations
            {
                'duration_parsed': {...},
                'credits_raw': float,
                'credits_floor': int,
                'credits_rounded': int,
                'credits_ceiling': int,
                'formula': str,
                'reference': str,
                'can_compute': bool,
                'source': str
            }
    """
    logger.info("📊 Starting NCrF credit calculation...")

    # Check if NCrF credits are explicitly mentioned
    explicit_ncrf = extract_explicit_ncrf(course_data)
    if explicit_ncrf:
        logger.info(f"  ✅ Found explicit NCrF credits: {explicit_ncrf}")
        return {
            'duration_parsed': {'estimated_hours': explicit_ncrf * 30},
            'credits_raw': explicit_ncrf,
            'credits_floor': math.floor(explicit_ncrf),
            'credits_rounded': round(explicit_ncrf),
            'credits_ceiling': math.ceil(explicit_ncrf),
            'formula': 'explicit from course',
            'reference': '1 NCrF credit = 30 notional learning hours',
            'can_compute': True,
            'source': 'explicit_ncrf'
        }

    # Try to extract duration from various fields
    duration_str = None
    source_field = None

    # Priority order for duration fields
    duration_fields = [
        ('duration', 'duration field'),
        ('video_duration', 'video duration'),
        ('totalHours', 'total hours'),
        ('learningHours', 'learning hours')
    ]

    for field, description in duration_fields:
        if field in course_data and course_data[field]:
            duration_str = str(course_data[field])
            source_field = description
            logger.info(f"  📋 Using {description}: '{duration_str}'")
            break

    if not duration_str:
        logger.warning("  ❌ No duration information found in course data")
        return {
            'duration_parsed': {'estimated_hours': 0},
            'credits_raw': 0,
            'credits_floor': 0,
            'credits_rounded': 0,
            'credits_ceiling': 0,
            'formula': 'N/A',
            'reference': '1 NCrF credit = 30 notional learning hours',
            'can_compute': False,
            'source': 'no_duration',
            'error': 'No duration information available'
        }

    # Parse duration to hours
    parsed = parse_duration(duration_str)

    if parsed['estimated_hours'] == 0:
        logger.warning(f"  ❌ Could not parse duration: '{duration_str}'")
        return {
            'duration_parsed': parsed,
            'credits_raw': 0,
            'credits_floor': 0,
            'credits_rounded': 0,
            'credits_ceiling': 0,
            'formula': 'N/A',
            'reference': '1 NCrF credit = 30 notional learning hours',
            'can_compute': False,
            'source': 'parse_failed',
            'error': f'Could not parse duration: {duration_str}'
        }

    # Calculate credits (1 credit = 30 hours)
    estimated_hours = parsed['estimated_hours']
    credits_raw = estimated_hours / 30.0
    credits_floor = math.floor(credits_raw)
    credits_rounded = round(credits_raw)
    credits_ceiling = math.ceil(credits_raw)

    logger.info(f"  ✅ Calculated NCrF credits:")
    logger.info(f"     Estimated hours: {estimated_hours}")
    logger.info(f"     Raw credits: {credits_raw:.2f}")
    logger.info(f"     Floor: {credits_floor}, Rounded: {credits_rounded}, Ceiling: {credits_ceiling}")

    return {
        'duration_parsed': parsed,
        'credits_raw': round(credits_raw, 2),
        'credits_floor': credits_floor,
        'credits_rounded': credits_rounded,
        'credits_ceiling': credits_ceiling,
        'formula': 'estimated_hours / 30',
        'reference': '1 NCrF credit = 30 notional learning hours',
        'can_compute': True,
        'source': source_field,
        'hours_formatted': duration_to_string(estimated_hours)
    }

def extract_explicit_ncrf(course_data):
    """
    Check if NCrF credits are explicitly mentioned in course data

    Args:
        course_data (dict): Course data

    Returns:
        float or None: Explicit NCrF credits if found, else None
    """
    # Check for explicit NCrF credit fields
    ncrf_fields = ['ncrf_credits', 'ncrfCredits', 'credits', 'ncrf']

    for field in ncrf_fields:
        if field in course_data:
            value = course_data[field]
            if isinstance(value, (int, float)) and value > 0:
                return float(value)
            if isinstance(value, str):
                try:
                    return float(value)
                except ValueError:
                    pass

    # Check in description or title for "X NCrF credits"
    text_fields = ['description', 'title', 'about']
    for field in text_fields:
        if field in course_data and course_data[field]:
            text = str(course_data[field]).lower()
            # Look for patterns like "4 ncrf credits" or "ncrf: 4 credits"
            import re
            patterns = [
                r'(\d+(?:\.\d+)?)\s*ncrf\s*credits?',
                r'ncrf\s*:\s*(\d+(?:\.\d+)?)',
                r'credits?\s*:\s*(\d+(?:\.\d+)?)\s*ncrf'
            ]
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    return float(match.group(1))

    return None

def estimate_with_lectures(num_lectures):
    """
    Estimate NCrF credits based on number of lectures
    (fallback method, less accurate)

    Args:
        num_lectures (int): Number of lectures

    Returns:
        dict: Credit estimates
    """
    # Assume 10 minutes per lecture on average
    estimated_minutes = num_lectures * 10
    estimated_hours = estimated_minutes / 60.0

    credits_raw = estimated_hours / 30.0

    return {
        'duration_parsed': {
            'estimated_hours': int(estimated_hours),
            'parse_method': 'lecture_estimate'
        },
        'credits_raw': round(credits_raw, 2),
        'credits_floor': math.floor(credits_raw),
        'credits_rounded': round(credits_raw),
        'credits_ceiling': math.ceil(credits_raw),
        'formula': '(lectures * 10 min) / 60 / 30',
        'reference': '1 NCrF credit = 30 notional learning hours',
        'can_compute': True,
        'source': 'lecture_estimate',
        'warning': 'Estimated from lecture count, may be inaccurate'
    }
