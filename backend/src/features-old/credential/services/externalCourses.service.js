import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load categories mapping
const categoriesData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'categories.json'), 'utf-8')
);
const NCrF_CATEGORIES = categoriesData.categories;

// In-memory cache for courses
let coursesCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000, // 5 minutes cache (shorter to allow more frequent shuffles)
};

/**
 * Fisher-Yates shuffle algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} - Shuffled array
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate mock courses for a platform (fallback when API fails)
 */
function generateMockCourses(platform, count) {
  const platformConfig = {
    'edX': { color: '02262B', baseUrl: 'https://www.edx.org/course/' },
    'Udacity': { color: '02B3E4', baseUrl: 'https://www.udacity.com/course/' },
    'SWAYAM': { color: 'FF6600', baseUrl: 'https://swayam.gov.in/nc_details/' },
    'NPTEL': { color: '003366', baseUrl: 'https://nptel.ac.in/courses/' },
    'Microsoft Learn': { color: '0078D4', baseUrl: 'https://learn.microsoft.com/training/' },
    'DIKSHA': { color: 'FF6F00', baseUrl: 'https://diksha.gov.in/explore-course/' },
    'eGyankosh': { color: '006633', baseUrl: 'https://egyankosh.ac.in/' },
  };

  const config = platformConfig[platform] || { color: '666666', baseUrl: '#' };

  // Large pool of diverse course images from Unsplash
  const courseImages = [
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop', // Data charts
    'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=600&h=400&fit=crop', // AI brain
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&h=400&fit=crop', // Laptop coding
    'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=600&h=400&fit=crop', // Code screen
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop', // Analytics
    'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop', // Finance
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop', // Technology
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=400&fit=crop', // AI robot
    'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&h=400&fit=crop', // Mobile
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop', // Cybersecurity
    'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop', // Business meeting
    'https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=600&h=400&fit=crop', // Team work
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop', // Healthcare
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=600&h=400&fit=crop', // Nature
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop', // Team coding
    'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=600&h=400&fit=crop', // Office workspace
    'https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=600&h=400&fit=crop', // Business person
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop', // Team brainstorm
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop', // Startup team
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop', // Strategy meeting
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop', // Programming
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?w=600&h=400&fit=crop', // Office collaboration
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop', // Learning
    'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&h=400&fit=crop', // Books education
    'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop', // Presentation
    'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&h=400&fit=crop', // Students
    'https://images.unsplash.com/photo-1513258496099-48168024aec0?w=600&h=400&fit=crop', // Classroom
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&h=400&fit=crop', // Digital marketing
    'https://images.unsplash.com/photo-1432888622747-4eb9a8f2c293?w=600&h=400&fit=crop', // Keyboard hands
    'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop', // Desk setup
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=400&fit=crop', // Professional
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop', // Woman professional
    'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=400&fit=crop', // Books library
    'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600&h=400&fit=crop', // Science tech
    'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop', // Office desk
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=400&fit=crop', // Laptop work
    'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=600&h=400&fit=crop', // Student studying
    'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=400&fit=crop', // Office desk top
    'https://images.unsplash.com/photo-1496200186974-4293800e2c20?w=600&h=400&fit=crop', // Night coding
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=400&fit=crop', // Robot AI
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&h=400&fit=crop', // Servers
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=400&fit=crop', // Laptop desk
    'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600&h=400&fit=crop', // Business professionals
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&h=400&fit=crop', // Math equations
    'https://images.unsplash.com/photo-1533750349088-cd871a92f312?w=600&h=400&fit=crop', // Conference
    'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=400&fit=crop', // Office meeting
    'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&h=400&fit=crop', // Calculator finance
    'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=600&h=400&fit=crop', // Notes planning
    'https://images.unsplash.com/photo-1591696205602-2f950c417cb9?w=600&h=400&fit=crop', // Medical
    'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=600&h=400&fit=crop', // Green eco
  ];

  const courseTopics = [
    { title: 'Introduction to Data Science', category: 'IT/ITeS', difficulty: 'Beginner', duration: 40 },
    { title: 'Machine Learning Fundamentals', category: 'IT/ITeS', difficulty: 'Intermediate', duration: 60 },
    { title: 'Web Development with React', category: 'IT/ITeS', difficulty: 'Intermediate', duration: 50 },
    { title: 'Python Programming', category: 'IT/ITeS', difficulty: 'Beginner', duration: 30 },
    { title: 'Digital Marketing Essentials', category: 'Management', difficulty: 'Beginner', duration: 25 },
    { title: 'Financial Accounting Basics', category: 'BFSI', difficulty: 'Beginner', duration: 35 },
    { title: 'Business Analytics', category: 'Management', difficulty: 'Intermediate', duration: 45 },
    { title: 'Cloud Computing with AWS', category: 'IT/ITeS', difficulty: 'Advanced', duration: 70 },
    { title: 'Artificial Intelligence Ethics', category: 'IT/ITeS', difficulty: 'Intermediate', duration: 40 },
    { title: 'Mobile App Development', category: 'IT/ITeS', difficulty: 'Intermediate', duration: 55 },
    { title: 'Cybersecurity Fundamentals', category: 'IT/ITeS', difficulty: 'Intermediate', duration: 50 },
    { title: 'Project Management Professional', category: 'Management', difficulty: 'Advanced', duration: 80 },
    { title: 'Human Resource Management', category: 'Management', difficulty: 'Intermediate', duration: 40 },
    { title: 'Healthcare Administration', category: 'Healthcare', difficulty: 'Intermediate', duration: 45 },
    { title: 'Environmental Science', category: 'Agriculture', difficulty: 'Beginner', duration: 30 },
  ];

  const courses = [];
  for (let i = 0; i < count; i++) {
    const topic = courseTopics[i % courseTopics.length];
    const id = `${platform.toLowerCase().replace(/\s/g, '-')}-${Date.now()}-${i}`;

    // Pick a random image from the large pool for variety
    const randomImage = courseImages[Math.floor(Math.random() * courseImages.length)];

    courses.push({
      id,
      title: `${topic.title} - ${platform}`,
      description: `Learn ${topic.title.toLowerCase()} with industry experts from ${platform}. This course covers fundamental to advanced concepts with hands-on projects and real-world applications.`,
      platform,
      instructor: `${platform} Instructor`,
      duration: topic.duration,
      difficulty: topic.difficulty,
      image: randomImage,
      category: topic.category,
      nsqfLevel: calculateNSQFLevel(topic.difficulty, topic.duration),
      price: 'Free',
      originalPrice: '₹4,999',
      rating: 4.2 + Math.random() * 0.7,
      ratingsCount: Math.floor(Math.random() * 5000 + 500),
      url: `${config.baseUrl}${id}`,
      source: platform.toLowerCase().replace(/\s/g, '-'),
    });
  }

  console.log(`⚠️  Generated ${count} mock courses for ${platform} (with real images)`);
  return courses;
}

