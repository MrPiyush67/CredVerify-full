"""
Base Scraper Class
Abstract base class for all platform scrapers
Provides common scraping methods and template pattern
"""

from abc import ABC, abstractmethod
import requests
from bs4 import BeautifulSoup
import logging
import time

logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    """Abstract base class for platform-specific scrapers"""

    def __init__(self, url):
        """
        Initialize scraper with course URL

        Args:
            url (str): Course URL to scrape
        """
        self.url = url
        self.platform_name = self.__class__.__name__.replace('Scraper', '').lower()
        self.timeout = 30  # Default timeout in seconds
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
        }

    @abstractmethod
    def parse_course_data(self, html_content):
        """
        Parse HTML content and extract course data
        Must be implemented by subclass

        Args:
            html_content (str): HTML content of the course page

        Returns:
            dict: Extracted course data
        """
        pass

    def scrape_with_requests(self):
        """
        Fast scraping using requests library

        Returns:
            tuple: (success: bool, html_content: str or None)
        """
        logger.info(f"🔄 [{self.platform_name.upper()}] Attempting scrape with requests...")

        try:
            response = requests.get(
                self.url,
                headers=self.headers,
                timeout=self.timeout,
                allow_redirects=True
            )

            if response.status_code == 200:
                logger.info(f"✅ [{self.platform_name.upper()}] Successfully fetched with requests (status: {response.status_code})")
                return True, response.text
            else:
                logger.warning(f"⚠️  [{self.platform_name.upper()}] Requests failed with status: {response.status_code}")
                return False, None

        except requests.Timeout:
            logger.warning(f"⚠️  [{self.platform_name.upper()}] Request timed out after {self.timeout}s")
            return False, None
        except requests.RequestException as e:
            logger.warning(f"⚠️  [{self.platform_name.upper()}] Request failed: {str(e)}")
            return False, None
        except Exception as e:
            logger.error(f"❌ [{self.platform_name.upper()}] Unexpected error: {str(e)}")
            return False, None

    def scrape_with_playwright(self):
        """
        Fallback: Browser-based scraping using Playwright
        Used for dynamic content that requires JavaScript execution

        Returns:
            str: HTML content

        Raises:
            ImportError: If Playwright is not installed
            Exception: If scraping fails
        """
        logger.info(f"🔄 [{self.platform_name.upper()}] Falling back to Playwright...")

        try:
            from playwright.sync_api import sync_playwright
        except ImportError:
            logger.error(f"❌ [{self.platform_name.upper()}] Playwright not installed. Run: pip install playwright && playwright install chromium")
            raise ImportError("Playwright is required for dynamic scraping but not installed")

        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)

                context = browser.new_context(
                    user_agent=self.headers['User-Agent'],
                    viewport={'width': 1920, 'height': 1080}
                )

                page = context.new_page()

                logger.info(f"🌐 [{self.platform_name.upper()}] Navigating to: {self.url}")
                page.goto(self.url, wait_until='domcontentloaded', timeout=60000)

                # Wait for content to load
                time.sleep(3)

                # Get HTML content
                html_content = page.content()

                browser.close()

                logger.info(f"✅ [{self.platform_name.upper()}] Successfully scraped with Playwright ({len(html_content)} bytes)")
                return html_content

        except Exception as e:
            logger.error(f"❌ [{self.platform_name.upper()}] Playwright scraping failed: {str(e)}")
            raise

    def is_valid_html(self, html):
        """
        Check if HTML is valid and not compressed/blocked

        Args:
            html (str): HTML content to validate

        Returns:
            bool: True if HTML appears valid
        """
        if not html:
            return False

        # Check minimum length (compressed or blocked pages are usually short)
        if len(html) < 5000:
            logger.warning(f"⚠️  [{self.platform_name.upper()}] HTML too short ({len(html)} bytes), likely invalid")
            return False

        # Check for common blocking messages
        blocking_indicators = [
            'access denied',
            'captcha',
            'robot check',
            'blocked',
            'not available in your country',
            'page not found'
        ]

        html_lower = html.lower()
        for indicator in blocking_indicators:
            if indicator in html_lower:
                logger.warning(f"⚠️  [{self.platform_name.upper()}] Detected blocking: '{indicator}'")
                return False

        return True

    def scrape(self):
        """
        Main scraping logic with fallback strategy

        1. Try fast requests-based scraping
        2. Validate HTML content
        3. Fall back to Playwright if needed
        4. Parse and return data

        Returns:
            dict: Parsed course data

        Raises:
            Exception: If scraping fails completely
        """
        html_content = None

        # Step 1: Try requests first (faster)
        success, html_content = self.scrape_with_requests()

        # Step 2: Validate HTML
        if success and not self.is_valid_html(html_content):
            logger.warning(f"⚠️  [{self.platform_name.upper()}] HTML validation failed, retrying with Playwright...")
            success = False

        # Step 3: Fall back to Playwright if needed
        if not success:
            try:
                html_content = self.scrape_with_playwright()
            except Exception as e:
                logger.error(f"❌ [{self.platform_name.upper()}] All scraping methods failed")
                raise Exception(f"Failed to scrape {self.url}: {str(e)}")

        # Step 4: Parse and return data
        logger.info(f"📝 [{self.platform_name.upper()}] Parsing course data...")
        course_data = self.parse_course_data(html_content)

        # Add metadata
        course_data['_meta'] = {
            'url': self.url,
            'platform': self.platform_name,
            'scraped_at': time.strftime('%Y-%m-%d %H:%M:%S')
        }

        return course_data

    def extract_text_safe(self, element, default=''):
        """
        Safely extract text from BeautifulSoup element

        Args:
            element: BeautifulSoup element or None
            default: Default value if element is None

        Returns:
            str: Extracted text or default
        """
        if element is None:
            return default
        try:
            return element.get_text(strip=True)
        except Exception:
            return default

    def extract_attr_safe(self, element, attr, default=''):
        """
        Safely extract attribute from BeautifulSoup element

        Args:
            element: BeautifulSoup element or None
            attr: Attribute name
            default: Default value if element is None or attribute missing

        Returns:
            str: Attribute value or default
        """
        if element is None:
            return default
        try:
            return element.get(attr, default)
        except Exception:
            return default
