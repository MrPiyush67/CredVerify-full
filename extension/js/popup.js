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

  // Anti-tamper: baseline fingerprint of the selected image
  let baselineImageHash = null;
  let baselineImageTimestamp = null;
  const ANTI_TAMPER_MAX_AGE_MS = 5 * 60 * 1000; // 5 minutes

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
        showDomainWarning(response.domain, response.error);
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

  function showDomainWarning(domain, reason) {
    domainStatus.innerHTML = `
    <div class="domain-warning">
      <span>⚠️</span>
      <div>
        <strong>Cannot verify this page</strong><br/>
        ${reason ? reason + "<br/>" : ""}
        ${domain ? `Current: ${domain}` : ""}
      </div>
    </div>
  `;

    imageSelectionCard.style.display = 'none';
    verifyBtn.disabled = true;
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
          const imgs = Array.from(document.querySelectorAll('img'));
          const out = [];
          console.log(`Found ${imgs.length} total images on page`);

          imgs.forEach((img, idx) => {
            // Get actual rendered dimensions instead of natural dimensions
            const rect = img.getBoundingClientRect();
            const renderedWidth = rect.width;
            const renderedHeight = rect.height;

            // Skip images that haven't loaded or are not visible
            if (renderedWidth === 0 || renderedHeight === 0) {
              console.log(`⚠️ Skipping image ${idx}: zero dimensions (not loaded/visible)`);
              return;
            }

            console.log(`Image ${idx}: ${renderedWidth}x${renderedHeight} - ${img.src.substring(0, 50)}...`);

            if (img.src && renderedWidth >= 400 && renderedHeight >= 200) {
              try {
                out.push({
                  url: new URL(img.src, document.baseURI).href,
                  domIndex: idx, // simple DOM position signature
                  width: renderedWidth,
                  height: renderedHeight
                });
                console.log(`✅ Included image ${idx}: ${renderedWidth}x${renderedHeight}`);
              } catch (e) {
                console.log(`❌ Error processing image ${idx}:`, e);
              }
            } else {
              console.log(`❌ Filtered out image ${idx}: ${renderedWidth}x${renderedHeight} (too small)`);
            }
          });

          console.log(`Returning ${out.length} filtered images`);
          return out;
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
    selectedImageBlob = null;
    baselineImageHash = null;
    baselineImageTimestamp = null;

    // Fetch blob & lock anti-tamper baseline if possible
    try {
      const response = await fetch(url, { mode: 'cors', cache: 'no-store' });
      if (response.ok) {
        selectedImageBlob = await response.blob();
        baselineImageHash = await calculateImageHash(selectedImageBlob);
        baselineImageTimestamp = Date.now();
      } else {
        console.warn('Failed to fetch image for baseline, status:', response.status);
      }
    } catch (err) {
      console.warn('Error fetching image for baseline hash:', err);
      selectedImageBlob = null; // Backend can still fetch using imageUrl
      baselineImageHash = null;
      baselineImageTimestamp = null;
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
  // ANTI-TAMPER PROTECTION (SIMPLE & LOCAL)
  // ===========================================
  async function calculateImageHash(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const size = 8;
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = size;
          canvas.height = size;

          ctx.drawImage(img, 0, 0, size, size);
          const { data } = ctx.getImageData(0, 0, size, size);

          const grayscale = [];
          let sum = 0;
          for (let i = 0; i < data.length; i += 4) {
            const gray = Math.round((data[i] + data[i + 1] + data[i + 2]) / 3);
            grayscale.push(gray);
            sum += gray;
          }

          const avg = sum / grayscale.length;
          let bits = '';
          for (let i = 0; i < grayscale.length; i++) {
            bits += grayscale[i] > avg ? '1' : '0';
          }

          let hex = '';
          for (let i = 0; i < bits.length; i += 4) {
            hex += parseInt(bits.substr(i, 4), 2).toString(16);
          }

          resolve(hex);
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

    let diff = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] !== hash2[i]) diff++;
    }

    // Allow up to 10% difference
    const tolerance = Math.floor(hash1.length * 0.1);
    return diff <= tolerance;
  }

  async function runAntiTamperCheck() {
    if (!selectedImageUrl) {
      showAlert('No certificate image selected.', 'warning');
      return false;
    }

    // If we never got a baseline hash (due to CORS, etc.), warn and continue best-effort
    if (!baselineImageHash || !baselineImageTimestamp || !selectedImageBlob) {
      showAlert(
        'Anti-tamper protection is limited on this certificate (image security settings). Proceeding with best-effort verification.',
        'warning'
      );
      return true;
    }

    // Require a relatively fresh selection
    if (Date.now() - baselineImageTimestamp > ANTI_TAMPER_MAX_AGE_MS) {
      showAlert('Certificate selection is too old. Please reselect the certificate.', 'warning');
      resetSelection();
      return false;
    }

    showProgress(20, 'Rechecking certificate image for tampering...');

    try {
      // Re-fetch the image from its original URL, bypassing cache
      const res = await fetch(selectedImageUrl, { mode: 'cors', cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const blob = await res.blob();
      const currentHash = await calculateImageHash(blob);

      const ok = compareHashes(baselineImageHash, currentHash);
      if (!ok) {
        showAlert('Certificate image changed since selection. Please reload the page and reselect.', 'destructive');
        resetSelection();
        return false;
      }

      // If OK, update our blob to the latest version
      selectedImageBlob = blob;

      showProgress(40, 'Anti-tamper check passed.');
      return true;
    } catch (err) {
      console.error('Anti-tamper error:', err);
      showAlert('Could not verify certificate image integrity. Please reselect.', 'destructive');
      resetSelection();
      return false;
    }
  }

  function resetSelection() {
    selectedImageUrl = null;
    selectedImageBlob = null;
    baselineImageHash = null;
    baselineImageTimestamp = null;

    certificatePreview.innerHTML = `
      <div class="preview-placeholder">
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📸</div>
        <div>Select a certificate image from the page</div>
      </div>
    `;
    certificatePreview.classList.remove('has-image');
    verifyBtn.disabled = true;
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

    isVerifying = true;
    verifyBtn.disabled = true;
    verifySpinner.style.display = 'inline-block';
    verifyBtnText.textContent = 'Verifying...';

    try {
      // Step 1: Anti-tamper check
      showProgress(10, 'Running anti-tamper check...');
      const antiTamperOk = await runAntiTamperCheck();
      if (!antiTamperOk) {
        isVerifying = false;
        verifySpinner.style.display = 'none';
        verifyBtnText.textContent = '✓ Verify Certificate';
        return;
      }

      // Step 2: OCR + backend verification
      showProgress(60, 'Extracting text with OCR...');

      // Convert blob to base64 (if we have it)
      let fileData = null;
      if (selectedImageBlob?.size > 0) {
        const arrayBuffer = await selectedImageBlob.arrayBuffer();
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce(
            (data, byte) => data + String.fromCharCode(byte),
            ''
          )
        );
        fileData = { base64, type: selectedImageBlob.type };
      }

      showProgress(80, 'Analyzing with AI and verification engine...');

      const response = await chrome.runtime.sendMessage({
        action: 'verifyCertificate',
        data: {
          fileData,
          imageUrl: !fileData ? selectedImageUrl : null,
          pageUrl: currentPageUrl
        }
      });

      if (!response || !response.success) {
        throw new Error(response?.error || 'Verification failed');
      }

      showProgress(100, 'Verification complete!');
      setTimeout(() => (progressContainer.style.display = 'none'), 1000);

      displayResult(response.data);
    } catch (error) {
      console.error('Verification error:', error);
      progressContainer.style.display = 'none';
      showAlert(`Verification failed: ${error.message}`, 'destructive');
    } finally {
      isVerifying = false;
      verifyBtn.disabled = !selectedImageUrl;
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

    resetSelection();
    await checkDomain();
  });

  verifyBtn.addEventListener('click', () => {
    if (!verifyBtn.disabled && !isVerifying) {
      verifyCertificate();
    }
  });
})();