// Category mapping from different platforms to NCrF categories
const CATEGORY_MAPPING = {
  // Technology related
  'computer science': 'IT/ITeS',
  'data science': 'IT/ITeS',
  'programming': 'IT/ITeS',
  'software development': 'IT/ITeS',
  'web development': 'IT/ITeS',
  'mobile development': 'IT/ITeS',
  'artificial intelligence': 'IT/ITeS',
  'machine learning': 'IT/ITeS',
  'cybersecurity': 'IT/ITeS',
  'cloud computing': 'IT/ITeS',
  'information technology': 'IT/ITeS',
  'technology': 'IT/ITeS',

  // Business & Management
  'business': 'Management',
  'management': 'Management',
  'marketing': 'Management',
  'finance': 'BFSI',
  'accounting': 'BFSI',
  'banking': 'BFSI',
  'entrepreneurship': 'Management',
  'project management': 'Management',

  // Healthcare
  'health': 'Healthcare',
  'medicine': 'Healthcare',
  'nursing': 'Healthcare',
  'public health': 'Healthcare',
  'healthcare': 'Healthcare',
  'medical': 'Healthcare',

  // Engineering
  'engineering': 'Capital Goods & Manufacturing',
  'mechanical engineering': 'Capital Goods & Manufacturing',
  'electrical engineering': 'Electronics & Hardware',
  'electronics': 'Electronics & Hardware',
  'civil engineering': 'Construction',
  'aerospace': 'Aerospace & Aviation',
  'automotive': 'Automotive',

  // Science
  'chemistry': 'Chemicals & Petrochemicals',
  'biology': 'Life Sciences',
  'physics': 'Instrumentation',
  'environmental science': 'Environmental Science',
  'life sciences': 'Life Sciences',

  // Arts & Humanities
  'art': 'Handicrafts & Carpets',
  'design': 'Handicrafts & Carpets',
  'music': 'Musical Instruments',
  'humanities': 'Education Training & Research',
  'literature': 'Education Training & Research',
  'history': 'Education Training & Research',

  // Education
  'education': 'Education Training & Research',
  'teaching': 'Education Training & Research',
  'training': 'Education Training & Research',

  // Media
  'media': 'Media & Entertainment',
  'journalism': 'Media & Entertainment',
  'film': 'Media & Entertainment',
  'photography': 'Media & Entertainment',

  // Others
  'agriculture': 'Agriculture',
  'food': 'Food Industry',
  'hospitality': 'Tourism & Hospitality',
  'tourism': 'Tourism & Hospitality',
  'construction': 'Construction',
  'manufacturing': 'Capital Goods & Manufacturing',
  'retail': 'Retail',
  'logistics': 'Transportation Logistics & Warehousing',
  'transportation': 'Transportation Logistics & Warehousing',
  'real estate': 'Real Estate',
  'legal': 'Legal Activities',
  'law': 'Legal Activities',
  'sports': 'Sports Physical Education Fitness & Leisure',
  'fitness': 'Sports Physical Education Fitness & Leisure',
};

