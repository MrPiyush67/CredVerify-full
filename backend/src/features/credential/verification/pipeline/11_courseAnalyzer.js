import { categorizeCourse } from '../../services/llm.service.js';

/**
 * Stage 11: Course Analyzer
 * Analyzes course content and categorizes into NCrF sector using LLM
 *
 * @param {Object} courseData - Scraped course data
 * @returns {Promise<Object>} - Category and analysis result
 */
export async function analyzeCourse(courseData) {
  console.log(`🔍 [STAGE 11: COURSE-ANALYZER] Analyzing course content...`);

  if (!courseData) {
    console.warn(`⚠️  [STAGE 11] No course data to analyze`);
    return {
      success: false,
      category: null,
      confidence: 0,
      warning: 'No course data available for analysis',
    };
  }

  // Check if course has minimal data for analysis
  if (!courseData.title && !courseData.description) {
    console.warn(`⚠️  [STAGE 11] Insufficient course data for analysis (missing title and description)`);
    return {
      success: false,
      category: null,
      confidence: 0,
      warning: 'Insufficient course data for categorization',
    };
  }

  try {
    console.log(`   Course: ${courseData.title || 'Unknown'}`);

    const categorization = await categorizeCourse(courseData);

    console.log(`✅ [STAGE 11] Course categorized successfully`);
    console.log(`   Category: ${categorization.category}`);
    console.log(`   Confidence: ${(categorization.confidence * 100).toFixed(0)}%`);
    console.log(`   Reasoning: ${categorization.reasoning}`);

    return {
      success: true,
      category: categorization.category,
      confidence: categorization.confidence,
      reasoning: categorization.reasoning,
    };

  } catch (error) {
    console.error(`❌ [STAGE 11] Course analysis failed:`, error.message);

    // Check if it's an LLM service issue
    if (error.message.includes('GEMINI_API_KEY')) {
      console.error(`   ⚠️  Gemini API key not configured`);
    }

    // Provide a fallback category
    const fallbackCategory = inferCategoryFromTitle(courseData.title);

    console.warn(`   ⚠️  Using fallback category: ${fallbackCategory}`);

    return {
      success: false,
      error: error.message,
      category: fallbackCategory,
      confidence: 0.3,
      reasoning: 'Category determination failed; using fallback based on title keywords',
      warning: 'LLM categorization failed but fallback category assigned',
    };
  }
}

/**
 * Fallback category inference from title keywords
 * @param {string} title - Course title
 * @returns {string} - Inferred category
 */
function inferCategoryFromTitle(title) {
  if (!title) {
    return 'Education Training & Research';
  }

  const titleLower = title.toLowerCase();

  // Simple keyword-based fallback
  const categoryKeywords = {
    'IT/ITeS': ['programming', 'software', 'web', 'app', 'developer', 'coding', 'python', 'javascript', 'java', 'data', 'ai', 'machine learning', 'artificial intelligence', 'computer', 'technology', 'digital', 'cyber', 'cloud', 'database'],
    'Management': ['management', 'business', 'mba', 'leadership', 'strategy', 'entrepreneur', 'marketing', 'finance', 'hr', 'project management'],
    'Healthcare': ['health', 'medical', 'doctor', 'nursing', 'pharmacy', 'medicine', 'hospital', 'clinical'],
    'Agriculture': ['agriculture', 'farming', 'crop', 'agri'],
    'Automotive': ['automotive', 'automobile', 'vehicle', 'car', 'mechanic'],
    'Construction': ['construction', 'building', 'civil', 'architecture'],
    'Tourism & Hospitality': ['tourism', 'hospitality', 'hotel', 'travel', 'restaurant'],
    'Retail': ['retail', 'sales', 'customer service', 'shop'],
    'Media & Entertainment': ['media', 'entertainment', 'film', 'video', 'photography', 'design', 'graphics'],
    'Beauty & Wellness': ['beauty', 'wellness', 'spa', 'fitness', 'yoga'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (titleLower.includes(keyword)) {
        return category;
      }
    }
  }

  // Default fallback
  return 'Education Training & Research';
}
