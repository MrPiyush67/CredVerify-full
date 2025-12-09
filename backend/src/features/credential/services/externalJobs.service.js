import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load job sector mapping
const jobMappingData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'jobSectorMapping.json'), 'utf-8')
);

const SECTOR_TO_JOB_QUERY = jobMappingData.sectorToJobQuery;

// Adzuna API configuration
const ADZUNA_CONFIG = {
  baseUrl: 'https://api.adzuna.com/v1/api/jobs',
  country: 'in', // India
  appId: process.env.ADZUNA_APP_ID || '',
  appKey: process.env.ADZUNA_APP_KEY || '',
};

// In-memory cache for jobs
let jobsCache = {
  data: null,
  timestamp: null,
  ttl: 10 * 60 * 1000, // 10 minutes cache
};

/**
 * Fisher-Yates shuffle algorithm
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
 * Normalize job data from Adzuna API to our standard format
 */
function normalizeAdzunaJob(job) {
  return {
    id: job.id,
    title: job.title,
    company: job.company?.display_name || 'Not specified',
    location: job.location?.display_name || 'India',
    description: job.description || '',
    salary: formatSalary(job.salary_min, job.salary_max),
    salaryMin: job.salary_min,
    salaryMax: job.salary_max,
    type: job.contract_time || 'Full-time',
    postedDate: job.created ? new Date(job.created).toISOString() : new Date().toISOString(),
    url: job.redirect_url,
    source: 'Adzuna',
    category: job.category?.label || 'Other',
    tags: job.category?.tag ? [job.category.tag] : [],
  };
}

/**
 * Format salary range
 */
function formatSalary(min, max) {
  if (!min && !max) return 'Not disclosed';

  const formatAmount = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    return `₹${(amount / 1000).toFixed(0)}K`;
  };

  if (min && max) {
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  } else if (min) {
    return `From ${formatAmount(min)}`;
  } else {
    return `Up to ${formatAmount(max)}`;
  }
}

/**
 * Generate mock jobs for a sector (fallback when API fails)
 */
