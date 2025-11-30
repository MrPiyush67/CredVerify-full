// Certificate Verifier - Main Popup Script

(() => {
  // DOM Elements
  const domainStatus = document.getElementById('domainStatus');
  const certificatePreview = document.getElementById('certificatePreview');
  const imageSelectionCard = document.getElementById('imageSelectionCard');
  const imageList = document.getElementById('imageList');
  const imageCount = document.getElementById('imageCount');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const progressText = document.getElementById('progressText');
  const statusContainer = document.getElementById('statusContainer');
  const verificationResult = document.getElementById('verificationResult');
  const refreshBtn = document.getElementById('refreshBtn');
  const verifyBtn = document.getElementById('verifyBtn');
  const verifySpinner = document.getElementById('verifySpinner');
  const verifyBtnText = document.getElementById('verifyBtnText');
  const endpointInput = document.getElementById('endpointInput');
  const saveEndpointBtn = document.getElementById('saveEndpointBtn');

  // State
  let currentPageUrl = '';
  let selectedImageUrl = null;
  let selectedImageBlob = null;
  let verificationData = null;
  let authToken = null;
  let currentUser = null;

  // Initialize
  init();

  async function init() {
    // Check authentication first
    const authCheck = await checkAuthentication();
    if (!authCheck.isAuthenticated) {
      // Redirect to login page
      window.location.href = 'login.html';
      return;
    }

    authToken = authCheck.token;
    currentUser = authCheck.user;

    // Show user info
    showUserInfo();

    // Load saved endpoint
    const storage = await chrome.storage.local.get(['cv_endpoint']);
    if (storage.cv_endpoint) {
      endpointInput.value = storage.cv_endpoint;
    }

    // Check domain status
    await checkDomainStatus();

    // Get current page URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      currentPageUrl = tabs[0].url;
    }
  }
  function normalizeName(name) {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')  // keep this simple; tweak for other locales
      .replace(/\s+/g, ' ')
      .trim();
  }

  function splitName(name) {
    const norm = normalizeName(name);
    if (!norm) return { first: '', middle: '', last: '' };

    const parts = norm.split(' ');
    if (parts.length === 1) {
      return { first: parts[0], middle: '', last: '' };
    }
    if (parts.length === 2) {
      return { first: parts[0], middle: '', last: parts[1] };
    }

    return {
      first: parts[0],
      middle: parts.slice(1, -1).join(' '),
      last: parts[parts.length - 1],
    };
  }

  function getNameMatchInfo(userName, certName) {
    const user = splitName(userName);
    const cert = splitName(certName);

    if (!user.first || !cert.first) {
      return {
        isMatch: false,
        score: 0,
        reason: 'Missing name information'
      };
    }

    const firstMatch = user.first === cert.first;
    const lastMatch = user.last && cert.last && user.last === cert.last;

    // Exact normalized match (all parts)
    if (normalizeName(userName) === normalizeName(certName)) {
      return {
        isMatch: true,
        score: 1.0,
        reason: 'Exact name match'
      };
    }

    // First + last match → treat as same person, middle name ignored
    if (firstMatch && lastMatch) {
      return {
        isMatch: true,
        score: 0.9,
        reason: 'First and last names match (middle name difference is allowed)'
      };
    }

    // Only first name matches → weak
    if (firstMatch && !lastMatch) {
      return {
        isMatch: false,
        score: 0.4,
        reason: 'First name matches, last name differs'
      };
    }

    return {
      isMatch: false,
      score: 0,
      reason: 'Name does not match'
    };
  }
  // Check if user is authenticated
  async function checkAuthentication() {
    try {
      const storage = await chrome.storage.local.get(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);

      if (!storage.cv_auth_token || !storage.cv_auth_user) {
        return { isAuthenticated: false };
      }

      // Check if token is too old (7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (storage.cv_auth_timestamp && (Date.now() - storage.cv_auth_timestamp > sevenDays)) {
        // Token expired, clear storage
        await chrome.storage.local.remove(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);
        return { isAuthenticated: false };
      }

      return {
        isAuthenticated: true,
        token: storage.cv_auth_token,
        user: storage.cv_auth_user,
      };
    } catch (error) {
      console.error('Auth check error:', error);
      return { isAuthenticated: false };
    }
  }

  // Show user info in UI
  function showUserInfo() {
    if (!currentUser) return;

    const userInfoDiv = document.createElement('div');
    userInfoDiv.style.cssText = `
      padding: 0.75rem;
      background-color: hsl(var(--muted));
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    userInfoDiv.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background-color: hsl(var(--primary)); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600;">
          ${currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <div style="font-size: 0.875rem; font-weight: 600;">${currentUser.name}</div>
          <div style="font-size: 0.75rem; color: hsl(var(--muted-foreground));">${currentUser.email}</div>
        </div>
      </div>
      <button id="logoutBtn" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; border: 1px solid hsl(var(--border)); background: white; border-radius: var(--radius-sm); cursor: pointer;">
        Logout
      </button>
    `;

    const container = document.querySelector('.container');
    container.insertBefore(userInfoDiv, container.firstChild);

    // Add logout handler
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
  }

  // Handle logout
  async function handleLogout() {
    try {
      await chrome.storage.local.remove(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // Check if current domain is whitelisted
  async function checkDomainStatus() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'checkDomain' });

      if (response.isWhitelisted) {
        showDomainInfo(response.domain);
        await collectImages();
      } else {
        showDomainWarning(response.domain);
        verifyBtn.disabled = true;
      }
    } catch (error) {
      console.error('Domain check error:', error);
      showAlert('Error checking domain status', 'destructive');
    }
  }

  // Show domain info (whitelisted)
  function showDomainInfo(domain) {
    domainStatus.innerHTML = `
      <div class="domain-info">
        <span>✓</span>
        <span>Verified domain: <strong>${domain}</strong></span>
      </div>
    `;
  }

  // Show domain warning (not whitelisted)
  function showDomainWarning(domain) {
    domainStatus.innerHTML = `
      <div class="domain-warning">
        <span>⚠️</span>
        <div>
          <strong>Domain not whitelisted</strong><br/>
          This extension only works on trusted certification platforms.
          ${domain ? `Current: ${domain}` : ''}
        </div>
      </div>
    `;

    imageSelectionCard.style.display = 'none';
  }

  // Collect images from page
  async function collectImages() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tab = tabs[0];

      if (!tab) {
        showAlert('No active tab found', 'destructive');
        return;
      }

      // Inject script to collect images
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: collectImagesFromPage,
      });

      const images = results[0]?.result || [];

      if (images.length === 0) {
        showAlert('No images found on this page', 'warning');
        imageSelectionCard.style.display = 'none';
        return;
      }

      displayImages(images);
    } catch (error) {
      console.error('Image collection error:', error);
      showAlert(`Error: ${error.message}`, 'destructive');
    }
  }

  // Function to run in page context to collect images
  function collectImagesFromPage() {
    const images = new Set();

    // Helper to normalize URLs
    const normalizeUrl = (url) => {
      try {
        return new URL(url, document.baseURI).href;
      } catch {
        return null;
      }
    };

    // Collect from img tags
    document.querySelectorAll('img').forEach(img => {
      if (img.src && img.width >= 200 && img.height >= 150) {
        const url = normalizeUrl(img.src);
        if (url) images.add(url);
      }
    });

    // Collect from links to images
    document.querySelectorAll('a').forEach(a => {
      if (a.href && /\.(jpg|jpeg|png|webp|pdf)$/i.test(a.href)) {
        const url = normalizeUrl(a.href);
        if (url) images.add(url);
      }
    });

    return Array.from(images);
  }

  // Display images for selection
  function displayImages(images) {
    imageList.innerHTML = '';
    imageCount.textContent = images.length;

    images.forEach((url, index) => {
      const item = document.createElement('div');
      item.style.cssText = `
        display: flex;
        gap: 0.75rem;
        padding: 0.5rem;
        border: 2px solid hsl(var(--border));
        border-radius: var(--radius-md);
        margin-bottom: 0.5rem;
        cursor: pointer;
        transition: all var(--transition-base);
      `;

      item.innerHTML = `
        <img
          src="${url}"
          style="width: 80px; height: 60px; object-fit: cover; border-radius: var(--radius-sm);"
          onerror="this.style.display='none'"
        />
        <div style="flex: 1; font-size: 0.75rem; color: hsl(var(--muted-foreground)); overflow: hidden; text-overflow: ellipsis;">
          Image ${index + 1}
        </div>
      `;

      item.addEventListener('click', () => selectImage(url, item));
      imageList.appendChild(item);
    });

    imageSelectionCard.style.display = 'block';

    // Auto-select first image if only one
    if (images.length === 1) {
      selectImage(images[0], imageList.firstChild);
    }
  }

  // Select an image
  async function selectImage(url, element) {
    // Update UI - highlight selected
    imageList.querySelectorAll('div').forEach(el => {
      el.style.borderColor = 'hsl(var(--border))';
      el.style.backgroundColor = 'transparent';
    });
    element.style.borderColor = 'hsl(var(--primary))';
    element.style.backgroundColor = 'hsl(var(--primary) / 0.05)';

    selectedImageUrl = url;

    // Fetch image as blob
    try {
      // Try to fetch directly with CORS
      const response = await fetch(url, { mode: 'cors' });

      if (response.ok) {
        selectedImageBlob = await response.blob();

        // Verify blob has content
        if (selectedImageBlob.size > 0) {
          console.log('Successfully fetched image blob, size:', selectedImageBlob.size);

          // Show preview
          certificatePreview.innerHTML = `
            <img src="${url}" class="certificate-image" />
            <div class="badge badge-success">Certificate selected</div>
          `;
          certificatePreview.classList.add('has-image');
          verifyBtn.disabled = false;
        } else {
          throw new Error('Blob is empty');
        }
      } else {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

    } catch (error) {
      console.error('Image fetch error:', error);

      // Still allow verification even if blob fetch fails
      selectedImageUrl = url;
      selectedImageBlob = null; // Will be fetched by backend

      // Show the image preview anyway (browser can still display it even if we can't fetch the blob)
      certificatePreview.innerHTML = `
        <img src="${url}" class="certificate-image" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
        <div style="display: none; padding: 2rem; text-align: center;">
          <div style="font-size: 3rem; margin-bottom: 0.5rem;">📄</div>
          <div style="color: hsl(var(--foreground)); font-weight: 500;">Certificate Selected</div>
        </div>
        <div class="badge badge-success" style="margin-top: 0.5rem;">Certificate selected</div>
      `;
      certificatePreview.classList.add('has-image');

      // Enable verify button anyway
      verifyBtn.disabled = false;
    }
  }

  // Verify certificate
  async function verifyCertificate() {
    if (!selectedImageBlob && !selectedImageUrl) {
      showAlert('Please select a certificate image', 'warning');
      return;
    }

    // Disable button and show loading
    verifyBtn.disabled = true;
    verifySpinner.style.display = 'inline-block';
    verifyBtnText.textContent = 'Verifying...';

    // Show progress
    showProgress(0, 'Preparing certificate...');

    try {
      // Step 1: Upload and verify
      showProgress(25, 'Extracting text with OCR...');

      const filename = selectedImageUrl.split('/').pop().split('?')[0] || 'certificate.jpg';

      // Convert blob to base64 if available (Blob can't be sent via chrome.runtime.sendMessage)
      let fileData = null;
      if (selectedImageBlob && selectedImageBlob.size > 0) {
        console.log('Popup: Converting blob to base64...');
        console.log('  - Blob size:', selectedImageBlob.size);
        console.log('  - Blob type:', selectedImageBlob.type);
        const arrayBuffer = await selectedImageBlob.arrayBuffer();
        let binary = '';
        const uint8Array = new Uint8Array(arrayBuffer);
        for (let i = 0; i < uint8Array.length; i += 1024) {
          binary += String.fromCharCode.apply(null, uint8Array.subarray(i, i + 1024));
        }
        const base64 = btoa(binary);
        fileData = {
          base64: base64,
          type: selectedImageBlob.type,
        };
        console.log('  - Base64 length:', base64.length);
      } else {
        console.log('Popup: No valid blob available (size:', selectedImageBlob?.size || 0, '), will send URL:', selectedImageUrl);
      }

      console.log('Popup: Sending verification request...');
      console.log('  - Has fileData:', !!fileData);
      console.log('  - Has imageUrl:', !!selectedImageUrl);
      console.log('  - Filename:', filename);

      const response = await chrome.runtime.sendMessage({
        action: 'verifyCertificate',
        data: {
          fileData: fileData, // Base64 encoded file data
          imageUrl: !fileData ? selectedImageUrl : null, // Send URL if blob not available
          filename: filename,
          pageUrl: currentPageUrl,
        },
      });

      if (!response.success) {
        throw new Error(response.error);
      }

      showProgress(75, 'Analyzing with AI...');

      const result = response.data;
      verificationData = result;
      // --- Name verification against logged-in user ---
      if (currentUser && result.extractedData && result.extractedData.personName) {
        const nameMatchInfo = getNameMatchInfo(
          currentUser.name,
          result.extractedData.personName
        );

        // Attach name match info into verification object for UI
        result.verification = result.verification || {};
        result.verification.nameMatch = nameMatchInfo.isMatch;
        result.verification.nameMatchScore = nameMatchInfo.score;
        result.verification.nameMatchReason = nameMatchInfo.reason;
      }

      showProgress(100, 'Verification complete!');

      // Hide progress after a moment
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 1000);

      // Display result
      displayVerificationResult(result);

      // Auto-save if verified
      if (result.isVerified) {
        await saveVerification(result.saveData);
      }

    } catch (error) {
      console.error('Verification error:', error);
      progressContainer.style.display = 'none';
      showAlert(`Verification failed: ${error.message}`, 'destructive');
    } finally {
      verifyBtn.disabled = false;
      verifySpinner.style.display = 'none';
      verifyBtnText.textContent = '✓ Verify Certificate';
    }
  }

  // Show progress
  function showProgress(percent, text) {
    progressContainer.style.display = 'block';
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
  }

  // Display verification result
  function displayVerificationResult(result) {
    const isVerified = result.isVerified;
    const data = result.extractedData;
    const verification = result.verification;

    let html = `
      <div class="alert ${isVerified ? 'alert-success' : 'alert-destructive'}">
        <div class="alert-title">
          ${isVerified ? '✓ Certificate Verified' : '✗ Verification Failed'}
        </div>
        <div class="alert-description">
          ${isVerified
        ? 'This certificate appears to be authentic and matches the issuing domain.'
        : 'This certificate could not be verified. Please check the details below.'}
        </div>
      </div>

      <div class="card">
        <div class="card-title">📋 Extracted Information</div>
        <div class="result-grid">
          ${data.personName ? `
            <div class="result-item">
              <span class="result-label">Person Name</span>
              <span class="result-value">${data.personName}</span>
            </div>
          ` : ''}
          ${data.companyName ? `
            <div class="result-item">
              <span class="result-label">Company</span>
              <span class="result-value">${data.companyName}</span>
            </div>
          ` : ''}
          ${data.courseName ? `
            <div class="result-item">
              <span class="result-label">Course</span>
              <span class="result-value">${data.courseName}</span>
            </div>
          ` : ''}
          ${data.issuerName ? `
            <div class="result-item">
              <span class="result-label">Issued By</span>
              <span class="result-value">${data.issuerName}</span>
            </div>
          ` : ''}
          ${data.certificateId ? `
            <div class="result-item">
              <span class="result-label">Certificate ID</span>
              <span class="result-value">${data.certificateId}</span>
            </div>
          ` : ''}
          ${data.issueDate ? `
            <div class="result-item">
              <span class="result-label">Issue Date</span>
              <span class="result-value">${data.issueDate}</span>
            </div>
          ` : ''}
        </div>
      </div>

            <div class="card">
        <div class="card-title">🔍 Verification Details</div>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Domain Match</span>
            <span class="badge ${verification.domainMatch ? 'badge-success' : 'badge-destructive'}">
              ${verification.domainMatch ? 'Matched' : 'Not Matched'}
            </span>
          </div>
          <div class="result-item">
            <span class="result-label">Whitelisted Domain</span>
            <span class="badge ${verification.isWhitelistedDomain ? 'badge-success' : 'badge-destructive'}">
              ${verification.isWhitelistedDomain ? 'Yes' : 'No'}
            </span>
          </div>
          <div class="result-item">
            <span class="result-label">Company Match Score</span>
            <span class="result-value">
              ${Math.round((verification.companyMatchScore || 0) * 100)}%
            </span>
          </div>
          ${typeof verification.nameMatch !== 'undefined' ? `
            <div class="result-item">
              <span class="result-label">Name Match</span>
              <span class="badge ${verification.nameMatch ? 'badge-success' : 'badge-warning'}">
                ${verification.nameMatch ? 'Matched' : 'Check Manually'}
              </span>
              ${verification.nameMatchReason
          ? `<div style="font-size: 0.7rem; color: hsl(var(--muted-foreground)); margin-top: 0.25rem;">
                    ${verification.nameMatchReason}
                  </div>`
          : ''
        }
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (verification.errors && verification.errors.length > 0) {
      html += `
        <div class="alert alert-warning">
          <div class="alert-title">⚠️ Warnings</div>
          <div class="alert-description">
            ${verification.errors.map(err => `• ${err}`).join('<br/>')}
          </div>
        </div>
      `;
    }

    verificationResult.innerHTML = html;
    verificationResult.style.display = 'block';
  }

  // Save verification to database
  async function saveVerification(data) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'saveVerification',
        data: {
          ...data,
          extensionVersion: '1.0.0',
        },
      });

      if (response.success) {
        console.log('Verification saved successfully');
      }
    } catch (error) {
      console.error('Save error:', error);
      // Don't show error to user as this is a background operation
    }
  }

  // Show alert
  function showAlert(message, type = 'info') {
    statusContainer.innerHTML = `
      <div class="alert alert-${type}">
        <div class="alert-description">${message}</div>
      </div>
    `;

    // Auto-hide after 5 seconds
    setTimeout(() => {
      statusContainer.innerHTML = '';
    }, 5000);
  }

  // Event Listeners
  refreshBtn.addEventListener('click', async () => {
    statusContainer.innerHTML = '';
    verificationResult.style.display = 'none';
    verificationResult.innerHTML = '';
    certificatePreview.innerHTML = `
      <div class="preview-placeholder">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📸</div>
        <div>Select a certificate image from the page</div>
      </div>
    `;
    certificatePreview.classList.remove('has-image');
    selectedImageUrl = null;
    selectedImageBlob = null;
    verifyBtn.disabled = true;

    await checkDomainStatus();
  });

  verifyBtn.addEventListener('click', verifyCertificate);

  saveEndpointBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    await chrome.storage.local.set({ cv_endpoint: endpoint });
    showAlert('Endpoint saved successfully', 'success');
  });
})();
