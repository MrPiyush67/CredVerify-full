"""
Duration Parser
Parse duration strings from various formats into hours
Supports: "66h 30m", "10 weeks", "3 months", etc.
"""

import re
import logging

logger = logging.getLogger(__name__)

def parse_duration(duration_str):
    """
    Parse duration string and convert to hours

    Supported formats:
        - "66h 30m" or "66h" or "30m"
        - "10 weeks"
        - "3 months"
        - "5 days"
        - "66 total hours"
        - "66 hours of video"

    Args:
        duration_str (str): Duration string to parse

    Returns:
        dict: Dictionary with min_hours, max_hours, estimated_hours
    """
    if not duration_str or not isinstance(duration_str, str):
        return {
            'min_hours': 0,
            'max_hours': 0,
            'estimated_hours': 0,
            'parse_method': 'none',
            'original': duration_str
        }

    duration_str = duration_str.lower().strip()
    logger.info(f"📊 Parsing duration: '{duration_str}'")

    # Pattern 1: "66h 30m" or "66h" or "30m"
    hours = 0
    minutes = 0

    hour_match = re.search(r'(\d+)\s*h(?:our)?s?', duration_str)
    if hour_match:
        hours = int(hour_match.group(1))
        logger.info(f"  ✓ Found hours: {hours}")

    # Match minutes but exclude "month"
    min_match = re.search(r'(\d+)\s*m(?:in)?(?:ute)?s?(?!o)', duration_str)
    if min_match:
        minutes = int(min_match.group(1))
        logger.info(f"  ✓ Found minutes: {minutes}")

    if hours > 0 or minutes > 0:
        total_hours = hours + (minutes / 60.0)
        result = {
            'min_hours': int(total_hours),
            'max_hours': int(total_hours) + (1 if minutes > 0 else 0),
            'estimated_hours': int(round(total_hours)),
            'parse_method': 'hours_minutes',
            'original': duration_str
        }
        logger.info(f"  ✅ Parsed as {result['estimated_hours']} hours (method: hours_minutes)")
        return result

    # Pattern 2: "X weeks" or "X-Y weeks"
    week_match = re.search(r'(\d+)(?:\s*-\s*(\d+))?\s*weeks?', duration_str)
    if week_match:
        weeks_min = int(week_match.group(1))
        weeks_max = int(week_match.group(2)) if week_match.group(2) else weeks_min

        # Assume 10 hours per week (standard for online courses)
        hours_per_week = 10

        min_hours = weeks_min * hours_per_week
        max_hours = weeks_max * hours_per_week
        estimated = (min_hours + max_hours) // 2

        result = {
            'min_hours': min_hours,
            'max_hours': max_hours,
            'estimated_hours': estimated,
            'parse_method': 'weeks',
            'original': duration_str
        }
        logger.info(f"  ✅ Parsed as {estimated} hours from {weeks_min}-{weeks_max} weeks")
        return result

    # Pattern 3: "X months" or "X-Y months"
    month_match = re.search(r'(\d+)(?:\s*-\s*(\d+))?\s*months?', duration_str)
    if month_match:
        months_min = int(month_match.group(1))
        months_max = int(month_match.group(2)) if month_match.group(2) else months_min

        # Assume 4 weeks per month, 10 hours per week = 40 hours per month
        hours_per_month = 40

        min_hours = months_min * hours_per_month
        max_hours = months_max * hours_per_month
        estimated = (min_hours + max_hours) // 2

        result = {
            'min_hours': min_hours,
            'max_hours': max_hours,
            'estimated_hours': estimated,
            'parse_method': 'months',
            'original': duration_str
        }
        logger.info(f"  ✅ Parsed as {estimated} hours from {months_min}-{months_max} months")
        return result

    # Pattern 4: "X days" or "X-Y days"
    day_match = re.search(r'(\d+)(?:\s*-\s*(\d+))?\s*days?', duration_str)
    if day_match:
        days_min = int(day_match.group(1))
        days_max = int(day_match.group(2)) if day_match.group(2) else days_min

        # Assume 4 hours per day for self-paced learning
        hours_per_day = 4

        min_hours = days_min * hours_per_day
        max_hours = days_max * hours_per_day
        estimated = (min_hours + max_hours) // 2

        result = {
            'min_hours': min_hours,
            'max_hours': max_hours,
            'estimated_hours': estimated,
            'parse_method': 'days',
            'original': duration_str
        }
        logger.info(f"  ✅ Parsed as {estimated} hours from {days_min}-{days_max} days")
        return result

    # Pattern 5: Just a number (assume hours)
    number_match = re.search(r'(?:^|\s)(\d+)(?:\s|$)', duration_str)
    if number_match:
        hours = int(number_match.group(1))
        if 1 <= hours <= 10000:  # Sanity check
            result = {
                'min_hours': hours,
                'max_hours': hours,
                'estimated_hours': hours,
                'parse_method': 'number_only',
                'original': duration_str
            }
            logger.info(f"  ✅ Parsed as {hours} hours (method: number_only)")
            return result

    # Pattern 6: "X lectures"  (very rough estimate)
    lecture_match = re.search(r'(\d+)\s*lectures?', duration_str)
    if lecture_match:
        lectures = int(lecture_match.group(1))
        # Assume 10 minutes per lecture on average
        estimated_hours = (lectures * 10) // 60

        result = {
            'min_hours': estimated_hours,
            'max_hours': estimated_hours + (estimated_hours // 2),  # Add 50% buffer
            'estimated_hours': estimated_hours,
            'parse_method': 'lectures_estimate',
            'original': duration_str
        }
        logger.info(f"  ⚠️  Estimated {estimated_hours} hours from {lectures} lectures (rough estimate)")
        return result

    # No pattern matched
    logger.warning(f"  ❌ Could not parse duration: '{duration_str}'")
    return {
        'min_hours': 0,
        'max_hours': 0,
        'estimated_hours': 0,
        'parse_method': 'failed',
        'original': duration_str
    }

def duration_to_string(hours):
    """
    Convert hours to human-readable string

    Args:
        hours (int/float): Number of hours

    Returns:
        str: Human-readable duration (e.g., "66h 30m")
    """
    if hours <= 0:
        return "0h"

    whole_hours = int(hours)
    minutes = int((hours - whole_hours) * 60)

    if minutes == 0:
        return f"{whole_hours}h"
    else:
        return f"{whole_hours}h {minutes}m"
