import axios from 'axios';
import * as cheerio from 'cheerio';

// Configure axios defaults for web scraping
const axiosConfig = {
  timeout: 30000, // 30 second timeout
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Accept 4xx errors to handle them gracefully
  },
};

// Helper to generate random verification code (letters only)
export const generateCode = () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  return code;
};

// ===== CODEFORCES (API-based verification) =====
export const verifyCodeforces = async (handle, verificationCode) => {
  try {
    if (!handle || typeof handle !== 'string' || handle.trim() === '') {
      return { success: false, message: 'Invalid handle provided' };
    }
    
    // Fetch user info from API for stats
    const userResponse = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`, {
      timeout: 10000,
    });
    
    if (userResponse.data.status !== 'OK') {
      return { success: false, message: userResponse.data.comment || 'User not found' };
    }
    
    if (!userResponse.data.result || userResponse.data.result.length === 0) {
      return { success: false, message: 'User not found on Codeforces' };
    }
    
    const user = userResponse.data.result[0];
    
    // If verification code is provided, check for it in API fields
    if (verificationCode) {
      const firstName = user.firstName || '';
      const lastName = user.lastName || '';
      const organization = user.organization || '';
      
      console.log(`[Codeforces] Checking for code: ${verificationCode}`);
      console.log(`[Codeforces] First Name: "${firstName}"`);
      console.log(`[Codeforces] Last Name: "${lastName}"`);
      console.log(`[Codeforces] Organization: "${organization}"`);
      
      // Check if verification code exists in any of these fields
      const combinedFields = `${firstName} ${lastName} ${organization}`;
      if (!combinedFields.includes(verificationCode)) {
        console.log(`[Codeforces] Code not found in profile fields`);
        return { 
          success: false, 
          message: 'Verification code not found. Please add it to your First Name, Last Name, or Organization field in Codeforces settings.' 
        };
      }
      
      console.log(`[Codeforces] Verification code found!`);
    }
    
    // Fetch submission history to calculate active days and contests
    let contestsAttended = 0;
    let activeDays = 0;
    try {
      const submissionsResponse = await axios.get(`https://codeforces.com/api/user.status?handle=${handle}&from=1&count=10000`, {
        timeout: 10000,
      });
      if (submissionsResponse.data.status === 'OK') {
        const submissions = submissionsResponse.data.result;
        
        // Calculate unique contest IDs
        const uniqueContests = new Set();
        const uniqueDays = new Set();
        
        submissions.forEach(submission => {
          if (submission.author.participantType === 'CONTESTANT') {
            uniqueContests.add(submission.contestId);
          }
          // Track unique days of activity (using timestamp)
          const date = new Date(submission.creationTimeSeconds * 1000).toDateString();
          uniqueDays.add(date);
        });
        
        contestsAttended = uniqueContests.size;
        activeDays = uniqueDays.size;
      }
    } catch (error) {
      console.log('[Codeforces] Could not fetch submissions:', error.message);
    }
    
    return {
      success: true,
      stats: {
        rating: user.rating || 0,
        maxRating: user.maxRating || 0,
        rank: user.rank || 'unrated',
        maxRank: user.maxRank || 'unrated',
        contribution: user.contribution || 0,
        contestsAttended,
        activeDays,
      },
    };
  } catch (error) {
    console.error('[Codeforces] Verification error:', error.message);
    if (error.response?.data?.comment) {
      return { success: false, message: error.response.data.comment };
    }
    return { success: false, message: 'Invalid handle or Codeforces API error. Please check your handle and try again.' };
  }
};

