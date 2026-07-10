import { scrapeCourseData } from '../../services/courseAnalysis.service.js';

/**
 * Stage 10: Course Scraper
 * Scrapes course data from course URL using Python service
 *
 * @param {Object} params
 * @param {string} params.courseUrl - Course URL to scrape
 * @param {string} params.platform - Optional platform hint
 * @returns {Promise<Object>} - Scraped course data
 */
export async function scrapeCourse(params) {
  const { courseUrl, platform } = params;

  console.log(`🌐 [STAGE 10: COURSE-SCRAPER] Starting course scraping...`);
  console.log(`   URL: ${courseUrl}`);
  if (platform) {
    console.log(`   Platform hint: ${platform}`);
  }

  try {
    const result = await scrapeCourseData(courseUrl, platform);

    if (result.success) {
      console.log(`✅ [STAGE 10] Successfully scraped course data`);
      console.log(`   Platform: ${result.platform}`);
      console.log(`   Title: ${result.data.title || 'Unknown'}`);

      const duration = result.data.duration || result.data.video_duration;
      if (duration) {
        console.log(`   Duration: ${duration}`);
      }

      const skillLevel = result.data.skill_level;
      if (skillLevel) {
        console.log(`   Skill Level: ${skillLevel}`);
      }

      return {
        success: true,
        platform: result.platform,
        courseData: result.data,
      };
    } else {
      throw new Error(result.error || 'Scraping returned unsuccessful status');
    }

  } catch (error) {
    console.error(`❌ [STAGE 10] Course scraping failed:`, error.message);

    // Check if it's a service availability issue
    if (error.message.includes('unavailable')) {
      console.error(`   ⚠️  Python course scraper service is not running`);
      console.error(`   ⚠️  Make sure to start it with: cd backend/course-scraper-service && python3 app.py`);
    }

    // Don't throw - allow verification to continue without course data
    return {
      success: false,
      error: error.message,
      courseData: null,
      warning: 'Course scraping failed but certificate verification will continue',
    };
  }
}

/**
 * Validate scraped course data
 * @param {Object} courseData - Scraped course data
 * @returns {boolean} - True if data looks valid
 */
export function validateCourseData(courseData) {
  if (!courseData) {
    return false;
  }

  // At minimum, we should have a title
  if (!courseData.title || courseData.title.trim() === '') {
    console.warn(`⚠️  [STAGE 10] Scraped course data missing title`);
    return false;
  }

  return true;
}