// Map a course subject/category to NCrF category
function mapToNCrFCategory(subject) {
  if (!subject) return 'Unorganised Sector';

  const subjectLower = subject.toLowerCase();

  // Direct match
  for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
    if (subjectLower.includes(key)) {
      return value;
    }
  }

  return 'Unorganised Sector'; // Default category
}

// Calculate NSQF level based on course difficulty and duration
function calculateNSQFLevel(difficulty, duration) {
  let baseLevel = 5; // Default mid-level

  // Adjust based on difficulty
  if (difficulty) {
    const diffLower = difficulty.toLowerCase();
    if (diffLower.includes('beginner') || diffLower.includes('introductory')) {
      baseLevel = 4;
    } else if (diffLower.includes('intermediate')) {
      baseLevel = 6;
    } else if (diffLower.includes('advanced') || diffLower.includes('expert')) {
      baseLevel = 8;
    }
  }

  // Adjust based on duration (in hours)
  if (duration) {
    if (duration < 10) baseLevel = Math.max(3, baseLevel - 1);
    else if (duration > 100) baseLevel = Math.min(10, baseLevel + 1);
  }

  return baseLevel;
}

/**
 * Fetch courses from Coursera API
 */
async function fetchCourseraCoursers(limit = 50) {
  try {
    console.log('📚 Fetching courses from Coursera...');
    const response = await axios.get('https://api.coursera.org/api/courses.v1', {
      params: {
        limit,
        fields: 'name,description,workload,partners,photoUrl,difficulty',
      },
      timeout: 15000,
    });

    const courses = response.data.elements || [];
    console.log(`✅ Fetched ${courses.length} courses from Coursera`);

    return courses.map((course) => ({
      id: course.id,
      title: course.name || 'Untitled Course',
      description: course.description || '',
      platform: 'Coursera',
      instructor: course.partners?.[0]?.name || 'Coursera',
      duration: course.workload ? parseFloat(course.workload) : null,
      difficulty: course.difficulty || 'Intermediate',
      image: course.photoUrl || 'https://placehold.co/600x400/0056D2/ffffff?text=Coursera',
      category: mapToNCrFCategory(course.name),
      nsqfLevel: calculateNSQFLevel(course.difficulty, course.workload),
      price: 'Free (Audit)',
      originalPrice: '₹4,999',
      rating: 4.5 + Math.random() * 0.5,
      ratingsCount: Math.floor(Math.random() * 10000 + 1000),
      url: `https://www.coursera.org/learn/${course.slug || course.id}`,
      source: 'coursera',
    }));
  } catch (error) {
    console.error('❌ Coursera API error:', error.message);
    return [];
  }
}

