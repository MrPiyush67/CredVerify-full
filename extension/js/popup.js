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
      window.location.href = '../html/login.html';
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
        showDomainInfo(response.domain, response.platform);
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
  function showDomainInfo(domain, platform) {
    const platformBadge = platform ?
      `<span class="badge badge-secondary" style="margin-left: 0.5rem;">${platform.name}</span>` : '';

    domainStatus.innerHTML = `
      <div class="domain-info">
        <span>✓</span>
        <span>Verified domain: <strong>${domain}</strong>${platformBadge}</span>
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

  // Verify certificate - Simplified workflow
  async function verifyCertificate() {
    console.log('📱 [POPUP] verifyCertificate() called');
    console.log('📱 [POPUP] selectedImageUrl:', selectedImageUrl);
    console.log('📱 [POPUP] selectedImageBlob:', selectedImageBlob ? `${selectedImageBlob.size} bytes` : 'null');
    console.log('📱 [POPUP] currentPageUrl:', currentPageUrl);

    if (!selectedImageUrl) {
      console.error('📱 [POPUP] ❌ No image URL selected');
      showAlert('Please select a certificate image first', 'warning');
      return;
    }

    // Disable button and show loading
    verifyBtn.disabled = true;
    verifySpinner.style.display = 'inline-block';
    verifyBtnText.textContent = 'Verifying...';

    // Show progress
    showProgress(0, 'Preparing certificate...');

    try {
      showProgress(25, 'Extracting text with OCR...');
      console.log('📱 [POPUP] Starting verification process...');

      // Convert blob to base64 if available
      let fileData = null;
      if (selectedImageBlob && selectedImageBlob.size > 0) {
        console.log('📱 [POPUP] Converting blob to base64...');
        console.log('📱 [POPUP] Blob size:', selectedImageBlob.size, 'bytes');
        console.log('📱 [POPUP] Blob type:', selectedImageBlob.type);
        const arrayBuffer = await selectedImageBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        fileData = {
          base64: base64,
          type: selectedImageBlob.type,
        };
        console.log('📱 [POPUP] ✅ Base64 length:', base64.length, 'characters');
      } else {
        console.log('📱 [POPUP] No blob available, will send URL:', selectedImageUrl);
      }

      // Send to background script (which forwards to backend)
      console.log('📱 [POPUP] 📤 Sending message to background script...');
      const messageData = {
        action: 'verifyCertificate',
        data: {
          fileData: fileData,
          imageUrl: !fileData ? selectedImageUrl : null,
          pageUrl: currentPageUrl,
        },
      };
      console.log('📱 [POPUP] Message data:', {
        action: messageData.action,
        hasFileData: !!messageData.data.fileData,
        imageUrl: messageData.data.imageUrl,
        pageUrl: messageData.data.pageUrl,
      });

      const response = await chrome.runtime.sendMessage(messageData);
      console.log('📱 [POPUP] 📥 Received response from background');
      console.log('📱 [POPUP] Response:', { success: response.success, hasData: !!response.data, error: response.error });

      if (!response.success) {
        console.error('📱 [POPUP] ❌ Background returned error:', response.error);

        // Check if it's a structured error response (early rejection)
        if (response.data && response.data.error) {
          // Handle early rejection responses
          const errorType = response.data.error;
          const errorData = response.data;

          if (errorType === 'UNTRUSTED_DOMAIN') {
            showAlert(`❌ Untrusted Domain: ${errorData.message}`, 'destructive');
            displayEarlyRejection(errorData, 'Untrusted Domain',
              'This certificate is from a domain not in our trusted whitelist.');
          } else if (errorType === 'NAME_MISMATCH') {
            showAlert(`❌ Name Mismatch: ${errorData.message}`, 'destructive');
            displayEarlyRejection(errorData, 'Name Mismatch',
              'The name on the certificate does not match your profile name.');
          } else {
            throw new Error(response.error);
          }
          return; // Don't continue processing
        }

        throw new Error(response.error);
      }

      showProgress(75, 'Analyzing with AI...');

      const result = response.data;
      verificationData = result;

      showProgress(100, 'Verification complete!');

      // Show save status
      if (result.saved) {
        console.log('📱 [POPUP] ✅ Certificate saved to database');
        console.log('📱 [POPUP] Credential ID:', result.credential?._id);
      } else {
        console.log('📱 [POPUP] ℹ️ Certificate not saved (status:', result.verification?.status, ')');
      }

      // Hide progress after a moment
      setTimeout(() => {
        progressContainer.style.display = 'none';
      }, 1000);

      // Display result
      displayVerificationResult(result);

    } catch (error) {
      console.error('📱 [POPUP] ❌ Verification error:', error);
      console.error('📱 [POPUP] Error name:', error.name);
      console.error('📱 [POPUP] Error message:', error.message);
      console.error('📱 [POPUP] Error stack:', error.stack);
      progressContainer.style.display = 'none';
      showAlert(`Verification failed: ${error.message}`, 'destructive');
    } finally {
      verifyBtn.disabled = false;
      verifySpinner.style.display = 'none';
      verifyBtnText.textContent = '✓ Verify Certificate';
      console.log('📱 [POPUP] Verification process ended');
    }
  }

  // Show progress
  function showProgress(percent, text) {
    progressContainer.style.display = 'block';
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
  }

  // Display early rejection (domain/name failures)
  function displayEarlyRejection(errorData, title, description) {
    const verification = errorData.verification || {};
    const nameValidation = errorData.nameValidation || {};
    const domainValidation = errorData.domainValidation || {};

    let html = `
      <div class="alert alert-destructive">
        <div class="alert-title">❌ ${title}</div>
        <div class="alert-description">${description}</div>
      </div>
    `;

    if (nameValidation.legalName || nameValidation.recipientName) {
      html += `
        <div class="card">
          <div class="card-title">👤 Name Comparison</div>
          <div class="result-grid">
            ${nameValidation.legalName ? `
              <div class="result-item">
                <span class="result-label">Your Name (Profile)</span>
                <span class="result-value">${nameValidation.legalName}</span>
              </div>
            ` : ''}
            ${nameValidation.recipientName ? `
              <div class="result-item">
                <span class="result-label">Name on Certificate</span>
                <span class="result-value">${nameValidation.recipientName}</span>
              </div>
            ` : ''}
            ${nameValidation.confidence !== undefined ? `
              <div class="result-item">
                <span class="result-label">Match Confidence</span>
                <span class="badge badge-destructive">${nameValidation.confidence}%</span>
              </div>
              <div class="result-item">
                <span class="result-label">Reason</span>
                <span class="result-value">${nameValidation.reason}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    if (domainValidation.domain) {
      html += `
        <div class="card">
          <div class="card-title">🌐 Domain Information</div>
          <div class="result-grid">
            <div class="result-item">
              <span class="result-label">Domain</span>
              <span class="result-value">${domainValidation.domain}</span>
            </div>
            <div class="result-item">
              <span class="result-label">Status</span>
              <span class="badge badge-destructive">Not Trusted</span>
            </div>
            ${domainValidation.reason ? `
              <div class="result-item" style="grid-column: 1 / -1;">
                <span class="result-label">Reason</span>
                <span class="result-value">${domainValidation.reason}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    verificationResult.innerHTML = html;
    verificationResult.style.display = 'block';
  }

  // Display verification result
  function displayVerificationResult(result) {
    // Handle new clean architecture response
    const data = result.extractedData || {};
    const verification = result.verification || {};
    const nameValidation = result.nameValidation || {};
    const domainValidation = result.domainValidation || {};

    const verificationStatus = verification.status || 'UNKNOWN';
    const finalScore = verification.finalScore || 0;
    const recommendations = result.recommendations || [];

    // Determine alert type and message based on status
    let alertType, alertTitle, alertDescription;

    if (verificationStatus === 'VERIFIED') {
      alertType = 'alert-success';
      alertTitle = '✅ Certificate Verified';
      const savedText = result.saved ? ' and saved to your profile' : '';
      alertDescription = `High confidence match (${finalScore}%). This certificate is authentic${savedText}.`;
    } else if (verificationStatus === 'REVIEW_REQUIRED') {
      alertType = 'alert-warning';
      alertTitle = '⚠️ Manual Review Required';
      alertDescription = `Moderate confidence (${finalScore}%). Please verify the details manually.`;
    } else {
      alertType = 'alert-destructive';
      alertTitle = '❌ Verification Failed';
      alertDescription = `Low confidence (${finalScore}%). This certificate could not be verified.`;
    }

    let html = `
      <div class="alert ${alertType}">
        <div class="alert-title">${alertTitle}</div>
        <div class="alert-description">${alertDescription}</div>
      </div>

      <!-- Confidence Breakdown (New weighted system) -->
      ${verification?.confidence ? `
      <div class="card">
        <div class="card-title">📊 Confidence Breakdown</div>
        <div class="result-grid">
          <div class="result-item">
            <span class="result-label">Overall Score</span>
            <span class="badge ${finalScore >= 85 ? 'badge-success' : finalScore >= 65 ? 'badge-warning' : 'badge-destructive'}">
              ${finalScore}%
            </span>
          </div>
          <div class="result-item">
            <span class="result-label">Name Match</span>
            <span class="result-value">${verification.confidence.name}% (Weight: 60%)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Domain Validation</span>
            <span class="result-value">${verification.confidence.domain}% (Weight: 30%)</span>
          </div>
          <div class="result-item">
            <span class="result-label">Metadata Validation</span>
            <span class="result-value">${verification.confidence.metadata}% (Weight: 10%)</span>
          </div>
        </div>
      </div>
      ` : ''}

      <!-- Recommendations -->
      ${recommendations.length > 0 ? `
      <div class="alert alert-info">
        <div class="alert-title">💡 Recommendations</div>
        <div class="alert-description" style="white-space: pre-line;">
          ${recommendations.join('\n')}
        </div>
      </div>
      ` : ''}

      <div class="card">
        <div class="card-title">📋 Extracted Information</div>
        <div class="result-grid">
          ${data.recipientName ? `
            <div class="result-item">
              <span class="result-label">📛 Recipient Name</span>
              <span class="result-value">${data.recipientName}</span>
            </div>
          ` : ''}
          ${data.issuerName ? `
            <div class="result-item">
              <span class="result-label">🏢 Issuer</span>
              <span class="result-value">${data.issuerName}</span>
            </div>
          ` : ''}
          ${data.courseTitle ? `
            <div class="result-item">
              <span class="result-label">📜 Course/Certificate</span>
              <span class="result-value">${data.courseTitle}</span>
            </div>
          ` : ''}
          ${data.duration ? `
            <div class="result-item">
              <span class="result-label">Duration</span>
              <span class="result-value">${data.duration}</span>
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
          ${nameValidation.legalName ? `
            <div class="result-item">
              <span class="result-label">Your Name</span>
              <span class="result-value">${nameValidation.legalName}</span>
            </div>
          ` : ''}
          ${nameValidation.certificateName ? `
            <div class="result-item">
              <span class="result-label">Name on Certificate</span>
              <span class="result-value">${nameValidation.certificateName}</span>
            </div>
          ` : ''}
          ${nameValidation.confidence !== undefined ? `
            <div class="result-item">
              <span class="result-label">Name Match Confidence</span>
              <span class="badge ${nameValidation.confidence >= 85 ? 'badge-success' : nameValidation.confidence >= 70 ? 'badge-warning' : 'badge-destructive'}">
                ${nameValidation.confidence}%
              </span>
            </div>
          ` : ''}
          ${domainValidation.issuer ? `
            <div class="result-item">
              <span class="result-label">Issuer Platform</span>
              <span class="result-value">${domainValidation.issuer.name}</span>
            </div>
          ` : ''}
          ${domainValidation.domain ? `
            <div class="result-item">
              <span class="result-label">Domain</span>
              <span class="result-value">${domainValidation.domain}</span>
            </div>
          ` : ''}
          ${domainValidation.isTrusted !== undefined ? `
            <div class="result-item">
              <span class="result-label">Domain Status</span>
              <span class="badge ${domainValidation.isTrusted ? 'badge-success' : 'badge-destructive'}">
                ${domainValidation.isTrusted ? 'Trusted' : 'Untrusted'}
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    if (result.warnings && result.warnings.length > 0) {
      html += `
        <div class="alert alert-warning">
          <div class="alert-title">⚠️ Warnings</div>
          <div class="alert-description">
            ${result.warnings.map(err => `• ${err}`).join('<br/>')}
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

  verifyBtn.addEventListener('click', async () => {
    await verifyCertificate();
  });

  saveEndpointBtn.addEventListener('click', async () => {
    const endpoint = endpointInput.value.trim();
    await chrome.storage.local.set({ cv_endpoint: endpoint });
    showAlert('Endpoint saved successfully', 'success');
  });
})();