// ===== LEETCODE (GraphQL API) =====
export const fetchLeetCodeStats = async (handle) => {
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            reputation
          }
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          userCalendar {
            streak
            totalActiveDays
          }
        }
      }
    `;

    const response = await axios.post(
      'https://leetcode.com/graphql',
      {
        query,
        variables: { username: handle },
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data.data.matchedUser;
    if (!data) {
      return { success: false, message: 'User not found' };
    }

    const submissions = data.submitStats.acSubmissionNum;
    return {
      success: true,
      stats: {
        totalSolved: submissions.find(s => s.difficulty === 'All')?.count || 0,
        easySolved: submissions.find(s => s.difficulty === 'Easy')?.count || 0,
        mediumSolved: submissions.find(s => s.difficulty === 'Medium')?.count || 0,
        hardSolved: submissions.find(s => s.difficulty === 'Hard')?.count || 0,
        ranking: data.profile.ranking || 0,
        reputation: data.profile.reputation || 0,
        streak: data.userCalendar?.streak || 0,
        activeDays: data.userCalendar?.totalActiveDays || 0,
      },
    };
  } catch (error) {
    return { success: false, message: 'Failed to fetch LeetCode stats' };
  }
};

export const verifyLeetCodeBio = async (handle, verificationCode) => {
  try {
    console.log(`\n[LeetCode] Verifying handle: ${handle}`);
    console.log(`[LeetCode] Looking for code: ${verificationCode}`);
    
    // LeetCode GraphQL API to get user profile
    const graphqlQuery = {
      query: `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            username
            profile {
              realName
              aboutMe
              userAvatar
              reputation
            }
          }
        }
      `,
      variables: { username: handle }
    };

    const response = await axios.post('https://leetcode.com/graphql', graphqlQuery, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    });

    const userData = response.data?.data?.matchedUser;
    if (!userData) {
      return { success: false, message: 'LeetCode profile not found' };
    }

    // Check if verification code is in username, realName, or aboutMe
    const username = userData.username || '';
    const realName = userData.profile?.realName || '';
    const aboutMe = userData.profile?.aboutMe || '';
    console.log(`[LeetCode] GraphQL - Username: ${username}`);
    console.log(`[LeetCode] GraphQL - RealName: ${realName}`);
    console.log(`[LeetCode] GraphQL - AboutMe: ${aboutMe}`);
    
    // Fallback: fetch public profile HTML and include full page text
    let pageText = '';
    try {
      const profileUrl = `https://leetcode.com/${handle}`;
      console.log(`[LeetCode] Fetching HTML from: ${profileUrl}`);
      const pageResp = await axios.get(profileUrl);
      const $page = cheerio.load(pageResp.data);
      pageText = $page.root().text() || '';
      console.log(`[LeetCode] Page text length: ${pageText.length} characters`);
      console.log(`[LeetCode] Page text preview: ${pageText.substring(0, 200)}...`);
    } catch (e) {
      console.log(`[LeetCode] Failed to fetch HTML: ${e.message}`);
      pageText = '';
    }
    const combinedText = (username + ' ' + realName + ' ' + aboutMe + ' ' + pageText).trim();
    console.log(`[LeetCode] Combined text length: ${combinedText.length} characters`);
    console.log(`[LeetCode] Code found: ${combinedText.includes(verificationCode)}`);

    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in username, profile name, or about me section' };
    }

    // Fetch stats after verification
    const stats = await fetchLeetCodeStats(handle);
    return { success: true, stats: stats.stats || {} };
    
  } catch (error) {
    console.error('LeetCode verification error:', error.message);
    return { 
      success: false, 
      message: error.response?.data?.errors?.[0]?.message || 'Failed to verify LeetCode profile. Please try again.'
    };
  }
};

