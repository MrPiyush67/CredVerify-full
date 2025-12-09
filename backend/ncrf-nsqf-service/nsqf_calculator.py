"""
NSQF Level Calculator
National Skills Qualifications Framework (NSQF) level determination
Levels 1-10 based on: Process, Knowledge, Skills, Responsibility
"""

import logging
import re

logger = logging.getLogger(__name__)

# NSQF Level Keywords for auto-detection
LEVEL_KEYWORDS = {
    1: ['basic', 'simple', 'routine', 'elementary', 'fundamental', 'primary'],
    2: ['familiar', 'semi-routine', 'supervised', 'guided', 'assisted'],
    3: ['known', 'routine', 'trained', 'basic technical', 'vocational'],
    4: ['factual', 'procedural', 'trained worker', 'certificate', 'competent'],
    5: ['moderate', 'diploma', 'applied knowledge', 'intermediate', 'associate', 'practical'],
    6: ['diploma', 'advanced diploma', 'applied theoretical', 'specialized', 'technical'],
    7: ['bachelor', 'degree', 'analytical', 'independent', 'graduate', 'professional'],
    8: ['postgraduate', 'master', 'advanced', 'research', 'strategic', 'expert'],
    9: ['doctoral', 'phd', 'expert', 'innovative', 'thought leader', 'original'],
    10: ['highest', 'pinnacle', 'world-class', 'national expert', 'authority', 'pioneering']
}

# Skill level mappings
SKILL_LEVEL_MAP = {
    'beginner': 3,
    'elementary': 2,
    'intermediate': 5,
    'advanced': 7,
    'expert': 8,
    'all levels': 5,
    'professional': 7,
    'master': 8
}

def determine_nsqf_level(course_data):
    """
    Determine NSQF level based on course content

    Args:
        course_data (dict): Course data with:
            - skill_level: Difficulty level
            - description: Course description
            - what_you_will_learn: Learning objectives
            - title: Course title
            - requirements: Prerequisites

    Returns:
        dict: NSQF level determination
            {
                'level': int (1-10),
                'justification': {
                    'process': str,
                    'professional_knowledge': str,
                    'professional_skills': str,
                    'core_skills': str,
                    'responsibility': str
                },
                'confidence': float (0.0-1.0),
                'method': str
            }
    """
    logger.info("📊 Determining NSQF level...")

    # Method 1: Check for explicit NSQF level
    explicit_level = extract_explicit_nsqf(course_data)
    if explicit_level:
        logger.info(f"  ✅ Found explicit NSQF level: {explicit_level}")
        return {
            'level': explicit_level,
            'justification': generate_justification(explicit_level, course_data),
            'confidence': 1.0,
            'method': 'explicit'
        }

    # Method 2: Keyword-based detection
    skill_level = course_data.get('skill_level', '').lower()
    description = course_data.get('description', '').lower()
    learning_outcomes = ' '.join(course_data.get('what_you_will_learn', [])).lower()
    title = course_data.get('title', '').lower()
    requirements = ' '.join(course_data.get('requirements', [])).lower()

    # Combine all text for analysis
    combined_text = f"{skill_level} {description} {learning_outcomes} {title} {requirements}"

    # Score each level based on keyword matches
    level_scores = {}
    for level, keywords in LEVEL_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in combined_text)
        level_scores[level] = score

    # Find highest scoring level
    best_level = max(level_scores, key=level_scores.get)
    max_score = level_scores[best_level]

    logger.info(f"  📈 Keyword matching scores: {level_scores}")

    # Method 3: Fallback to skill level mapping
    if max_score == 0 and skill_level:
        for key, level in SKILL_LEVEL_MAP.items():
            if key in skill_level:
                best_level = level
                max_score = 1
                logger.info(f"  📋 Mapped skill level '{skill_level}' to NSQF level {best_level}")
                break

    # Method 4: Default if nothing matched
    if max_score == 0:
        logger.warning("  ⚠️  No indicators found, defaulting to level 5 (intermediate)")
        best_level = 5
        confidence = 0.3
    else:
        # Calculate confidence based on score strength
        confidence = min(max_score / 5.0, 1.0)  # Normalize confidence

    logger.info(f"  ✅ Determined NSQF level: {best_level} (confidence: {confidence:.2f})")

    return {
        'level': best_level,
        'justification': generate_justification(best_level, course_data),
        'confidence': round(confidence, 2),
        'method': 'keyword_analysis'
    }

