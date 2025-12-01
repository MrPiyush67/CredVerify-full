// Background script for secure API communication
// This keeps the API endpoint hidden from the popup

// Whitelisted domains - loaded from platforms.json
let WHITELISTED_DOMAINS = [];
let PLATFORMS_DATA = null;

// Load platforms.json on extension startup
async function loadPlatforms() {
  try {
    const response = await fetch(chrome.runtime.getURL('platforms.json'));
    PLATFORMS_DATA = await response.json();

    // Extract all domains from all platforms
    WHITELISTED_DOMAINS = PLATFORMS_DATA.platforms.flatMap(platform => platform.domains);

    console.log(`✅ Loaded ${PLATFORMS_DATA.platforms.length} platforms with ${WHITELISTED_DOMAINS.length} domains`);
    console.log('📋 Sample domains:', WHITELISTED_DOMAINS.slice(0, 10));
  } catch (error) {
    console.error('❌ Failed to load platforms.json:', error);
    // Fallback to basic whitelist
    WHITELISTED_DOMAINS = [
      'coursera.org',
      'udemy.com',
      'edx.org',
      'linkedin.com',
    ];
  }
}

// Initialize on startup
loadPlatforms();

// Check if domain is whitelisted
const isWhitelistedDomain = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    console.log('🔍 Checking domain:', hostname);

    const isWhitelisted = WHITELISTED_DOMAINS.some(domain => {
      const domainLower = domain.toLowerCase();
      return (
        hostname === domainLower ||
        hostname === `www.${domainLower}` ||
        hostname.endsWith(`.${domainLower}`)
      );
    });

    console.log('✅ Is whitelisted?', isWhitelisted);

    // Find platform info if whitelisted
    if (isWhitelisted && PLATFORMS_DATA) {
      const platform = PLATFORMS_DATA.platforms.find(p =>
        p.domains.some(d =>
          hostname === d.toLowerCase() ||
          hostname === `www.${d.toLowerCase()}` ||
          hostname.endsWith(`.${d.toLowerCase()}`)
        )
      );
      if (platform) {
        console.log('📍 Platform:', platform.name, `(${platform.category})`);
      }
    }

    return isWhitelisted;
  } catch (error) {
    console.error('❌ Domain check error:', error);
    return false;
  }
};

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkDomain') {
    // Check if current domain is whitelisted
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      if (!currentTab) {
        sendResponse({ isWhitelisted: false, domain: null });
        return;
      }

      const isWhitelisted = isWhitelistedDomain(currentTab.url);
      const hostname = new URL(currentTab.url).hostname;

      // Find platform details if whitelisted
      let platformInfo = null;
      if (isWhitelisted && PLATFORMS_DATA) {
        platformInfo = PLATFORMS_DATA.platforms.find(p =>
          p.domains.some(d =>
            hostname.toLowerCase() === d.toLowerCase() ||
            hostname.toLowerCase() === `www.${d.toLowerCase()}` ||
            hostname.toLowerCase().endsWith(`.${d.toLowerCase()}`)
          )
        );
      }

      sendResponse({
        isWhitelisted,
        domain: hostname,
        platform: platformInfo ? {
          name: platformInfo.name,
          category: platformInfo.category,
          id: platformInfo.id
        } : null
      });
    });
    return true; // Keep channel open for async response
  }

  if (request.action === 'getPlatforms') {
    // Return full platforms list
    sendResponse({
      success: true,
      platforms: PLATFORMS_DATA?.platforms || [],
      totalDomains: WHITELISTED_DOMAINS.length
    });
    return true;
  }

  if (request.action === 'verifyCertificate') {
    // Handle certificate verification
    handleCertificateVerification(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }

  if (request.action === 'saveVerification') {
    // Handle saving verification
    handleSaveVerification(request.data)
      .then(result => sendResponse({ success: true, data: result }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Keep channel open for async response
  }
});

// Handle certificate verification API call
async function handleCertificateVerification(data) {
  try {
    console.log('🔧 [BACKGROUND] Starting verification...');
    console.log('🔧 [BACKGROUND] Received data:', {
      hasFileData: !!data.fileData,
      hasImageUrl: !!data.imageUrl,
      pageUrl: data.pageUrl,
    });

    // Get stored endpoint and auth token
    const storage = await chrome.storage.local.get(['cv_endpoint', 'cv_auth_token']);
    const endpoint = storage.cv_endpoint || 'http://127.0.0.1:5000/api/credentials/verify-certificate';
    const authToken = storage.cv_auth_token;

    console.log('🔧 [BACKGROUND] Configuration:', {
      endpoint,
      hasToken: !!authToken,
      tokenLength: authToken?.length || 0,
    });

    if (!authToken) {
      throw new Error('Authentication required. Please login to the extension first.');
    }

    // Prepare imageData (base64) and sourceUrl for backend
    let imageData = null;

    if (data.fileData && data.fileData.base64) {
      // Use base64 directly
      imageData = data.fileData.base64;
      console.log('🔧 [BACKGROUND] ✅ Using base64 from fileData, length:', imageData.length);
    } else if (data.imageUrl) {
      // Fetch image and convert to base64
      console.log('🔧 [BACKGROUND] 📥 Fetching image from URL:', data.imageUrl);
      try {
        const response = await fetch(data.imageUrl);
        console.log('🔧 [BACKGROUND] Image fetch response:', response.status, response.statusText);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        console.log('🔧 [BACKGROUND] Image blob size:', blob.size, 'bytes');
        const arrayBuffer = await blob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        imageData = base64;
        console.log('🔧 [BACKGROUND] ✅ Converted to base64, length:', base64.length);
      } catch (fetchError) {
        console.error('🔧 [BACKGROUND] ❌ Image fetch error:', fetchError);
        throw new Error(`Failed to fetch image: ${fetchError.message}`);
      }
    } else {
      throw new Error('No image data provided');
    }

    // Send to backend (format expected by backend)
    const requestBody = {
      imageData: imageData,
      sourceUrl: data.pageUrl || 'https://unknown.com',
      imageType: 'base64'
    };

    console.log('🔧 [BACKGROUND] 📤 Sending to backend:', endpoint);
    console.log('🔧 [BACKGROUND] Request body:', {
      imageDataLength: requestBody.imageData.length,
      sourceUrl: requestBody.sourceUrl,
      imageType: requestBody.imageType,
    });

    const startTime = Date.now();
    console.log('🔧 [BACKGROUND] ⏱️  Request started at:', new Date().toISOString());

    let response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
    } catch (fetchError) {
      const duration = Date.now() - startTime;
      console.error('🔧 [BACKGROUND] ❌ Fetch failed after', duration, 'ms');
      console.error('🔧 [BACKGROUND] Error details:', fetchError);
      console.error('🔧 [BACKGROUND] Error name:', fetchError.name);
      console.error('🔧 [BACKGROUND] Error message:', fetchError.message);
      throw new Error(`Network request failed: ${fetchError.message}`);
    }

    const duration = Date.now() - startTime;
    console.log('🔧 [BACKGROUND] 📥 Response received after', duration, 'ms');

    console.log('🔧 [BACKGROUND] Response status:', response.status, response.statusText);
    console.log('🔧 [BACKGROUND] Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error('🔧 [BACKGROUND] ❌ Non-OK response:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('🔧 [BACKGROUND] Error data:', errorData);
      throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log('🔧 [BACKGROUND] ✅ Verification successful!');
    console.log('🔧 [BACKGROUND] Result structure:', {
      success: result.success,
      hasData: !!result.data,
      message: result.message,
    });
    return result.data;
  } catch (error) {
    console.error('🔧 [BACKGROUND] ❌ Verification error:', error);
    console.error('🔧 [BACKGROUND] Error stack:', error.stack);
    console.error('🔧 [BACKGROUND] Error name:', error.name);
    console.error('🔧 [BACKGROUND] Error message:', error.message);
    throw error;
  }
}

// Handle save verification API call
async function handleSaveVerification(data) {
  try {
    // Get stored endpoint
    const storage = await chrome.storage.local.get(['cv_endpoint']);
    const baseEndpoint = storage.cv_endpoint || 'http://127.0.0.1:5000/api';

    // Extract base URL
    const endpointUrl = new URL(baseEndpoint);
    const saveEndpoint = `${endpointUrl.origin}/api/save-verification`;

    // Make API request
    const response = await fetch(saveEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Save verification error:', error);
    throw error;
  }
}

// Listen for tab updates to check domain
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const isWhitelisted = isWhitelistedDomain(tab.url);

    // Store the whitelist status for this tab
    chrome.storage.session.set({
      [`tab_${tabId}_whitelisted`]: isWhitelisted,
    });

    // Update extension icon based on whitelist status (optional, skip if disabled icon not available)
    try {
      chrome.action.setIcon({
        tabId: tabId,
        path: {
          48: '../icons/48x48.png',
        },
      });
    } catch (error) {
      // Icon update failed, ignore
    }
  }
});

// Listen for tab activation to update icon
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      const isWhitelisted = isWhitelistedDomain(tab.url);

      try {
        chrome.action.setIcon({
          tabId: activeInfo.tabId,
          path: {
            48: '../icons/48x48.png',
          },
        });
      } catch (error) {
        // Icon update failed, ignore
      }
    }
  });
});

console.log('Certificate Verifier background script loaded');
