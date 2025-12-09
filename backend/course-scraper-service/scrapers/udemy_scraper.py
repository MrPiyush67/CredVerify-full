"""
Udemy Course Scraper
Extracts course information from Udemy course pages
Adapted from existing udemy_scraper_requests.py
"""

from bs4 import BeautifulSoup
import re
import logging
from .base_scraper import BaseScraper

logger = logging.getLogger(__name__)

class UdemyScraper(BaseScraper):
    """Scraper specifically for Udemy courses"""

    def parse_course_data(self, html_content):
        """
        Parse Udemy course page HTML and extract course information

        Args:
            html_content (str): HTML content of Udemy course page

        Returns:
            dict: Extracted course data with keys:
                - title: Course title
                - instructor: Instructor name
                - description: Course description
                - students: Number of students enrolled
                - lectures: Number of lectures
                - video_duration: Total video duration
                - articles: Number of articles
                - skill_level: Difficulty level
                - what_you_will_learn: List of learning objectives
                - requirements: List of prerequisites
                - languages: Course languages
                - captions: Caption availability
        """
        soup = BeautifulSoup(html_content, 'html.parser')
        course_data = {}

        # Extract course title
        try:
            title = soup.find('h1', {'data-purpose': 'lead-title'})
            if not title:
                # Try alternate selector
                title = soup.find('div', {'data-purpose': 'title'})
            course_data['title'] = self.extract_text_safe(title)
            logger.info(f"  📚 Title: {course_data['title']}")
        except Exception as e:
            course_data['title'] = None
            logger.warning(f"  ⚠️  Title not found: {e}")

        # Extract instructor name
        try:
            # Look for links with /user/ in href
            instructor_links = soup.find_all('a', href=lambda x: x and '/user/' in x if x else False)
            if instructor_links:
                course_data['instructor'] = instructor_links[0].get_text(strip=True)
            else:
                course_data['instructor'] = None
            if course_data['instructor']:
                logger.info(f"  👤 Instructor: {course_data['instructor']}")
        except Exception as e:
            course_data['instructor'] = None
            logger.warning(f"  ⚠️  Instructor not found: {e}")

        # Extract course description
        try:
            description = soup.find(attrs={'data-purpose': 'course-description'})
            if not description:
                description = soup.find(attrs={'data-purpose': 'description-content'})
            course_data['description'] = self.extract_text_safe(description)
            if course_data['description']:
                logger.info(f"  📝 Description: {course_data['description'][:100]}...")
        except Exception as e:
            course_data['description'] = None
            logger.warning(f"  ⚠️  Description not found: {e}")

        # Extract enrollment data (students)
        try:
            enrollment = soup.find(attrs={'data-purpose': 'enrollment'})
            if enrollment:
                students_text = enrollment.get_text(strip=True)
                course_data['students'] = students_text.replace('students', '').strip()
                logger.info(f"  👥 Students: {course_data['students']}")
            else:
                course_data['students'] = None
        except Exception as e:
            course_data['students'] = None
            logger.warning(f"  ⚠️  Students not found: {e}")

        # Extract curriculum stats (lectures and duration)
        try:
            curriculum_stats = soup.find(attrs={'data-purpose': 'curriculum-stats'})
            if curriculum_stats:
                stats_text = curriculum_stats.get_text(strip=True)
                # Parse: "16 sections • 142 lectures • 19h 6m total length"
                lectures_match = re.search(r'(\d+)\s*lectures?', stats_text)
                duration_match = re.search(r'(\d+h\s*\d+m|\d+h|\d+m)\s*total', stats_text)

                if lectures_match:
                    course_data['lectures'] = lectures_match.group(1)
                    logger.info(f"  🎓 Lectures: {course_data['lectures']}")

                if duration_match:
                    course_data['video_duration'] = duration_match.group(1)
                    logger.info(f"  ⏱️  Duration: {course_data['video_duration']}")
            else:
                course_data['lectures'] = None
                course_data['video_duration'] = None
        except Exception as e:
            course_data['lectures'] = None
            course_data['video_duration'] = None
            logger.warning(f"  ⚠️  Curriculum stats not found: {e}")

        # Extract "This course includes" section
        try:
            # Find video duration if not already found
            if not course_data.get('video_duration'):
                video_elem = soup.find(attrs={'data-purpose': 'video-content-length'})
                if video_elem:
                    course_data['video_duration'] = video_elem.get_text(strip=True).replace('on-demand video', '').strip()

            # Find articles
            articles_elem = soup.find(attrs={'data-purpose': 'num-articles'})
            if articles_elem:
                course_data['articles'] = articles_elem.get_text(strip=True)
                logger.info(f"  📄 Articles: {course_data['articles']}")
            else:
                course_data['articles'] = '0'
        except Exception as e:
            course_data['articles'] = '0'
            logger.warning(f"  ⚠️  Course includes section error: {e}")

        # Extract What you'll learn
        try:
            what_learn_items = soup.find_all(attrs={'data-purpose': 'objective'})
            if what_learn_items:
                course_data['what_you_will_learn'] = [
                    item.get_text(strip=True) for item in what_learn_items
                ]
                logger.info(f"  ✅ Learning objectives: {len(course_data['what_you_will_learn'])} items")
            else:
                course_data['what_you_will_learn'] = []
        except Exception as e:
            course_data['what_you_will_learn'] = []
            logger.warning(f"  ⚠️  What you'll learn not found: {e}")

        # Extract Requirements
        try:
            # Look for requirements section
            req_section = soup.find('div', attrs={'data-purpose': 'requirements'})
            if req_section:
                req_items = req_section.find_all('li')
                course_data['requirements'] = [
                    item.get_text(strip=True) for item in req_items
                ]
                logger.info(f"  📋 Requirements: {len(course_data['requirements'])} items")
            else:
                course_data['requirements'] = []
        except Exception as e:
            course_data['requirements'] = []
            logger.warning(f"  ⚠️  Requirements not found: {e}")

        # Extract skill level
        try:
            skill_patterns = ['All Levels', 'Beginner', 'Intermediate', 'Expert', 'Advanced']
            course_data['skill_level'] = None
            for pattern in skill_patterns:
                if pattern in html_content:
                    course_data['skill_level'] = pattern
                    logger.info(f"  📊 Skill Level: {course_data['skill_level']}")
                    break
        except Exception:
            course_data['skill_level'] = None

        # Extract language and captions
        try:
            # Look in the HTML for language info
            lang_match = re.search(r'Languages?:\s*([A-Za-z,\s]+)', html_content)
            if lang_match:
                course_data['languages'] = lang_match.group(1).strip()
            else:
                course_data['languages'] = 'English'  # Default

            logger.info(f"  🌐 Languages: {course_data['languages']}")

            # Captions
            if 'Captions:' in html_content or 'Subtitles' in html_content:
                course_data['captions'] = 'Yes'
                logger.info(f"  📝 Captions: Available")
            else:
                course_data['captions'] = 'No'
        except Exception:
            course_data['languages'] = 'English'
            course_data['captions'] = 'No'

        # Log summary
        logger.info(f"\n{'='*60}")
        logger.info(f"✅ Successfully extracted Udemy course data")
        logger.info(f"{'='*60}")

        return course_data

    def is_valid_html(self, html):
        """
        Override validation for Udemy-specific checks

        Args:
            html (str): HTML content

        Returns:
            bool: True if HTML appears to be valid Udemy course page
        """
        if not super().is_valid_html(html):
            return False

        # Check for Udemy-specific indicators
        udemy_indicators = [
            'data-purpose="lead-title"',
            'data-purpose="course-description"',
            'udemy.com',
            'course-landing-page'
        ]

        # At least one indicator should be present
        html_lower = html.lower()
        has_indicator = any(indicator.lower() in html_lower for indicator in udemy_indicators)

        if not has_indicator:
            logger.warning(f"⚠️  [UDEMY] HTML doesn't appear to be a Udemy course page")
            return False

        return True
