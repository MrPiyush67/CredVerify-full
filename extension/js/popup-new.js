// CredVerify Extension - Main Popup Script

(() => {
  // ===========================================
  // DOM ELEMENTS
  // ===========================================
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

  // ===========================================
  // STATE
  // ===========================================
  let authToken = null;
  let currentUser = null;
  let currentPageUrl = '';
  let selectedImageUrl = null;
  let selectedImageBlob = null;
  let antiTamperHash = null;
  let antiTamperPending = false;
  let isVerifying = false;

  // ===========================================
  // INITIALIZATION
  // ===========================================
  init();

  async function init() {
    // Check auth
    const auth = await checkAuth();
    if (!auth.isAuthenticated) {
      window.location.href = '../html/login.html';
      return;
    }

    authToken = auth.token;
    currentUser = auth.user;
    showUserInfo();

    // Get current page
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) currentPageUrl = tabs[0].url;

    // Check for pending anti-tamper verification
    await checkAntiTamper();

    // Check domain and collect images
    await checkDomain();
  }

  // ===========================================
  // AUTHENTICATION
  // ===========================================
  async function checkAuth() {
    try {
      const storage = await chrome.storage.local.get(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);

      if (!storage.cv_auth_token || !storage.cv_auth_user) {
        return { isAuthenticated: false };
      }

      // Check token age (7 days)
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      if (storage.cv_auth_timestamp && (Date.now() - storage.cv_auth_timestamp > sevenDays)) {
        await chrome.storage.local.remove(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);
        return { isAuthenticated: false };
      }

      return {
        isAuthenticated: true,
        token: storage.cv_auth_token,
        user: storage.cv_auth_user
      };
    } catch {
      return { isAuthenticated: false };
    }
  }

  function showUserInfo() {
    const userDiv = document.createElement('div');
    userDiv.style.cssText = `
      padding: 0.75rem;
      background-color: hsl(var(--muted));
      border-radius: var(--radius-md);
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;

    userDiv.innerHTML = `
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

    document.querySelector('.container').insertBefore(userDiv, document.querySelector('.container').firstChild);
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      await chrome.storage.local.remove(['cv_auth_token', 'cv_auth_user', 'cv_auth_timestamp']);
      window.location.href = 'login.html';
    });
  }

  // ===========================================
  // DOMAIN CHECK
  // ===========================================
  async function checkDomain() {
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
      showAlert('Error checking domain', 'destructive');
    }
  }

  function showDomainInfo(domain, platform) {
    const badge = platform ? `<span class="badge badge-secondary" style="margin-left: 0.5rem;">${platform.name}</span>` : '';
    domainStatus.innerHTML = `
      <div class="domain-info">
        <span>✓</span>
        <span>Verified domain: <strong>${domain}</strong>${badge}</span>
      </div>
    `;
  }

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

  // ===========================================
  // IMAGE COLLECTION
  // ===========================================
  async function collectImages() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]) return;

      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const images = new Set();
          document.querySelectorAll('img').forEach(img => {
            if (img.src && img.width >= 200 && img.height >= 150) {
              try {
                images.add(new URL(img.src, document.baseURI).href);
              } catch {}
            }
          });
          return Array.from(images);
        }
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

    // Auto-select if only one
    if (images.length === 1) {
      selectImage(images[0], imageList.firstChild);
    }
  }

  async function selectImage(url, element) {
    // Highlight selected
    imageList.querySelectorAll('div').forEach(el => {
      el.style.borderColor = 'hsl(var(--border))';
      el.style.backgroundColor = 'transparent';
    });
    element.style.borderColor = 'hsl(var(--primary))';
    element.style.backgroundColor = 'hsl(var(--primary) / 0.05)';

    selectedImageUrl = url;

    // Fetch blob
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        selectedImageBlob = await response.blob();
      }
    } catch {
      selectedImageBlob = null; // Backend will fetch
    }

    // Show preview
    certificatePreview.innerHTML = `
      <img src="${url}" class="certificate-image" />
      <div class="badge badge-success">Certificate selected</div>
    `;
    certificatePreview.classList.add('has-image');
    verifyBtn.disabled = false;
  }

  // ===========================================
  // ANTI-TAMPER PROTECTION
  // ===========================================
  async function calculateImageHash(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const size = 8;
          canvas.width = size;
          canvas.height = size;
          ctx.drawImage(img, 0, 0, size, size);

          const imageData = ctx.getImageData(0, 0, size, size);
          const pixels = imageData.data;
          const grayscale = [];
          let sum = 0;

          for (let i = 0; i < pixels.length; i += 4) {
            const gray = Math.round((pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3);
            grayscale.push(gray);
            sum += gray;
          }

          const average = sum / grayscale.length;
          let hash = '';
          for (let i = 0; i < grayscale.length; i++) {
            hash += grayscale[i] > average ? '1' : '0';
          }

          let hexHash = '';
          for (let i = 0; i < hash.length; i += 4) {
            hexHash += parseInt(hash.substr(i, 4), 2).toString(16);
          }

          resolve(hexHash);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function compareHashes(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return false;
    
    let differences = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) differences++;
    }
    
    const tolerance = Math.floor(hash1.length * 0.1);
    return differences <= tolerance;
  }

  async function checkAntiTamper() {
    try {
      const storage = await chrome.storage.local.get(['cv_anti_tamper_pending']);
      if (!storage.cv_anti_tamper_pending) return;

      const data = storage.cv_anti_tamper_pending;
      
      // Check age (5 minutes max)
      if (Date.now() - data.timestamp > 5 * 60 * 1000) {
        await chrome.storage.local.remove(['cv_anti_tamper_pending']);
        return;
      }

      antiTamperPending = true;
      showProgress(10, 'Verifying certificate authenticity...');

      // Verify page URL
      if (currentPageUrl !== data.pageUrl) {
        throw new Error('Page URL changed');
      }

      // Get all images
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const results = await chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: () => {
          const images = [];
          document.querySelectorAll('img').forEach(img => {
            if (img.src && img.naturalWidth > 200 && img.naturalHeight > 200) {
              images.push(img.src);
            }
          });
          return images;
        }
      });

      const pageImages = results[0]?.result || [];
      showProgress(30, `Checking ${pageImages.length} images...`);

      // Find matching image
      let matched = false;
      for (let i = 0; i < pageImages.length; i++) {
        showProgress(30 + (50 * (i / pageImages.length)), `Checking image ${i + 1}...`);
        
        try {
          const response = await fetch(pageImages[i]);
          const blob = await response.blob();
          const hash = await calculateImageHash(blob);

          if (compareHashes(data.imageHash, hash)) {
            matched = true;
            selectedImageUrl = pageImages[i];
            selectedImageBlob = blob;
            
            certificatePreview.innerHTML = `<img src="${pageImages[i]}" class="certificate-image" />`;
            certificatePreview.classList.add('has-image');
            verifyBtn.disabled = false;
            
            await chrome.storage.local.remove(['cv_anti_tamper_pending']);
            progressContainer.style.display = 'none';
            showAlert('✅ Anti-tamper check passed! Click "Verify Certificate" to continue.', 'success');
            break;
          }
        } catch {}
      }

      if (!matched) {
        await chrome.storage.local.remove(['cv_anti_tamper_pending']);
        antiTamperPending = false;
        progressContainer.style.display = 'none';
        showAlert('⚠️ Certificate image changed or removed. Please select again.', 'destructive');
      }
    } catch (error) {
      console.error('Anti-tamper error:', error);
      await chrome.storage.local.remove(['cv_anti_tamper_pending']);
      antiTamperPending = false;
      progressContainer.style.display = 'none';
      showAlert(`Anti-tamper check failed: ${error.message}`, 'destructive');
    }
  }

  async function initiateAntiTamper() {
    if (!selectedImageBlob) throw new Error('No image selected');

    showProgress(10, 'Calculating image fingerprint...');
    const hash = await calculateImageHash(selectedImageBlob);

    showProgress(50, 'Preparing page refresh...');
    await chrome.storage.local.set({
      cv_anti_tamper_pending: {
        imageHash: hash,
        imageUrl: selectedImageUrl,
        pageUrl: currentPageUrl,
        timestamp: Date.now()
      }
    });

    showProgress(80, 'Refreshing page...');
    await new Promise(resolve => setTimeout(resolve, 500));

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
      await chrome.tabs.reload(tabs[0].id);
    }
  }

  // ===========================================
  // VERIFICATION
  // ===========================================
  async function verifyCertificate() {
    if (isVerifying) return;
    if (!selectedImageUrl) {
      showAlert('Please select a certificate image', 'warning');
      return;
    }

    verifyBtn.disabled = true;
    verifySpinner.style.display = 'inline-block';
    verifyBtnText.textContent = 'Verifying...';

    // Step 1: Anti-tamper check (first time only)
    if (!antiTamperPending) {
      showAlert('🔐 Initiating anti-tamper protection. Page will refresh...', 'info');
      await initiateAntiTamper();
      verifyBtn.disabled = false;
      verifySpinner.style.display = 'none';
      verifyBtnText.textContent = '✓ Verify Certificate';
      return;
    }

    // Step 2: Actual verification (after anti-tamper passed)
    isVerifying = true;
    showProgress(25, 'Extracting text with OCR...');

    try {
      // Convert blob to base64
      let fileData = null;
      if (selectedImageBlob?.size > 0) {
        const arrayBuffer = await selectedImageBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        fileData = { base64, type: selectedImageBlob.type };
      }

      // Send to backend
      showProgress(50, 'Analyzing with AI...');
      const response = await chrome.runtime.sendMessage({
        action: 'verifyCertificate',
        data: {
          fileData,
          imageUrl: !fileData ? selectedImageUrl : null,
          pageUrl: currentPageUrl
        }
      });

      if (!response.success) {
        throw new Error(response.error || 'Verification failed');
      }

      showProgress(100, 'Complete!');
      setTimeout(() => progressContainer.style.display = 'none', 1000);

      displayResult(response.data);

      // Reset state
      isVerifying = false;
      antiTamperPending = false;

    } catch (error) {
      console.error('Verification error:', error);
      progressContainer.style.display = 'none';
      showAlert(`Verification failed: ${error.message}`, 'destructive');
      isVerifying = false;
      antiTamperPending = false;
    } finally {
      verifyBtn.disabled = false;
      verifySpinner.style.display = 'none';
      verifyBtnText.textContent = '✓ Verify Certificate';
    }
  }

  // ===========================================
  // RESULT DISPLAY
  // ===========================================
  function displayResult(result) {
    const data = result.extractedData || {};
    const verification = result.verification || {};
    const finalScore = verification.finalScore || 0;
    const status = verification.status || 'UNKNOWN';

    let alertType, alertTitle, alertDesc;
    if (status === 'VERIFIED') {
      alertType = 'alert-success';
      alertTitle = '✅ Certificate Verified';
      alertDesc = `High confidence (${finalScore}%). This certificate is authentic.`;
    } else if (status === 'REVIEW_REQUIRED') {
      alertType = 'alert-warning';
      alertTitle = '⚠️ Manual Review Required';
      alertDesc = `Moderate confidence (${finalScore}%). Please verify manually.`;
    } else {
      alertType = 'alert-destructive';
      alertTitle = '❌ Verification Failed';
      alertDesc = `Low confidence (${finalScore}%). Could not verify.`;
    }

    let html = `
      <div class="alert ${alertType}">
        <div class="alert-title">${alertTitle}</div>
        <div class="alert-description">${alertDesc}</div>
      </div>
    `;

    // Confidence breakdown
    if (verification.confidence) {
      html += `
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
              <span class="result-label">Metadata</span>
              <span class="result-value">${verification.confidence.metadata}% (Weight: 10%)</span>
            </div>
          </div>
        </div>
      `;
    }

    // Extracted information
    html += `
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
    `;

    verificationResult.innerHTML = html;
    verificationResult.style.display = 'block';
  }

  // ===========================================
  // UI HELPERS
  // ===========================================
  function showProgress(percent, text) {
    progressContainer.style.display = 'block';
    progressBar.style.width = `${percent}%`;
    progressText.textContent = text;
  }

  function showAlert(message, type = 'info') {
    statusContainer.innerHTML = `
      <div class="alert alert-${type}">
        <div class="alert-description">${message}</div>
      </div>
    `;
    setTimeout(() => statusContainer.innerHTML = '', 5000);
  }

  // ===========================================
  // EVENT LISTENERS
  // ===========================================
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
    await checkDomain();
  });

  verifyBtn.addEventListener('click', () => {
    if (!verifyBtn.disabled && !isVerifying) {
      verifyCertificate();
    }
  });
})();