// ===== GEEKSFORGEEKS =====
export const verifyGeeksForGeeks = async (handle, verificationCode) => {
  try {
    const url = `https://auth.geeksforgeeks.org/user/${handle}/`;
    console.log(`\n[GeeksForGeeks] Verifying handle: ${handle}`);
    console.log(`[GeeksForGeeks] Fetching from: ${url}`);
    console.log(`[GeeksForGeeks] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on GeeksForGeeks' };
    }
    
    if (response.status !== 200) {
      console.error(`[GeeksForGeeks] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check display name, name, and bio for verification code
    const displayName = $('.profilePicSection_head_userHandleAndFollowBtnContainer_userHandle__IELT6').text() || '';
    const profileName = $('.profile_name').text() || '';
    const bio = $('.profile_desc').text() || $('.profile-description').text() || '';
    console.log(`[GeeksForGeeks] Display Name: ${displayName}`);
    console.log(`[GeeksForGeeks] Profile Name: ${profileName}`);
    console.log(`[GeeksForGeeks] Bio: ${bio}`);
    
    // include whole page text as fallback
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[GeeksForGeeks] Page text length: ${pageText.length} characters`);
    console.log(`[GeeksForGeeks] Page text preview: ${pageText.substring(0, 200)}...`);
    
    const combinedText = (displayName + ' ' + profileName + ' ' + bio + ' ' + pageText).trim();
    console.log(`[GeeksForGeeks] Combined text length: ${combinedText.length} characters`);
    console.log(`[GeeksForGeeks] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in display name, name, or about' };
    }

    // Extract stats
    const problemsSolved = parseInt($('.score_card_value').first().text()) || 0;
    const codingScore = parseInt($('.score_card_value').eq(1).text()) || 0;
    
    return {
      success: true,
      stats: {
        problemsSolved,
        codingScore,
        institute: $('.edu_txt').text().trim(),
        languages: [],
      },
    };
  } catch (error) {
    console.error(`[HackerEarth] Error verifying profile:`, error.message);
    console.error(`[HackerEarth] Error stack:`, error.stack);
    return { success: false, message: `Failed to verify HackerEarth profile: ${error.message}` };
  }
};

// ===== TOPCODER =====

// ===== CODECHEF =====
export const verifyCodeChef = async (handle, verificationCode) => {
  try {
    const url = `https://www.codechef.com/users/${handle}`;
    console.log(`\n[CodeChef] Verifying handle: ${handle}`);
    console.log(`[CodeChef] Fetching from: ${url}`);
    console.log(`[CodeChef] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on CodeChef' };
    }
    
    if (response.status !== 200) {
      console.error(`[CodeChef] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check first name, bio, and about
    const firstName = $('.user-details-name').first().text() || '';
    const bio = $('.user-details-bio').text() || '';
    console.log(`[CodeChef] First Name: ${firstName}`);
    console.log(`[CodeChef] Bio: ${bio}`);
    
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[CodeChef] Page text length: ${pageText.length} characters`);
    console.log(`[CodeChef] Page text preview: ${pageText.substring(0, 200)}...`);
    
    const combinedText = (firstName + ' ' + bio + ' ' + pageText).trim();
    console.log(`[CodeChef] Combined text length: ${combinedText.length} characters`);
    console.log(`[CodeChef] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in first name, bio, or about' };
    }

    const rating = parseInt($('.rating-number').text()) || 0;
    const stars = $('.rating-stars').text().trim() || 'unrated';
    
    // Try to extract contests attended and active days
    let contestsAttended = 0;
    let activeDays = 0;
    
    // CodeChef shows contests in various places, try to extract
    $('.rating-data-section').each((i, elem) => {
      const text = $(elem).text();
      if (text.includes('Contests')) {
        const match = text.match(/(\d+)/);
        if (match) contestsAttended = parseInt(match[1]);
      }
    });
    
    // Look for contest/activity count in profile sections
    $('.profile-stats-item, .contest-participated-count').each((i, elem) => {
      const label = $(elem).find('.label, .stats-label').text().toLowerCase();
      const value = parseInt($(elem).find('.value, .stats-value').text());
      
      if (label.includes('contest') && value) {
        contestsAttended = value;
      }
      if (label.includes('active') && value) {
        activeDays = value;
      }
    });
    
    return {
      success: true,
      stats: {
        rating,
        stars,
        globalRank: 0,
        countryRank: 0,
        fullySolved: 0,
        partiallySolved: 0,
        contestsAttended,
        activeDays,
      },
    };
  } catch (error) {
    console.error(`[CodeChef] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify CodeChef profile: ${error.message}` };
  }
};

