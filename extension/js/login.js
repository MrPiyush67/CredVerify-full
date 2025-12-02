// CredVerify Extension - Login

(() => {
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginBtnText = document.getElementById('loginBtnText');
  const alertContainer = document.getElementById('alertContainer');
  const signupLink = document.getElementById('signupLink');

  // Set signup link
  signupLink.href = `${CONFIG.current.FRONTEND}/auth/signup`;

  // Show alert
  function showAlert(message, type = 'error') {
    const alertDiv = document.createElement('div');
    alertDiv.className = type === 'error' ? 'error-message' : 'success-message';
    alertDiv.textContent = message;
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alertDiv);

    if (type === 'success') {
      setTimeout(() => alertContainer.innerHTML = '', 2000);
    }
  }

  // Handle login
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showAlert('Please enter both email and password');
      return;
    }

    // Disable form
    loginForm.querySelectorAll('input, button').forEach(el => el.disabled = true);
    loginSpinner.style.display = 'inline-block';
    loginBtnText.textContent = 'Logging in...';
    alertContainer.innerHTML = '';

    try {
      const response = await fetch(CONFIG.url(CONFIG.API.LOGIN), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Store auth data
      await chrome.storage.local.set({
        cv_auth_token: data.data.token,
        cv_auth_user: {
          _id: data.data.user._id,
          name: data.data.user.name,
          email: data.data.user.email,
          role: data.data.user.role,
          avatar: data.data.user.avatar
        },
        cv_auth_timestamp: Date.now()
      });

      showAlert('Login successful! Redirecting...', 'success');
      setTimeout(() => window.location.href = 'popup.html', 1000);

    } catch (error) {
      showAlert(error.message || 'Login failed. Please try again.');
      loginForm.querySelectorAll('input, button').forEach(el => el.disabled = false);
      loginSpinner.style.display = 'none';
      loginBtnText.textContent = 'Login to CredVerify';
    }
  });

  // Check if already logged in
  chrome.storage.local.get(['cv_auth_token', 'cv_auth_user'], (result) => {
    if (result.cv_auth_token && result.cv_auth_user) {
      window.location.href = 'popup.html';
    }
  });
})();
