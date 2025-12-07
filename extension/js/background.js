importScripts('../config.js');

let WHITELISTED_DOMAINS = [];
let PLATFORMS_DATA = null;

// Load whitelisted platforms on startup
async function loadPlatforms() {
  try {
    const response = await fetch(chrome.runtime.getURL('platforms.json'));
    PLATFORMS_DATA = await response.json();
    WHITELISTED_DOMAINS = PLATFORMS_DATA.platforms.flatMap(p => p.domains);
    console.log(`✅ Loaded ${PLATFORMS_DATA.platforms.length} platforms with ${WHITELISTED_DOMAINS.length} domains`);
  } catch (error) {
    console.error('❌ Failed to load platforms:', error);
    // Fallback
    WHITELISTED_DOMAINS = ['coursera.org', 'udemy.com', 'edx.org', 'linkedin.com'];
  }
}

loadPlatforms();

// Check if domain is whitelisted
function isWhitelistedDomain(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return WHITELISTED_DOMAINS.some(domain => {
      const d = domain.toLowerCase();
      return hostname === d || hostname === `www.${d}` || hostname.endsWith(`.${d}`);
    });
  } catch {
    return false;
  }
}

// Get platform info for domain
function getPlatformInfo(url) {
  if (!PLATFORMS_DATA) return null;

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return PLATFORMS_DATA.platforms.find(p =>
      p.domains.some(d => {
        const domain = d.toLowerCase();
        return hostname === domain || hostname === `www.${domain}` || hostname.endsWith(`.${domain}`);
      })
    );
  } catch {
    return null;
  }
}

// --- LinkedIn fallback helper ---
function checkLinkedIn(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();

    if (!host.includes('linkedin.com')) return null; // not LinkedIn — let other logic handle it

    // Allow only LinkedIn Learning pages
    if (url.includes('linkedin.com/learning')) {
      return {
        allowed: true,
        platform: { name: 'LinkedIn Learning', id: 'linkedin_learning', category: 'learning' },
        reason: null
      };
    }

    // Block all other linkedin.com pages for verification
    return {
      allowed: false,
      platform: null,
      reason: 'LinkedIn profile certificates are not verifiable. Only LinkedIn Learning pages (linkedin.com/learning) are supported.'
    };
  } catch (e) {
    // malformed URL -> treat as non-LinkedIn
    return null;
  }
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // ------------- checkDomain -------------
  if (request.action === 'checkDomain') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        sendResponse({ isWhitelisted: false, domain: null, platform: null, error: 'No active tab' });
        return;
      }

      const url = tabs[0].url || request.url || '';
      const hostname = (() => { try { return new URL(url).hostname } catch { return null } })();

      // LinkedIn special-case: short-circuit if it's linkedin.com
      const linkedInResult = (typeof checkLinkedIn === 'function') ? checkLinkedIn(url) : null;
      if (linkedInResult !== null) {
        sendResponse({
          isWhitelisted: !!linkedInResult.allowed,
          domain: hostname,
          platform: linkedInResult.platform || null,
          error: linkedInResult.reason || null
        });
        return;
      }

      // Fallback to existing whitelist logic
      try {
        const isWhitelisted = (typeof isWhitelistedDomain === 'function') ? isWhitelistedDomain(url) : false;
        const platform = (isWhitelisted && typeof getPlatformInfo === 'function') ? getPlatformInfo(url) : null;

        sendResponse({
          isWhitelisted,
          domain: hostname,
          platform: platform ? {
            name: platform.name,
            category: platform.category,
            id: platform.id
          } : null,
          error: isWhitelisted ? null : null
        });
      } catch (err) {
        console.error('Error during checkDomain:', err);
        sendResponse({ isWhitelisted: false, domain: hostname, platform: null, error: 'Domain check failed' });
      }
    });

    return true; // keep channel open for async sendResponse
  }

  // ------------- verifyCertificate (proxy to backend) -------------
  if (request.action === 'verifyCertificate') {
    handleVerification(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => {
        console.error('handleVerification error:', error);
        sendResponse({ success: false, error: error.message || 'Verification failed' });
      });
    return true;
  }

  // other actions can be handled below...
});


// Handle certificate verification
async function handleVerification(data) {
  try {
    // Get auth token
    const storage = await chrome.storage.local.get(['cv_auth_token']);
    const authToken = storage.cv_auth_token;

    if (!authToken) {
      throw new Error('Not authenticated. Please login first.');
    }

    // Prepare image data
    let imageData = null;

    if (data.fileData?.base64) {
      imageData = data.fileData.base64;
    } else if (data.imageUrl) {
      // Fetch and convert to base64
      const response = await fetch(data.imageUrl);
      if (!response.ok) throw new Error(`Failed to fetch image: ${response.status}`);

      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      imageData = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
    } else {
      throw new Error('No image data provided');
    }

    // Call backend API
    const response = await fetch(CONFIG.url(CONFIG.API.VERIFY), {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageData,
        sourceUrl: data.pageUrl || 'https://unknown.com',
        imageType: 'base64'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API error: ${response.status}`);
    }

    const result = await response.json();
    return result.data;

  } catch (error) {
    console.error('❌ Verification error:', error);
    throw error;
  }
}

console.log('✅ CredVerify background script loaded');