function generateMockJobs(sector, count = 10) {
  const sectorConfig = SECTOR_TO_JOB_QUERY[sector];
  if (!sectorConfig) {
    throw new Error(`Unknown sector: ${sector}`);
  }

  const companies = [
    'TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra',
    'Reliance', 'Tata Group', 'Adani Group', 'Larsen & Toubro', 'ITC',
    'Mahindra & Mahindra', 'Bharti Airtel', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
    'Amazon India', 'Flipkart', 'Swiggy', 'Zomato', 'Ola',
    'Byju\'s', 'Unacademy', 'Vedantu', 'PhonePe', 'Paytm'
  ];

  const locations = [
    'Bangalore, Karnataka',
    'Mumbai, Maharashtra',
    'Delhi NCR',
    'Hyderabad, Telangana',
    'Pune, Maharashtra',
    'Chennai, Tamil Nadu',
    'Kolkata, West Bengal',
    'Ahmedabad, Gujarat',
    'Jaipur, Rajasthan',
    'Kochi, Kerala'
  ];

  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship'];

  const jobs = [];
  const keywords = sectorConfig.keywords;

  for (let i = 0; i < count; i++) {
    const keyword = keywords[i % keywords.length];
    const company = companies[Math.floor(Math.random() * companies.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const salaryMin = Math.floor(Math.random() * 500000) + 300000; // 3L - 8L
    const salaryMax = salaryMin + Math.floor(Math.random() * 500000) + 200000;

    jobs.push({
      id: `mock-${sector}-${i}`,
      title: `${keyword.charAt(0).toUpperCase() + keyword.slice(1)}`,
      company: company,
      location: location,
      description: `Exciting opportunity for ${keyword} at ${company}. We are looking for talented professionals to join our growing team in ${sector}. The ideal candidate will have relevant experience and passion for innovation.`,
      salary: formatSalary(salaryMin, salaryMax),
      salaryMin: salaryMin,
      salaryMax: salaryMax,
      type: jobTypes[Math.floor(Math.random() * jobTypes.length)],
      postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      url: `https://example.com/jobs/${sector.toLowerCase().replace(/\s+/g, '-')}/${i}`,
      source: 'Mock Data',
      category: sector,
      tags: [keyword],
    });
  }

  console.log(`⚠️  Generated ${count} mock jobs for ${sector}`);
  return jobs;
}

/**
 * Fetch jobs from Adzuna API for a specific keyword
 */
async function fetchJobsFromAdzuna(keyword, category, page = 1, resultsPerPage = 10) {
  if (!ADZUNA_CONFIG.appId || !ADZUNA_CONFIG.appKey) {
    console.warn('⚠️  Adzuna API credentials not configured. Using mock data.');
    return null;
  }

  try {
    const params = {
      app_id: ADZUNA_CONFIG.appId,
      app_key: ADZUNA_CONFIG.appKey,
      what: keyword,
      results_per_page: resultsPerPage,
      page: page,
    };

    if (category) {
      params.category = category;
    }

    const url = `${ADZUNA_CONFIG.baseUrl}/${ADZUNA_CONFIG.country}/search/${page}`;

    console.log(`🔍 Fetching jobs from Adzuna: ${keyword} (category: ${category || 'any'})`);

    const response = await axios.get(url, {
      params,
      timeout: 10000,
    });

    if (response.data && response.data.results) {
      return response.data.results.map(normalizeAdzunaJob);
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching jobs from Adzuna for "${keyword}":`, error.message);
    return null;
  }
}

/**
 * Fetch jobs from Jooble API (alternative)
 */
async function fetchJobsFromJooble(keyword, location = 'India') {
  const JOOBLE_API_KEY = process.env.JOOBLE_API_KEY;

  if (!JOOBLE_API_KEY) {
    return null;
  }

  try {
    const response = await axios.post(
      `https://jooble.org/api/${JOOBLE_API_KEY}`,
      {
        keywords: keyword,
        location: location,
      },
      { timeout: 10000 }
    );

    if (response.data && response.data.jobs) {
      return response.data.jobs.map(job => ({
        id: job.id || `jooble-${Date.now()}-${Math.random()}`,
        title: job.title,
        company: job.company || 'Not specified',
        location: job.location || location,
        description: job.snippet || '',
        salary: 'Not disclosed',
        salaryMin: null,
        salaryMax: null,
        type: job.type || 'Full-time',
        postedDate: job.updated || new Date().toISOString(),
        url: job.link,
        source: 'Jooble',
        category: keyword,
        tags: [keyword],
      }));
    }

    return [];
  } catch (error) {
    console.error(`❌ Error fetching jobs from Jooble for "${keyword}":`, error.message);
    return null;
  }
}

/**
 * Deduplicate jobs by title and company
 */
function deduplicateJobs(jobs) {
  const seen = new Set();
  return jobs.filter(job => {
    const key = `${job.title.toLowerCase()}-${job.company.toLowerCase()}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Fetch jobs for a specific NCrF sector
 */
export async function fetchJobsForSector(sector, options = {}) {
  const { limit = 20, useMock = false } = options;

  const sectorConfig = SECTOR_TO_JOB_QUERY[sector];
  if (!sectorConfig) {
    throw new Error(`Unknown sector: ${sector}`);
  }

  // If mock is requested, return mock data
  if (useMock || (!ADZUNA_CONFIG.appId && !process.env.JOOBLE_API_KEY)) {
    return generateMockJobs(sector, limit);
  }

  try {
    const keywords = sectorConfig.keywords;
    const category = sectorConfig.category;

    // Fetch jobs for each keyword (limit keywords to avoid too many API calls)
    const keywordsToFetch = keywords.slice(0, 3); // Use top 3 keywords per sector

    const jobPromises = keywordsToFetch.map(async (keyword) => {
      // Try Adzuna first
      let jobs = await fetchJobsFromAdzuna(keyword, category, 1, Math.ceil(limit / keywordsToFetch.length));

      // If Adzuna fails, try Jooble
      if (!jobs || jobs.length === 0) {
        jobs = await fetchJobsFromJooble(keyword);
      }

      return jobs || [];
    });

    const results = await Promise.all(jobPromises);
    let allJobs = results.flat();

    // Deduplicate and limit
    allJobs = deduplicateJobs(allJobs);
    allJobs = shuffleArray(allJobs).slice(0, limit);

    // If we got very few jobs, supplement with mock data
    if (allJobs.length < 5) {
      console.log(`⚠️  Got only ${allJobs.length} jobs for ${sector}, supplementing with mock data`);
      const mockJobs = generateMockJobs(sector, Math.max(10, limit - allJobs.length));
      allJobs = [...allJobs, ...mockJobs].slice(0, limit);
    }

    console.log(`✅ Fetched ${allJobs.length} jobs for ${sector}`);
    return allJobs;

  } catch (error) {
    console.error(`❌ Error fetching jobs for ${sector}:`, error.message);
    // Fallback to mock data
    return generateMockJobs(sector, limit);
  }
}

/**
 * Fetch jobs for all sectors
 */
export async function fetchAllSectorJobs(options = {}) {
  const { useCache = true, limit = 10, useMock = false } = options;

  // Check cache
  if (useCache && jobsCache.data && Date.now() - jobsCache.timestamp < jobsCache.ttl) {
    console.log('📦 Returning jobs from cache');
    return jobsCache.data;
  }

  try {
    console.log('🔄 Fetching jobs for all sectors...');

    const sectors = Object.keys(SECTOR_TO_JOB_QUERY);

    // Fetch jobs for each sector (limit to avoid overwhelming API)
    // In production, you might want to batch this or fetch on-demand per sector
    const jobsBySector = {};

    // For initial load, fetch a subset of sectors
    const prioritySectors = [
      'IT/ITeS',
      'Healthcare',
      'Education Training & Research',
      'BFSI',
      'Construction',
      'Automotive',
      'Tourism & Hospitality',
      'Capital Goods & Manufacturing'
    ];

    for (const sector of prioritySectors) {
      try {
        jobsBySector[sector] = await fetchJobsForSector(sector, { limit: limit, useMock });
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Failed to fetch jobs for ${sector}:`, error.message);
        jobsBySector[sector] = generateMockJobs(sector, limit);
      }
    }

    // Add remaining sectors with mock data (or fetch on demand in future)
    const remainingSectors = sectors.filter(s => !prioritySectors.includes(s));
    for (const sector of remainingSectors) {
      jobsBySector[sector] = []; // Empty for now, will fetch on demand
    }

    const result = {
      jobsBySector,
      sectors,
      timestamp: new Date().toISOString(),
    };

    // Update cache
    jobsCache = {
      data: result,
      timestamp: Date.now(),
      ttl: jobsCache.ttl,
    };

    console.log('✅ Successfully fetched jobs for all sectors');
    return result;

  } catch (error) {
    console.error('❌ Error fetching all sector jobs:', error.message);
    console.log('🔄 Falling back to mock data for all sectors');

    // Generate mock data for priority sectors as fallback
    const prioritySectors = [
      'IT/ITeS',
      'Healthcare',
      'Education Training & Research',
      'BFSI',
      'Construction',
      'Automotive',
      'Tourism & Hospitality',
      'Capital Goods & Manufacturing'
    ];

    const jobsBySector = {};
    for (const sector of prioritySectors) {
      jobsBySector[sector] = generateMockJobs(sector, limit);
    }

    const sectors = Object.keys(SECTOR_TO_JOB_QUERY);
    const remainingSectors = sectors.filter(s => !prioritySectors.includes(s));
    for (const sector of remainingSectors) {
      jobsBySector[sector] = [];
    }

    return {
      jobsBySector,
      sectors,
      timestamp: new Date().toISOString(),
      usingMockData: true,
    };
  }
}