/**
 * Fetch courses from edX API
 */
async function fetchEdXCourses(limit = 50) {
  try {
    console.log('📚 Fetching courses from edX...');
    const response = await axios.get('https://www.edx.org/api/discovery/v1/course_runs/', {
      params: {
        limit,
        page: 1,
      },
      timeout: 15000,
    });

    const courses = response.data.results || [];
    console.log(`✅ Fetched ${courses.length} courses from edX`);

    return courses.map((course) => ({
      id: course.key,
      title: course.title || 'Untitled Course',
      description: course.short_description || course.full_description || '',
      platform: 'edX',
      instructor: course.staff?.[0]?.name || course.org || 'edX',
      duration: course.weeks_to_complete ? course.weeks_to_complete * 5 : null,
      difficulty: course.level_type || 'Intermediate',
      image: course.image?.src || 'https://placehold.co/600x400/02262B/ffffff?text=edX',
      category: mapToNCrFCategory(course.title),
      nsqfLevel: calculateNSQFLevel(course.level_type, course.weeks_to_complete * 5),
      price: 'Free (Audit)',
      originalPrice: '₹5,999',
      rating: 4.3 + Math.random() * 0.5,
      ratingsCount: Math.floor(Math.random() * 8000 + 500),
      url: course.marketing_url || `https://www.edx.org/course/${course.key}`,
      source: 'edx',
    }));
  } catch (error) {
    console.error('❌ edX API error:', error.message);
    // Return mock data as fallback
    return generateMockCourses('edX', limit);
  }
}

/**
 * Fetch courses from Udacity API
 */
async function fetchUdacityCourses(limit = 50) {
  try {
    console.log('📚 Fetching courses from Udacity...');
    const response = await axios.get('https://www.udacity.com/api/courses', {
      timeout: 15000,
    });

    let courses = response.data.courses || [];
    courses = courses.slice(0, limit);
    console.log(`✅ Fetched ${courses.length} courses from Udacity`);

    return courses.map((course) => ({
      id: course.key,
      title: course.title || 'Untitled Course',
      description: course.summary || course.short_summary || '',
      platform: 'Udacity',
      instructor: course.instructors?.[0]?.name || 'Udacity',
      duration: course.expected_duration_unit === 'months' ? course.expected_duration * 40 : course.expected_duration || null,
      difficulty: course.level || 'Intermediate',
      image: course.image || 'https://placehold.co/600x400/02B3E4/ffffff?text=Udacity',
      category: mapToNCrFCategory(course.title),
      nsqfLevel: calculateNSQFLevel(course.level, course.expected_duration * 40),
      price: 'Free',
      originalPrice: '₹7,999',
      rating: 4.4 + Math.random() * 0.5,
      ratingsCount: Math.floor(Math.random() * 5000 + 300),
      url: `https://www.udacity.com/course/${course.key}`,
      source: 'udacity',
    }));
  } catch (error) {
    console.error('❌ Udacity API error:', error.message);
    return generateMockCourses('Udacity', limit);
  }
}

/**
 * Fetch courses from SWAYAM (Government of India platform)
 */
