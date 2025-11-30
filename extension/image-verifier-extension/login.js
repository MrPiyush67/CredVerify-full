// Login script for CredVerify Extension

(() => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginBtnText = document.getElementById('loginBtnText');
  const alertContainer = document.getElementById('alertContainer');
  const signupLink = document.getElementById('signupLink');

  // Configuration
  const MAIN_BACKEND_URL = 'http://127.0.0.1:5000'; // Change in production
  const CREDVERIFY_APP_URL = 'http://127.0.0.1:5173'; // Change in production

  // Set signup link
  signupLink.href = `${CREDVERIFY_APP_URL}/auth/signup`;

  // Show alert message
  function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = type === 'error' ? 'error-message' : 'success-message';
    alertDiv.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    // Auto-hide success messages after 2 seconds
    if (type === 'success') {
      setTimeout(() => {
        alertContainer.innerHTML = '';
      }, 2000);
    }
  }

  // Handle login form submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password', 'error');
      return;
    }

    // Disable form
    loginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
    loginSpinner.style.display = 'inline-block';
    loginBtnText.textContent = 'Logging in...';
    alertContainer.innerHTML = '';

    try {
      // Call main backend login endpoint
      const response = await fetch(`${MAIN_BACKEND_URL}/api/users/extension-login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.success || !data.data.token || !data.data.user) {
        throw new Error('Invalid response from server');
      }

      // Store auth data in chrome storage
      await chrome.storage.local.set({
        cv_auth_token: data.data.token,
        cv_auth_user: {
          _id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          avatar: data.data.user.avatar,
        },
        cv_auth_timestamp: Date.now(),
      });

      console.log('Login successful:', data.data.user.name);
      showAlert('Login successful! Redirecting...', 'success');

      // Redirect to main popup after short delay
      setTimeout(() => {
        window.location.href = 'popup-new.html';
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      showAlert(error.message || 'Login failed. Please try again.', 'error');

      // Re-enable form
      loginForm.querySelectorAll('input, button').forEach(el => el.disabled = false);
      loginSpinner.style.display = 'none';
      loginBtnText.textContent = 'Login to CredVerify';
    }
  });

  // Check if already logged in
  chrome.storage.local.get(['cv_auth_token', 'cv_auth_user'], (result) => {
    if (result.cv_auth_token && result.cv_auth_user) {
      // Already logged in, redirect to main popup
      window.location.href = 'popup-new.html';
    }
  });
})();