// ===== GITHUB (OAuth or Bio) =====
export const verifyGitHubBio = async (handle, verificationCode) => {
  try {
    const apiUrl = `https://api.github.com/users/${handle}`;
    console.log(`\n[GitHub] Verifying handle: ${handle}`);
    console.log(`[GitHub] Fetching API from: ${apiUrl}`);
    console.log(`[GitHub] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(apiUrl);
    const user = response.data;
    
    // Check both bio and name fields
    const bio = user.bio || '';
    const name = user.name || '';
    const login = user.login || '';
    console.log(`[GitHub] API - Name: ${name}`);
    console.log(`[GitHub] API - Bio: ${bio}`);
    console.log(`[GitHub] API - Login: ${login}`);
    
    // Fallback: fetch public profile HTML and include full page text
    let pageText = '';
    try {
      const profileUrl = `https://github.com/${handle}`;
      console.log(`[GitHub] Fetching HTML from: ${profileUrl}`);
      const profilePage = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      const $page = cheerio.load(profilePage.data);
      pageText = $page.root().text() || '';
      console.log(`[GitHub] Page text length: ${pageText.length} characters`);
      console.log(`[GitHub] Page text preview: ${pageText.substring(0, 200)}...`);
    } catch (e) {
      console.log(`[GitHub] Failed to fetch HTML: ${e.message}`);
      pageText = '';
    }
    const combinedText = (bio + ' ' + name + ' ' + login + ' ' + pageText).trim();
    console.log(`[GitHub] Combined text length: ${combinedText.length} characters`);
    console.log(`[GitHub] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in username, name, or bio' };
    }

    // Try to fetch contributions from GitHub profile page
    let contributions = 0;
    try {
      const profileUrl = `https://github.com/${handle}`;
      const profilePage = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      const $profile = cheerio.load(profilePage.data);
      
      // GitHub shows contribution count in various formats
      // Look for "X contributions in the last year"
      const contributionText = $profile('.js-yearly-contributions h2').text();
      const match = contributionText.match(/([\d,]+)\s+contribution/);
      if (match) {
        contributions = parseInt(match[1].replace(/,/g, ''));
      }
    } catch (error) {
      console.log('[GitHub] Could not fetch contribution count:', error.message);
    }

    return {
      success: true,
      stats: {
        repos: user.public_repos || 0,
        followers: user.followers || 0,
        following: user.following || 0,
        contributions,
        topLanguages: [],
      },
    };
  } catch (error) {
    console.error(`[InterviewBit] Error verifying profile:`, error.message);
    console.error(`[InterviewBit] Error stack:`, error.stack);
    return { success: false, message: `Failed to verify InterviewBit profile: ${error.message}` };
  }
};