async function fetchSwayamCourses(limit = 100) {
  try {
    console.log('📚 Fetching courses from SWAYAM...');

    // Try the actual SWAYAM API endpoint
    const response = await axios.get('https://swayam.gov.in/api/get_course_list', {
      timeout: 15000,
    });

    let courses = response.data?.courses || response.data?.results || response.data || [];
    if (!Array.isArray(courses)) {
      console.warn('⚠️ SWAYAM response is not an array, trying alternate format');
      if (response.data && typeof response.data === 'object' && response.data.data) {
        courses = response.data.data;
      } else {
        throw new Error('Invalid response format');
      }
    }

    courses = courses.slice(0, limit);
    console.log(`✅ Fetched ${courses.length} courses from SWAYAM with real data`);

    return courses.map((course) => ({
      id: course.id || course.course_id || course._id,
      title: course.title || course.name || course.course_name || 'Untitled Course',
      description: course.description || course.about || course.summary || '',
      platform: 'SWAYAM',
      instructor: course.instructor || course.coordinator || course.institute || 'SWAYAM',
      duration: course.duration || course.weeks ? parseInt(course.duration || course.weeks) * 5 : null,
      difficulty: course.level || course.difficulty || 'Intermediate',
      image: course.course_image || course.image || course.thumbnail || course.banner || course.icon_url || null,
      category: mapToNCrFCategory(course.title || course.name || course.category),
      nsqfLevel: calculateNSQFLevel(course.level || course.difficulty, (course.duration || course.weeks || 12) * 5),
      price: 'Free',
      originalPrice: '₹0',
      rating: 4.5 + Math.random() * 0.4,
      ratingsCount: Math.floor(Math.random() * 20000 + 1000),
      url: course.url || course.link || `https://swayam.gov.in/nd1_noc20_${course.id}`,
      source: 'swayam',
    }));
  } catch (error) {
    console.error('❌ SWAYAM API error:', error.message);
    // Return mock data as fallback
    return generateMockCourses('SWAYAM', limit);
  }
}

/**
 * Fetch courses from NPTEL (IIT-led platform)
 */
async function fetchNPTELCourses(limit = 100) {
  try {
    console.log('📚 Fetching courses from NPTEL...');

    // Try NPTEL course catalog API
    const response = await axios.get('https://nptel.ac.in/noc/courses.html?type=json', {
      timeout: 15000,
    });

    let courses = response.data?.courses || response.data || [];
    if (!Array.isArray(courses)) {
      // Try to extract courses from nested structure
      if (response.data && typeof response.data === 'object') {
        courses = Object.values(response.data).filter(item => typeof item === 'object' && item.title);
      } else {
        throw new Error('Invalid response format');
      }
    }

    courses = courses.slice(0, limit);
    console.log(`✅ Fetched ${courses.length} courses from NPTEL with real data`);

    return courses.map((course) => ({
      id: course.id || course.course_id || course.courseId || `nptel-${Date.now()}-${Math.random()}`,
      title: course.title || course.name || course.course_name || 'Untitled Course',
      description: course.description || course.about || course.summary || '',
      platform: 'NPTEL',
      instructor: course.instructor || course.faculty || course.coordinator || 'IIT/IISc Faculty',
      duration: course.duration || course.weeks ? parseInt(course.duration || course.weeks) * 5 : 60,
      difficulty: course.level || course.difficulty || 'Intermediate',
      image: course.course_image || course.image || course.thumbnail || course.icon_url || null,
      category: mapToNCrFCategory(course.title || course.name || course.discipline || course.subject),
      nsqfLevel: calculateNSQFLevel(course.level || 'Intermediate', (course.duration || course.weeks || 12) * 5),
      price: 'Free',
      originalPrice: '₹0',
      rating: 4.6 + Math.random() * 0.3,
      ratingsCount: Math.floor(Math.random() * 25000 + 2000),
      url: course.url || course.link || `https://nptel.ac.in/courses/${course.id}`,
      source: 'nptel',
    }));
  } catch (error) {
    console.error('❌ NPTEL API error:', error.message);
    // Return mock data as fallback
    return generateMockCourses('NPTEL', limit);
  }
}

/**
 * Fetch courses from Microsoft Learn
 */
