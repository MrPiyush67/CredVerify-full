// Background script for secure API communication
// This keeps the API endpoint hidden from the popup

// Whitelisted domains - only these domains can use the extension
const WHITELISTED_DOMAINS = [
  'coursera.org',
  'udacity.com',
  'edx.org',
  'udemy.com',
  'linkedin.com',
  'learning.linkedin.com',
  'ibm.com',
  'google.com',
  'microsoft.com',
  'deeplearning.ai',
  'kaggle.com',
  'codealpha.tech',
  'internshala.com',
  'nptel.ac.in',
  'skillshare.com',
  'aws.amazon.com',
  'cloudacademy.com',
  'unstop.com',
  'skillsforall.com',
];

// Check if domain is whitelisted
const isWhitelistedDomain = (url) => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    console.log('🔍 Checking domain:', hostname);
    console.log('📋 Whitelist:', WHITELISTED_DOMAINS);

    const isWhitelisted = WHITELISTED_DOMAINS.some(domain =>
      hostname === domain ||
      hostname === `www.${domain}` ||
      hostname.endsWith(`.${domain}`)
    );

    console.log('✅ Is whitelisted?', isWhitelisted);
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
      const isWhitelisted = currentTab ? isWhitelistedDomain(currentTab.url) : false;

      sendResponse({
        isWhitelisted,
        domain: currentTab ? new URL(currentTab.url).hostname : null,
      });
    });
    return true; // Keep channel open for async response
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
    // Debug: log what we received
    console.log('Background: Received verification request');
    console.log('  - Has fileData:', !!data.fileData);
    console.log('  - Has imageUrl:', !!data.imageUrl);
    console.log('  - Filename:', data.filename);
    console.log('  - Page URL:', data.pageUrl);

    // Get stored endpoint and auth token
    const storage = await chrome.storage.local.get(['cv_endpoint', 'cv_auth_token']);
    const endpoint = storage.cv_endpoint || 'http://127.0.0.1:3001/api/verify-certificate';
    const authToken = storage.cv_auth_token;

    if (!authToken) {
      throw new Error('Authentication required. Please login to the extension first.');
    }

    let imageFile = null;

    // Debug: Check fileData structure
    if (data.fileData) {
      console.log('FileData received:', {
        hasBase64: !!data.fileData.base64,
        hasType: !!data.fileData.type,
        base64Length: data.fileData.base64?.length || 0,
        type: data.fileData.type,
        fileDataKeys: Object.keys(data.fileData)
      });
    }

    // Create form data
    const formData = new FormData();

    // If we have base64 data, convert to blob and send as file
    if (data.fileData && data.fileData.base64) {
      console.log('Converting base64 to blob...');
      console.log('  - Base64 string length:', data.fileData.base64.length);
      const binaryString = atob(data.fileData.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      imageFile = new Blob([bytes], { type: data.fileData.type || 'image/jpeg' });
      formData.append('file', imageFile, data.filename);
    }
    // If no fileData but we have imageUrl, send the URL to backend (server will fetch it)
    else if (data.imageUrl) {
      console.log('Sending image URL to backend (server will fetch):', data.imageUrl);
      formData.append('image_url', data.imageUrl);
    } else {
      throw new Error('No image file or URL provided');
    }

    formData.append('page_url', data.pageUrl);

    // Make API request with Authorization header
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Verification error:', error);
    throw error;
  }
}

// Handle save verification API call
async function handleSaveVerification(data) {
  try {
    // Get stored endpoint
    const storage = await chrome.storage.local.get(['cv_endpoint']);
    const baseEndpoint = storage.cv_endpoint || 'http://127.0.0.1:3001/api';

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
          48: 'icons/icon48.jpg',
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
            48: 'icons/icon48.jpg',
          },
        });
      } catch (error) {
        // Icon update failed, ignore
      }
    }
  });
});

console.log('Certificate Verifier background script loaded');