// ===== HACKERRANK =====
export const verifyHackerRank = async (handle, verificationCode) => {
  try {
    if (!verificationCode) {
      return { success: false, message: 'Verification code is required' };
    }

    const url = `https://www.hackerrank.com/${handle}`;
    console.log(`\n[HackerRank] Verifying handle: ${handle}`);
    console.log(`[HackerRank] Fetching from: ${url}`);
    console.log(`[HackerRank] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, {
      ...axiosConfig,
      timeout: 15000, // 15 second timeout
    });
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on HackerRank. Please check your handle and try again.' };
    }
    
    if (response.status !== 200) {
      console.error(`[HackerRank] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status}). Please try again later.` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check multiple locations for verification code
    const pageText = $.root().text() || $('body').text() || '';
    const firstName = $('.profile-name').text().trim();
    const bio = $('.profile-bio').text().trim();
    const about = $('.profile-about').text().trim();
    
    const combinedText = `${pageText} ${firstName} ${bio} ${about}`.toLowerCase();
    const codeToFind = verificationCode.toLowerCase();
    
    console.log(`[HackerRank] Page text length: ${pageText.length} characters`);
    console.log(`[HackerRank] First name: ${firstName}`);
    console.log(`[HackerRank] Bio: ${bio}`);
    console.log(`[HackerRank] Code found: ${combinedText.includes(codeToFind)}`);
    
    if (!combinedText.includes(codeToFind)) {
      return { 
        success: false, 
        message: 'Verification code not found in your profile. Please add the code to your HackerRank profile (First Name, Bio, or About section) and try again.' 
      };
    }

    return {
      success: true,
      stats: {
        badges: [],
        problemsSolved: 0,
      },
    };
  } catch (error) {
    console.error(`[HackerRank] Error verifying profile:`, error.message);
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return { success: false, message: 'Request timed out. HackerRank server is not responding. Please try again later.' };
    }
    return { success: false, message: `Failed to verify HackerRank profile: ${error.message}` };
  }
};

// ===== ATCODER =====
export const verifyAtCoder = async (handle, verificationCode) => {
  try {
    const url = `https://atcoder.jp/users/${handle}`;
    console.log(`\n[AtCoder] Verifying handle: ${handle}`);
    console.log(`[AtCoder] Fetching from: ${url}`);
    console.log(`[AtCoder] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on AtCoder' };
    }
    
    if (response.status !== 200) {
      console.error(`[AtCoder] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check name, affiliation, and bio fields
    const name = $('.username').text() || $('h2').first().text() || '';
    const affiliation = $('th:contains("Affiliation")').next('td').text().trim() || '';
    const bio = $('.user-bio').text() || '';
    console.log(`[AtCoder] Name: ${name}`);
    console.log(`[AtCoder] Affiliation: ${affiliation}`);
    console.log(`[AtCoder] Bio: ${bio}`);
    
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[AtCoder] Page text length: ${pageText.length} characters`);
    console.log(`[AtCoder] Page text preview: ${pageText.substring(0, 200)}...`);
    
    const combinedText = (name + ' ' + affiliation + ' ' + bio + ' ' + pageText).trim();
    console.log(`[AtCoder] Combined text length: ${combinedText.length} characters`);
    console.log(`[AtCoder] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in name, affiliation, or bio' };
    }

    const rating = parseInt($('.user-rating').text()) || 0;
    const rank = $('.user-rank').text().trim() || 'unrated';
    
    return {
      success: true,
      stats: {
        rating,
        highestRating: rating,
        rank,
      },
    };
  } catch (error) {
    console.error(`[AtCoder] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify AtCoder profile: ${error.message}` };
  }
};