async function fetchMicrosoftLearnCourses(limit = 50) {
  try {
    console.log('📚 Fetching courses from Microsoft Learn...');
    const response = await axios.get('https://learn.microsoft.com/api/contentbrowser/search/catalog', {
      params: {
        locale: 'en-us',
        facet: 'type:learningPath',
        $top: limit,
      },
      timeout: 15000,
    });

    const courses = response.data.results || [];
    console.log(`✅ Fetched ${courses.length} courses from Microsoft Learn`);

    return courses.map((course) => ({
      id: course.uid,
      title: course.title || 'Untitled Course',
      description: course.summary || '',
      platform: 'Microsoft Learn',
      instructor: 'Microsoft',
      duration: course.duration_in_minutes ? Math.floor(course.duration_in_minutes / 60) : null,
      difficulty: course.levels?.[0] || 'Intermediate',
      image: course.image_url || 'https://placehold.co/600x400/0078D4/ffffff?text=Microsoft+Learn',
      category: mapToNCrFCategory(course.title),
      nsqfLevel: calculateNSQFLevel(course.levels?.[0], course.duration_in_minutes / 60),
      price: 'Free',
      originalPrice: '₹0',
      rating: 4.5 + Math.random() * 0.4,
      ratingsCount: Math.floor(Math.random() * 7000 + 500),
      url: course.url || `https://learn.microsoft.com${course.path}`,
      source: 'microsoft',
    }));
  } catch (error) {
    console.error('❌ Microsoft Learn API error:', error.message);
    return generateMockCourses('Microsoft Learn', limit);
  }
}

/**
 * Fetch courses from DIKSHA (India's national education platform)
 */
