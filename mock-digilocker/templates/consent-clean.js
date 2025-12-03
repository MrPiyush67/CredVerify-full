export function getConsentPageClean(user, clientId, redirectUri, state) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Authorize Access</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #f5f7fa 0%, #e3e7eb 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 500px;
            width: 100%;
            overflow: hidden;
          }
          .header {
            padding: 30px;
            background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%);
            color: white;
            text-align: center;
          }
          .header-icon {
            width: 60px;
            height: 60px;
            background: rgba(255,255,255,0.2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 15px;
          }
          .header h1 {
            font-size: 22px;
            font-weight: 500;
            margin-bottom: 5px;
          }
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          .content {
            padding: 30px;
          }
          .app-info {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 25px;
            border: 1px solid #e5e7eb;
          }
          .app-name {
            font-size: 18px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 8px;
          }
          .app-desc {
            font-size: 14px;
            color: #6b7280;
          }
          .permissions {
            margin-bottom: 25px;
          }
          .permissions h3 {
            font-size: 16px;
            color: #374151;
            margin-bottom: 15px;
            font-weight: 600;
          }
          .permission-item {
            display: flex;
            align-items: flex-start;
            gap: 12px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 6px;
            margin-bottom: 10px;
          }
          .permission-icon {
            width: 20px;
            height: 20px;
            background: #0066cc;
            border-radius: 50%;
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          }
          .permission-text {
            font-size: 14px;
            color: #4b5563;
            line-height: 1.5;
          }
          .user-info {
            background: #eff6ff;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 25px;
            border: 1px solid #dbeafe;
          }
          .user-info-label {
            font-size: 12px;
            color: #6b7280;
            margin-bottom: 5px;
          }
          .user-info-value {
            font-size: 15px;
            color: #1f2937;
            font-weight: 500;
          }
          .actions {
            display: flex;
            gap: 12px;
            margin-top: 25px;
          }
          .btn {
            flex: 1;
            padding: 14px 24px;
            border: none;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
          }
          .btn-deny {
            background: white;
            color: #6b7280;
            border: 2px solid #d1d5db;
          }
          .btn-deny:hover {
            background: #f9fafb;
            border-color: #9ca3af;
          }
          .btn-approve {
            background: #0066cc;
            color: white;
            box-shadow: 0 2px 8px rgba(0, 102, 204, 0.3);
          }
          .btn-approve:hover {
            background: #0052a3;
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
          }
          .notice {
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
          }
          
          /* Toast */
          .toast {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            display: none;
            align-items: center;
            gap: 12px;
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
          }
          .toast.show { display: flex; }
          .toast.success { border-left: 4px solid #10B981; }
          .toast.error { border-left: 4px solid #EF4444; }
          @keyframes slideIn {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="header-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L3 7v4c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
            </div>
            <h1>Authorization Request</h1>
            <p>Review and authorize access</p>
          </div>
          
          <div class="content">
            <div class="app-info">
              <div class="app-name">CredVerify</div>
              <div class="app-desc">wants to access your DigiLocker account</div>
            </div>
            
            <div class="user-info">
              <div class="user-info-label">Signed in as</div>
              <div class="user-info-value">${user.name}</div>
            </div>
            
            <div class="permissions">
              <h3>This application will be able to:</h3>
              <div class="permission-item">
                <div class="permission-icon">✓</div>
                <div class="permission-text">Access your basic profile information (Name, Date of Birth)</div>
              </div>
              <div class="permission-item">
                <div class="permission-icon">✓</div>
                <div class="permission-text">View your uploaded documents and certificates</div>
              </div>
              <div class="permission-item">
                <div class="permission-icon">✓</div>
                <div class="permission-text">Read document metadata and verification status</div>
              </div>
            </div>
            
            <form method="POST" action="/public/oauth2/1/approve" id="approveForm">
              <input type="hidden" name="redirect_uri" value="${redirectUri}" />
              <input type="hidden" name="state" value="${state}" />
              <input type="hidden" name="userId" value="${user.userId}" />
              
              <div class="actions">
                <button type="button" class="btn btn-deny" onclick="handleDeny()">Deny</button>
                <button type="submit" class="btn btn-approve" onclick="handleApprove(event)">Authorize</button>
              </div>
            </form>
            
            <div class="notice">
              By authorizing, you agree to share your information with this application.
            </div>
          </div>
        </div>
        
        <div id="toast" class="toast"></div>
        
        <script>
          function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show ' + type;
            setTimeout(() => toast.classList.remove('show'), 3000);
          }
          
          function handleApprove(event) {
            console.log('✅ User approved access');
            showToast('✅ Access authorized! Loading documents...', 'success');
          }
          
          function handleDeny() {
            if (confirm('Are you sure you want to deny access? CredVerify will not be able to access your DigiLocker documents.')) {
              console.log('❌ User denied access');
              showToast('❌ Access denied', 'error');
              setTimeout(() => {
                window.location.href = '${redirectUri}?error=access_denied&error_description=User+denied+authorization';
              }, 1000);
            }
          }
        </script>
      </body>
    </html>
  `;
}

export function getLoginFailedPage() {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Login Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f5f7fa;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            max-width: 400px;
            width: 100%;
            padding: 40px;
            text-align: center;
          }
          .error-icon {
            width: 60px;
            height: 60px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: #dc2626;
            font-size: 30px;
          }
          h1 {
            font-size: 22px;
            color: #1f2937;
            margin-bottom: 10px;
          }
          p {
            color: #6b7280;
            margin-bottom: 25px;
            line-height: 1.6;
          }
          .btn {
            background: #0066cc;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
          }
          .btn:hover {
            background: #0052a3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">✕</div>
          <h1>Login Failed</h1>
          <p>Invalid credentials. Please try again.</p>
          <a href="javascript:history.back()" class="btn">Go Back</a>
        </div>
      </body>
    </html>
  `;
}