// ===== GITLAB =====
export const verifyGitLab = async (handle, verificationCode) => {
  try {
    const apiUrl = `https://gitlab.com/api/v4/users?username=${handle}`;
    console.log(`\n[GitLab] Verifying handle: ${handle}`);
    console.log(`[GitLab] Fetching API from: ${apiUrl}`);
    console.log(`[GitLab] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(apiUrl);
    const users = response.data;
    
    if (!users || users.length === 0) {
      return { success: false, message: 'GitLab user not found' };
    }
    
    const user = users[0];
    
    // Check name, bio, and about fields from API
    const name = user.name || '';
    const bio = user.bio || '';
    console.log(`[GitLab] API - Name: ${name}`);
    console.log(`[GitLab] API - Bio: ${bio}`);
    
    // Fallback: fetch public profile HTML
    let pageText = '';
    try {
      const profileUrl = `https://gitlab.com/${handle}`;
      console.log(`[GitLab] Fetching HTML from: ${profileUrl}`);
      const profilePage = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      const $page = cheerio.load(profilePage.data);
      pageText = $page.root().text() || '';
      console.log(`[GitLab] Page text length: ${pageText.length} characters`);
      console.log(`[GitLab] Page text preview: ${pageText.substring(0, 200)}...`);
    } catch (e) {
      console.log(`[GitLab] Failed to fetch HTML: ${e.message}`);
      pageText = '';
    }
    
    const combinedText = (name + ' ' + bio + ' ' + pageText).trim();
    console.log(`[GitLab] Combined text length: ${combinedText.length} characters`);
    console.log(`[GitLab] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        repos: 0, // GitLab API v4 requires auth for project counts
        followers: 0,
        following: 0,
      },
    };
  } catch (error) {
    return { success: false, message: 'Failed to verify GitLab profile' };
  }
};

// ===== CODESTUDIO (Naukri Code360) =====
export const verifyCodeStudio = async (handle, verificationCode) => {
  try {
    const url = `https://www.naukri.com/code360/profile/${handle}`;
    console.log(`\n[CodeStudio] Verifying handle: ${handle}`);
    console.log(`[CodeStudio] Fetching from: ${url}`);
    console.log(`[CodeStudio] Looking for code: ${verificationCode}`);
    
    // Handle can be username or UUID format
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on CodeStudio' };
    }
    
    if (response.status !== 200) {
      console.error(`[CodeStudio] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check full page text - Code360 has dynamic content
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[CodeStudio] Page text length: ${pageText.length} characters`);
    console.log(`[CodeStudio] Page text preview: ${pageText.substring(0, 200)}...`);
    console.log(`[CodeStudio] Code found: ${pageText.includes(verificationCode)}`);
    
    if (!pageText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        score: 0,
        problemsSolved: 0,
        streak: 0,
        contestRank: 0,
      },
    };
  } catch (error) {
    console.error(`[CodeStudio] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify CodeStudio profile: ${error.message}` };
  }
};