async function fetchDIKSHACourses(limit = 50) {
  try {
    console.log('📚 Fetching courses from DIKSHA...');

    const response = await axios.post(
      'https://diksha.gov.in/api/composite/v3/search',
      {
        request: {
          filters: {
            contentType: ['Course'],
            status: ['Live'],
          },
          limit: limit,
          offset: 0,
          fields: ['name', 'description', 'duration', 'organisation', 'appIcon', 'posterImage', 'subject', 'medium', 'gradeLevel'],
        },
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    const courses = response.data?.result?.content || [];
    console.log(`✅ Fetched ${courses.length} courses from DIKSHA with real data`);

    return courses.map((course) => ({
      id: course.identifier || course.id,
      title: course.name || 'Untitled Course',
      description: course.description || '',
      platform: 'DIKSHA',
      instructor: course.organisation?.[0] || course.creator || 'DIKSHA',
      duration: course.duration ? parseInt(course.duration) / 60 : 20, // Convert seconds to hours
      difficulty: course.gradeLevel ? `Grade ${course.gradeLevel}` : 'Beginner',
      image: course.appIcon || course.posterImage || course.thumbnail || null,
      category: mapToNCrFCategory(course.subject?.[0] || course.name),
      nsqfLevel: course.gradeLevel ? Math.min(10, Math.max(3, parseInt(course.gradeLevel) - 2)) : 4,
      price: 'Free',
      originalPrice: '₹0',
      rating: 4.4 + Math.random() * 0.4,
      ratingsCount: Math.floor(Math.random() * 15000 + 500),
      url: `https://diksha.gov.in/play/content/${course.identifier}`,
      source: 'diksha',
    }));
  } catch (error) {
    console.error('❌ DIKSHA API error:', error.message);
    return generateMockCourses('DIKSHA', limit);
  }
}

/**
 * Fetch courses from IGNOU eGyankosh via OAI-PMH
 */
async function fetchEGyankoshCourses(limit = 30) {
  try {
    // console.log('📚 Fetching courses from eGyankosh...');
    // eGyankosh returns XML OAI-PMH data, using mock data for now
    return generateMockCourses('eGyankosh', limit);

    // Note: OAI-PMH returns XML, this is a simplified implementation
    // In production, you'd parse XML and extract metadata
    const response = await axios.get('http://egyankosh.ac.in/oai/request', {
      params: {
        verb: 'ListRecords',
        metadataPrefix: 'oai_dc',
        set: 'col_1_52509', // Example collection, adjust as needed
      },
      timeout: 25000,
    });

    // For now, return mock data as XML parsing would require additional setup
    console.log(`⚠️ eGyankosh returns XML data - using mock data for now`);

    const mockCourses = [
      {
        id: 'egyan-1',
        title: 'Distance Learning MBA Program',
        description: 'Master of Business Administration through distance learning',
        platform: 'IGNOU eGyankosh',
        instructor: 'IGNOU',
        duration: 480, // 2 years
        difficulty: 'Advanced',
        image: 'https://placehold.co/600x400/2E7D32/ffffff?text=eGyankosh',
        category: 'Management',
        nsqfLevel: 8,
        price: 'Free',
        originalPrice: '₹0',
        rating: 4.3,
        ratingsCount: 5000,
        url: 'http://egyankosh.ac.in/',
        source: 'egyankosh',
      },
      {
        id: 'egyan-2',
        title: 'Bachelor of Science in Computer Science',
        description: 'Undergraduate degree program in Computer Science',
        platform: 'IGNOU eGyankosh',
        instructor: 'IGNOU',
        duration: 720, // 3 years
        difficulty: 'Intermediate',
        image: 'https://placehold.co/600x400/2E7D32/ffffff?text=eGyankosh',
        category: 'IT/ITeS',
        nsqfLevel: 7,
        price: 'Free',
        originalPrice: '₹0',
        rating: 4.4,
        ratingsCount: 8000,
        url: 'http://egyankosh.ac.in/',
        source: 'egyankosh',
      },
    ];

    console.log(`✅ Fetched ${mockCourses.length} courses from eGyankosh`);
    return mockCourses.slice(0, limit);
  } catch (error) {
    console.error('❌ eGyankosh API error:', error.message);
    return [];
  }
}

/**
 * Fetch all courses from all platforms with caching
 */
export async function fetchAllExternalCourses(forceRefresh = false) {
  // Check cache
  const now = Date.now();
  if (!forceRefresh && coursesCache.data && coursesCache.timestamp && (now - coursesCache.timestamp) < coursesCache.ttl) {
    // console.log('✅ Returning cached courses:', coursesCache.data.length);
    return coursesCache.data;
  }

  console.log('🌐 Starting to fetch courses from all platforms...');

  const [coursera, edx, udacity, swayam, nptel, microsoft, diksha, egyankosh] = await Promise.allSettled([
    fetchCourseraCoursers(50),
    fetchEdXCourses(50),
    fetchUdacityCourses(30),
    fetchSwayamCourses(100),
    fetchNPTELCourses(100),
    fetchMicrosoftLearnCourses(50),
    fetchDIKSHACourses(50),
    fetchEGyankoshCourses(30),
  ]);

  // Log results for each platform
  console.log('Coursera:', coursera.status, coursera.status === 'fulfilled' ? `${coursera.value.length} courses` : coursera.reason?.message);
  console.log('edX:', edx.status, edx.status === 'fulfilled' ? `${edx.value.length} courses` : edx.reason?.message);
  console.log('Udacity:', udacity.status, udacity.status === 'fulfilled' ? `${udacity.value.length} courses` : udacity.reason?.message);
  console.log('SWAYAM:', swayam.status, swayam.status === 'fulfilled' ? `${swayam.value.length} courses` : swayam.reason?.message);
  console.log('NPTEL:', nptel.status, nptel.status === 'fulfilled' ? `${nptel.value.length} courses` : nptel.reason?.message);
  console.log('Microsoft:', microsoft.status, microsoft.status === 'fulfilled' ? `${microsoft.value.length} courses` : microsoft.reason?.message);
  console.log('DIKSHA:', diksha.status, diksha.status === 'fulfilled' ? `${diksha.value.length} courses` : diksha.reason?.message);
  console.log('eGyankosh:', egyankosh.status, egyankosh.status === 'fulfilled' ? `${egyankosh.value.length} courses` : egyankosh.reason?.message);

  const allCourses = [
    ...(coursera.status === 'fulfilled' ? coursera.value : []),
    ...(edx.status === 'fulfilled' ? edx.value : []),
    ...(udacity.status === 'fulfilled' ? udacity.value : []),
    ...(swayam.status === 'fulfilled' ? swayam.value : []),
    ...(nptel.status === 'fulfilled' ? nptel.value : []),
    ...(microsoft.status === 'fulfilled' ? microsoft.value : []),
    ...(diksha.status === 'fulfilled' ? diksha.value : []),
    ...(egyankosh.status === 'fulfilled' ? egyankosh.value : []),
  ];

  console.log(`✅ Total courses fetched: ${allCourses.length}`);

  // Log platform-wise breakdown
  const platformCounts = allCourses.reduce((acc, course) => {
    acc[course.platform] = (acc[course.platform] || 0) + 1;
    return acc;
  }, {});
  console.log('📊 Platform breakdown:', platformCounts);

  // Update cache
  coursesCache.data = allCourses;
  coursesCache.timestamp = now;

  return allCourses;
}

/**
 * Get courses by category
 */
export async function getCoursesByCategory(category) {
  const allCourses = await fetchAllExternalCourses();

  if (!category || category === 'all') {
    return allCourses;
  }

  return allCourses.filter((course) => course.category === category);
}

/**
 * Get available categories with course counts
 */
export async function getCourseCategoriesWithCounts() {
  const allCourses = await fetchAllExternalCourses();

  const categoryCounts = {};
  NCrF_CATEGORIES.forEach((cat) => {
    categoryCounts[cat] = 0;
  });

  allCourses.forEach((course) => {
    if (course.category && categoryCounts.hasOwnProperty(course.category)) {
      categoryCounts[course.category]++;
    }
  });

  return categoryCounts;
}

/**
 * Search courses by query with pagination
 */
export async function searchExternalCourses(query, filters = {}, pagination = {}) {
  let courses = await fetchAllExternalCourses();

  // Filter out courses with invalid duration (less than 7.5 hours or more than 30 hours)
  courses = courses.filter((course) => {
    if (!course.duration) return true; // Keep courses without duration info
    return course.duration >= 7.5 && course.duration <= 30;
  });

  // Search by title or description
  if (query && query.trim()) {
    const queryLower = query.toLowerCase();
    courses = courses.filter(
      (course) =>
        course.title.toLowerCase().includes(queryLower) ||
        course.description.toLowerCase().includes(queryLower)
    );
  }

  // Filter by platform
  if (filters.platform) {
    courses = courses.filter(
      (course) => course.platform.toLowerCase() === filters.platform.toLowerCase()
    );
  }

  // Filter by category
  if (filters.category) {
    courses = courses.filter((course) => course.category === filters.category);
  }

  // Filter by NSQF level
  if (filters.nsqfLevel) {
    courses = courses.filter((course) => course.nsqfLevel === parseInt(filters.nsqfLevel));
  }

  // Filter by duration range
  if (filters.minHours || filters.maxHours) {
    courses = courses.filter((course) => {
      if (!course.duration) return false;
      const min = filters.minHours ? parseInt(filters.minHours) : 0;
      const max = filters.maxHours ? parseInt(filters.maxHours) : Infinity;
      return course.duration >= min && course.duration <= max;
    });
  }

  // ALWAYS shuffle courses by default (unless explicitly disabled)
  // This ensures courses from all platforms are mixed together
  const shouldShuffle = pagination.shuffle !== 'false' && pagination.shuffle !== false;
  if (shouldShuffle) {
    courses = shuffleArray(courses);
  }

  // Apply pagination
  const page = parseInt(pagination.page) || 1;
  const limit = parseInt(pagination.limit) || 36;
  const totalCourses = courses.length;
  const totalPages = Math.ceil(totalCourses / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedCourses = courses.slice(startIndex, endIndex);

  return {
    courses: paginatedCourses,
    pagination: {
      currentPage: page,
      totalPages,
      totalCourses,
      coursesPerPage: limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      isShuffled: shouldShuffle,
    },
  };
}

export default {
  fetchAllExternalCourses,
  getCoursesByCategory,
  getCourseCategoriesWithCounts,
  searchExternalCourses,
};