/**
 * Search jobs across all sectors by keyword
 */
export async function searchJobs(query, options = {}) {
  const { limit = 20 } = options;

  if (!query || query.trim().length === 0) {
    throw new Error('Search query is required');
  }

  try {
    console.log(`🔍 Searching jobs for: "${query}"`);

    // Try Adzuna first
    let jobs = await fetchJobsFromAdzuna(query, null, 1, limit);

    // If Adzuna fails, try Jooble
    if (!jobs || jobs.length === 0) {
      jobs = await fetchJobsFromJooble(query);
    }

    if (!jobs || jobs.length === 0) {
      console.log(`⚠️  No jobs found for "${query}", using mock data`);
      // Generate some mock jobs based on query
      return Array.from({ length: Math.min(10, limit) }, (_, i) => ({
        id: `search-mock-${i}`,
        title: `${query} Position`,
        company: ['TCS', 'Infosys', 'Wipro', 'Accenture'][i % 4],
        location: ['Bangalore', 'Mumbai', 'Delhi', 'Hyderabad'][i % 4],
        description: `Exciting opportunity for ${query} professionals.`,
        salary: 'Competitive',
        salaryMin: null,
        salaryMax: null,
        type: 'Full-time',
        postedDate: new Date().toISOString(),
        url: '#',
        source: 'Mock',
        category: 'Other',
        tags: [query],
      }));
    }

    return jobs.slice(0, limit);

  } catch (error) {
    console.error(`❌ Error searching jobs for "${query}":`, error.message);
    throw error;
  }
}

/**
 * Get list of all available sectors
 */
export function getAllSectors() {
  return Object.keys(SECTOR_TO_JOB_QUERY);
}

/**
 * Get sector configuration
 */
export function getSectorConfig(sector) {
  return SECTOR_TO_JOB_QUERY[sector] || null;
}