// ===== INTERVIEWBIT =====
export const verifyInterviewBit = async (handle, verificationCode) => {
  try {
    const url = `https://www.interviewbit.com/profile/${handle}`;
    console.log(`\n[InterviewBit] Verifying handle: ${handle}`);
    console.log(`[InterviewBit] Fetching from: ${url}`);
    console.log(`[InterviewBit] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on InterviewBit' };
    }
    
    if (response.status !== 200) {
      console.error(`[InterviewBit] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check full page text - InterviewBit uses dynamic rendering
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[InterviewBit] Page text length: ${pageText.length} characters`);
    console.log(`[InterviewBit] Page text preview: ${pageText.substring(0, 200)}...`);
    console.log(`[InterviewBit] Code found: ${pageText.includes(verificationCode)}`);
    
    if (!pageText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        xp: 0,
        level: 0,
        problemsSolved: 0,
      },
    };
  } catch (error) {
    console.error(`[InterviewBit] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify InterviewBit profile: ${error.message}` };
  }
};

// ===== HACKEREARTH =====
export const verifyHackerEarth = async (handle, verificationCode) => {
  try {
    const url = `https://www.hackerearth.com/@${handle}`;
    console.log(`\n[HackerEarth] Verifying handle: ${handle}`);
    console.log(`[HackerEarth] Fetching from: ${url}`);
    console.log(`[HackerEarth] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on HackerEarth' };
    }
    
    if (response.status !== 200) {
      console.error(`[HackerEarth] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check full page text
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[HackerEarth] Page text length: ${pageText.length} characters`);
    console.log(`[HackerEarth] Page text preview: ${pageText.substring(0, 200)}...`);
    console.log(`[HackerEarth] Code found: ${pageText.includes(verificationCode)}`);
    
    if (!pageText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        rating: 0,
        problemsSolved: 0,
      },
    };
  } catch (error) {
    console.error(`[HackerEarth] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify HackerEarth profile: ${error.message}` };
  }
};

// ===== TOPCODER =====
export const verifyTopCoder = async (handle, verificationCode) => {
  try {
    const url = `https://www.topcoder.com/members/${handle}`;
    console.log(`\n[TopCoder] Verifying handle: ${handle}`);
    console.log(`[TopCoder] Fetching from: ${url}`);
    console.log(`[TopCoder] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(url, axiosConfig);
    
    if (response.status === 404) {
      return { success: false, message: 'User not found on TopCoder' };
    }
    
    if (response.status !== 200) {
      console.error(`[TopCoder] HTTP ${response.status} received`);
      return { success: false, message: `Failed to fetch profile (HTTP ${response.status})` };
    }
    
    const $ = cheerio.load(response.data);
    
    // Check full page text
    const pageText = $.root().text() || $('body').text() || '';
    console.log(`[TopCoder] Page text length: ${pageText.length} characters`);
    console.log(`[TopCoder] Page text preview: ${pageText.substring(0, 200)}...`);
    console.log(`[TopCoder] Code found: ${pageText.includes(verificationCode)}`);
    
    if (!pageText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        rating: 0,
        rank: '',
      },
    };
  } catch (error) {
    console.error(`[TopCoder] Error verifying profile:`, error.message);
    return { success: false, message: `Failed to verify TopCoder profile: ${error.message}` };
  }
};

// ===== BITBUCKET =====
export const verifyBitbucket = async (handle, verificationCode) => {
  try {
    const apiUrl = `https://api.bitbucket.org/2.0/users/${handle}`;
    console.log(`\n[Bitbucket] Verifying handle: ${handle}`);
    console.log(`[Bitbucket] Fetching API from: ${apiUrl}`);
    console.log(`[Bitbucket] Looking for code: ${verificationCode}`);
    
    const response = await axios.get(apiUrl);
    const user = response.data;
    
    // Check name and bio fields
    const name = user.display_name || '';
    const bio = user.bio || '';
    console.log(`[Bitbucket] API - Display Name: ${name}`);
    console.log(`[Bitbucket] API - Bio: ${bio}`);
    
    // Fallback: fetch public profile HTML
    let pageText = '';
    try {
      const profileUrl = `https://bitbucket.org/${handle}`;
      console.log(`[Bitbucket] Fetching HTML from: ${profileUrl}`);
      const profilePage = await axios.get(profileUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      });
      const $page = cheerio.load(profilePage.data);
      pageText = $page.root().text() || '';
      console.log(`[Bitbucket] Page text length: ${pageText.length} characters`);
      console.log(`[Bitbucket] Page text preview: ${pageText.substring(0, 200)}...`);
    } catch (e) {
      console.log(`[Bitbucket] Failed to fetch HTML: ${e.message}`);
      pageText = '';
    }
    
    const combinedText = (name + ' ' + bio + ' ' + pageText).trim();
    console.log(`[Bitbucket] Combined text length: ${combinedText.length} characters`);
    console.log(`[Bitbucket] Code found: ${combinedText.includes(verificationCode)}`);
    
    if (!combinedText.includes(verificationCode)) {
      return { success: false, message: 'Verification code not found in profile page' };
    }

    return {
      success: true,
      stats: {
        repos: 0,
        followers: 0,
        following: 0,
      },
    };
  } catch (error) {
    return { success: false, message: 'Failed to verify Bitbucket profile' };
  }
};

// Export all verifiers
export const platformVerifiers = {
  leetcode: verifyLeetCodeBio,
  geeksforgeeks: verifyGeeksForGeeks,
  codechef: verifyCodeChef,
  codeforces: verifyCodeforces,
  github: verifyGitHubBio,
  hackerrank: verifyHackerRank,
  atcoder: verifyAtCoder,
  gitlab: verifyGitLab,
  codestudio: verifyCodeStudio,
  interviewbit: verifyInterviewBit,
  hackerearth: verifyHackerEarth,
  topcoder: verifyTopCoder,
  bitbucket: verifyBitbucket,
};
