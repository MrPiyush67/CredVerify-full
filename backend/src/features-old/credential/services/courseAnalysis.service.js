import axios from 'axios';

const COURSE_SCRAPER_URL = process.env.COURSE_SCRAPER_URL || 'http://localhost:8006';
const NCRF_NSQF_SERVICE_URL = process.env.NCRF_NSQF_SERVICE_URL || 'http://localhost:8007';

/**
 * Scrape course data from course URL
 * @param {string} courseUrl - Course URL to scrape
 * @param {string} platform - Optional platform hint (e.g., 'udemy')
 * @returns {Promise<Object>} - Scraped course data
 */
export async function scrapeCourseData(courseUrl, platform = null) {
  try {
    console.log(`🔍 [COURSE-SCRAPER] Scraping course: ${courseUrl}`);

    const response = await axios.post(
      `${COURSE_SCRAPER_URL}/scrape-course`,
      {
        courseUrl,
        platform,
      },
      {
        timeout: 60000, // 60 second timeout for scraping
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      console.log(`✅ [COURSE-SCRAPER] Successfully scraped ${response.data.platform} course`);
      console.log(`   Title: ${response.data.data.title || 'Unknown'}`);
      return response.data;
    } else {
      throw new Error(response.data.error || 'Scraping failed');
    }
  } catch (error) {
    console.error(`❌ [COURSE-SCRAPER] Failed:`, error.message);

    // Check if service is unavailable
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Course scraper service is unavailable. Please ensure it is running on port 8006.');
    }

    // Check if timeout
    if (error.code === 'ECONNABORTED') {
      throw new Error('Course scraping timed out. The website may be slow or blocking requests.');
    }

    throw error;
  }
}

/**
 * Calculate NCrF credits from course duration
 * @param {Object} scrapedCourseData - Scraped course data containing duration info
 * @returns {Promise<Object>} - NCrF calculation result
 */
export async function calculateNcrfCredits(scrapedCourseData) {
  try {
    console.log(`📊 [NCRF-CALCULATOR] Calculating NCrF credits...`);

    const response = await axios.post(
      `${NCRF_NSQF_SERVICE_URL}/calculate-ncrf`,
      {
        courseData: scrapedCourseData,
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      const credits = response.data.credits_rounded;
      console.log(`✅ [NCRF-CALCULATOR] Credits: ${credits}`);
      console.log(`   Raw: ${response.data.credits_raw}, Floor: ${response.data.credits_floor}, Ceiling: ${response.data.credits_ceiling}`);
      return response.data;
    } else {
      throw new Error(response.data.error || 'NCrF calculation failed');
    }
  } catch (error) {
    console.error(`❌ [NCRF-CALCULATOR] Failed:`, error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('NCrF/NSQF calculator service is unavailable. Please ensure it is running on port 8007.');
    }

    throw error;
  }
}

/**
 * Determine NSQF level from course content
 * @param {Object} scrapedCourseData - Scraped course data
 * @returns {Promise<Object>} - NSQF level determination result
 */
export async function calculateNsqfLevel(scrapedCourseData) {
  try {
    console.log(`📊 [NSQF-CALCULATOR] Determining NSQF level...`);

    const response = await axios.post(
      `${NCRF_NSQF_SERVICE_URL}/calculate-nsqf`,
      {
        courseData: scrapedCourseData,
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      const level = response.data.level;
      const descriptor = response.data.level_descriptor;
      console.log(`✅ [NSQF-CALCULATOR] Level: ${level} (${descriptor})`);
      console.log(`   Confidence: ${(response.data.confidence * 100).toFixed(0)}%`);
      return response.data;
    } else {
      throw new Error(response.data.error || 'NSQF calculation failed');
    }
  } catch (error) {
    console.error(`❌ [NSQF-CALCULATOR] Failed:`, error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('NCrF/NSQF calculator service is unavailable. Please ensure it is running on port 8007.');
    }

    throw error;
  }
}

/**
 * Calculate both NCrF and NSQF in a single call (more efficient)
 * @param {Object} scrapedCourseData - Scraped course data
 * @returns {Promise<Object>} - Combined NCrF and NSQF results
 */
export async function calculateNcrfAndNsqf(scrapedCourseData) {
  try {
    console.log(`📊 [NCRF-NSQF-CALCULATOR] Calculating NCrF credits and NSQF level...`);

    const response = await axios.post(
      `${NCRF_NSQF_SERVICE_URL}/calculate-both`,
      {
        courseData: scrapedCourseData,
      },
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data.success) {
      const { ncrf, nsqf } = response.data;
      console.log(`✅ [NCRF-NSQF-CALCULATOR] NCrF Credits: ${ncrf.credits_rounded}, NSQF Level: ${nsqf.level}`);
      return response.data;
    } else {
      throw new Error(response.data.error || 'Combined calculation failed');
    }
  } catch (error) {
    console.error(`❌ [NCRF-NSQF-CALCULATOR] Failed:`, error.message);

    if (error.code === 'ECONNREFUSED') {
      throw new Error('NCrF/NSQF calculator service is unavailable. Please ensure it is running on port 8007.');
    }

    throw error;
  }
}

/**
 * Check if Python services are healthy
 * @returns {Promise<Object>} - Health status of both services
 */
export async function checkServicesHealth() {
  const health = {
    courseScraper: { available: false, error: null },
    ncrfNsqf: { available: false, error: null },
  };

  // Check course scraper service
  try {
    const scraperResponse = await axios.get(`${COURSE_SCRAPER_URL}/health`, { timeout: 5000 });
    if (scraperResponse.data.status === 'healthy') {
      health.courseScraper.available = true;
    }
  } catch (error) {
    health.courseScraper.error = error.message;
  }

  // Check NCrF/NSQF service
  try {
    const ncrfResponse = await axios.get(`${NCRF_NSQF_SERVICE_URL}/health`, { timeout: 5000 });
    if (ncrfResponse.data.status === 'healthy') {
      health.ncrfNsqf.available = true;
    }
  } catch (error) {
    health.ncrfNsqf.error = error.message;
  }

  return health;
}
