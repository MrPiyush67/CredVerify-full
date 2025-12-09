"""
Scraper Factory - Platform Detection and Scraper Creation
Factory pattern for creating platform-specific scrapers
"""

from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)

class ScraperFactory:
    """Factory class for creating platform-specific scrapers"""

    # Platform domain mapping
    # Maps domain names to their respective scraper classes
    PLATFORM_MAP = {}

    @staticmethod
    def register_scrapers():
        """
        Lazy load scraper classes to avoid import errors
        if dependencies are missing
        """
        if ScraperFactory.PLATFORM_MAP:
            return  # Already registered

        try:
            from scrapers.udemy_scraper import UdemyScraper
            ScraperFactory.PLATFORM_MAP['udemy.com'] = UdemyScraper
            ScraperFactory.PLATFORM_MAP['www.udemy.com'] = UdemyScraper
            ScraperFactory.PLATFORM_MAP['ude.my'] = UdemyScraper
            logger.info("✅ Registered Udemy scraper")
        except ImportError as e:
            logger.warning(f"⚠️  Could not load Udemy scraper: {e}")
            ScraperFactory.PLATFORM_MAP['udemy.com'] = None

        # Placeholder for future platforms
        # ScraperFactory.PLATFORM_MAP['coursera.org'] = None  # To be implemented
        # ScraperFactory.PLATFORM_MAP['skillindiadigital.gov.in'] = None  # To be implemented
        # ScraperFactory.PLATFORM_MAP['nptel.ac.in'] = None  # To be implemented

    @staticmethod
    def detect_platform(url):
        """
        Auto-detect platform from URL

        Args:
            url (str): Course URL

        Returns:
            str: Platform domain or None if not supported

        Examples:
            >>> ScraperFactory.detect_platform('https://www.udemy.com/course/python')
            'www.udemy.com'
            >>> ScraperFactory.detect_platform('https://udemy.com/course/python')
            'udemy.com'
        """
        try:
            parsed = urlparse(url)
            domain = parsed.netloc.lower()

            # Try exact match
            if domain in ScraperFactory.PLATFORM_MAP:
                logger.info(f"🎯 Detected platform: {domain}")
                return domain

            # Try subdomain stripping (e.g., www.udemy.com -> udemy.com)
            if domain.startswith('www.'):
                base_domain = domain[4:]  # Remove 'www.'
                if base_domain in ScraperFactory.PLATFORM_MAP:
                    logger.info(f"🎯 Detected platform (stripped www): {base_domain}")
                    return base_domain

            # Try base domain (e.g., courses.udemy.com -> udemy.com)
            domain_parts = domain.split('.')
            if len(domain_parts) >= 2:
                base_domain = '.'.join(domain_parts[-2:])
                if base_domain in ScraperFactory.PLATFORM_MAP:
                    logger.info(f"🎯 Detected platform (base domain): {base_domain}")
                    return base_domain

            logger.warning(f"⚠️  No platform detected for domain: {domain}")
            return None

        except Exception as e:
            logger.error(f"❌ Error parsing URL: {str(e)}")
            return None

    @staticmethod
    def create_scraper(url, platform_hint=None):
        """
        Create appropriate scraper for URL

        Args:
            url (str): Course URL
            platform_hint (str, optional): Platform name override

        Returns:
            BaseScraper: Instance of platform-specific scraper

        Raises:
            ValueError: If platform is unsupported
            NotImplementedError: If scraper for platform not yet implemented
        """
        # Ensure scrapers are registered
        ScraperFactory.register_scrapers()

        # Determine platform
        if platform_hint:
            # User provided platform hint
            platform = platform_hint.lower()
            # Normalize platform hint to domain format
            if '.' not in platform:
                # Convert 'udemy' to 'udemy.com'
                platform = f"{platform}.com"
        else:
            # Auto-detect from URL
            platform = ScraperFactory.detect_platform(url)

        if not platform:
            raise ValueError(f"Unsupported platform for URL: {url}")

        if platform not in ScraperFactory.PLATFORM_MAP:
            # Try to find similar platform
            available = list(ScraperFactory.PLATFORM_MAP.keys())
            raise ValueError(
                f"Platform '{platform}' not recognized. "
                f"Supported platforms: {', '.join(available)}"
            )

        scraper_class = ScraperFactory.PLATFORM_MAP.get(platform)

        if scraper_class is None:
            raise NotImplementedError(
                f"Scraper for platform '{platform}' is not yet implemented. "
                f"Coming soon!"
            )

        logger.info(f"🏗️  Creating {scraper_class.__name__} for {url}")
        return scraper_class(url)

    @staticmethod
    def get_supported_platforms():
        """
        Get list of supported platforms

        Returns:
            dict: Dictionary with 'available' and 'planned' platforms
        """
        ScraperFactory.register_scrapers()

        available = [
            domain for domain, scraper in ScraperFactory.PLATFORM_MAP.items()
            if scraper is not None
        ]

        planned = [
            domain for domain, scraper in ScraperFactory.PLATFORM_MAP.items()
            if scraper is None
        ]

        return {
            'available': available,
            'planned': planned,
            'total': len(ScraperFactory.PLATFORM_MAP)
        }