def extract_explicit_nsqf(course_data):
    """
    Check if NSQF level is explicitly mentioned in course data

    Args:
        course_data (dict): Course data

    Returns:
        int or None: Explicit NSQF level if found, else None
    """
    # Check for explicit NSQF level fields
    nsqf_fields = ['nsqf_level', 'nsqfLevel', 'NSQFLevel', 'nsqf']

    for field in nsqf_fields:
        if field in course_data:
            value = course_data[field]
            if isinstance(value, int) and 1 <= value <= 10:
                return value
            if isinstance(value, str):
                try:
                    level = int(value)
                    if 1 <= level <= 10:
                        return level
                except ValueError:
                    pass

    # Check in description or title for "NSQF Level X"
    text_fields = ['description', 'title', 'about']
    for field in text_fields:
        if field in course_data and course_data[field]:
            text = str(course_data[field])
            # Look for patterns like "NSQF Level 5" or "NSQF: 5"
            patterns = [
                r'nsqf\s+level\s+(\d+)',
                r'nsqf\s*:\s*(\d+)',
                r'level\s+(\d+)\s+nsqf'
            ]
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    level = int(match.group(1))
                    if 1 <= level <= 10:
                        return level

    return None

def generate_justification(level, course_data):
    """
    Generate human-readable justification for NSQF level

    Args:
        level (int): NSQF level (1-10)
        course_data (dict): Course data

    Returns:
        dict: Justification with process, knowledge, skills, responsibility
    """
    # NSQF level characteristics
    characteristics = {
        1: {
            'process': 'Routine, predictable tasks',
            'professional_knowledge': 'Basic general knowledge',
            'professional_skills': 'Minimal skills, fully supervised',
            'core_skills': 'Basic communication, minimal math',
            'responsibility': 'No responsibility, fully supervised'
        },
        2: {
            'process': 'Semi-routine tasks in familiar contexts',
            'professional_knowledge': 'Factual knowledge of field',
            'professional_skills': 'Basic operational skills',
            'core_skills': 'Basic language and numeracy',
            'responsibility': 'Work under close supervision'
        },
        3: {
            'process': 'Routine tasks with some complexity',
            'professional_knowledge': 'Procedural knowledge',
            'professional_skills': 'Trained technical skills',
            'core_skills': 'Communication, basic IT skills',
            'responsibility': 'Some autonomy under guidance'
        },
        4: {
            'process': 'Factual and procedural work',
            'professional_knowledge': 'Vocational knowledge',
            'professional_skills': 'Technical operational skills',
            'core_skills': 'Professional communication, IT proficiency',
            'responsibility': 'Work independently with guidance'
        },
        5: {
            'process': 'Applied knowledge in varied contexts',
            'professional_knowledge': 'Applied theoretical knowledge',
            'professional_skills': 'Moderate technical competence',
            'core_skills': 'Effective communication, problem-solving',
            'responsibility': 'Moderate independence, some supervision'
        },
        6: {
            'process': 'Complex technical and theoretical work',
            'professional_knowledge': 'Advanced theoretical concepts',
            'professional_skills': 'Advanced technical skills',
            'core_skills': 'Professional communication, analytical skills',
            'responsibility': 'Largely independent work'
        },
        7: {
            'process': 'Analytical and creative work',
            'professional_knowledge': 'Specialized knowledge',
            'professional_skills': 'Professional level skills',
            'core_skills': 'Critical thinking, research skills',
            'responsibility': 'Independent professional practice'
        },
        8: {
            'process': 'Strategic and innovative work',
            'professional_knowledge': 'Expert knowledge',
            'professional_skills': 'Expert professional skills',
            'core_skills': 'Advanced research, leadership',
            'responsibility': 'Fully independent, lead teams'
        },
        9: {
            'process': 'Cutting-edge research and innovation',
            'professional_knowledge': 'Original contribution to knowledge',
            'professional_skills': 'Thought leadership skills',
            'core_skills': 'Advanced research, publications',
            'responsibility': 'Lead research teams, mentor others'
        },
        10: {
            'process': 'Pioneering work at highest level',
            'professional_knowledge': 'World-class expertise',
            'professional_skills': 'National/international authority',
            'core_skills': 'Policy development, standard setting',
            'responsibility': 'Set standards for the field'
        }
    }

    justification = characteristics.get(level, characteristics[5])

    # Add context from course data
    skill_level = course_data.get('skill_level', '')
    if skill_level:
        justification['course_skill_level'] = skill_level

    return justification

def get_level_descriptor(level):
    """
    Get short descriptor for NSQF level

    Args:
        level (int): NSQF level (1-10)

    Returns:
        str: Short descriptor
    """
    descriptors = {
        1: 'Elementary',
        2: 'Basic',
        3: 'Routine',
        4: 'Competent',
        5: 'Intermediate',
        6: 'Advanced',
        7: 'Professional',
        8: 'Expert',
        9: 'Doctoral',
        10: 'National Expert'
    }
    return descriptors.get(level, 'Unknown')
