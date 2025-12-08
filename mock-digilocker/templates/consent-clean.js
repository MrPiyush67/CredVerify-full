/**
 * DigiLocker Consent Page
 * Mimics real DigiLocker authorization consent screen
 * Real endpoint: https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize
 */
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            max-width: 480px;
            width: 100%;
          }
          .header {
            padding: 25px;
            background: #0066cc;
            color: white;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .header h1 { font-size: 20px; margin-bottom: 5px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 25px; }
          .app-info {
            background: #f9f9f9;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid #e0e0e0;
          }
          .app-name { font-size: 16px; font-weight: 600; color: #333; margin-bottom: 5px; }
          .app-desc { font-size: 14px; color: #666; }
          .user-info {
            background: #f0f7ff;
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
            border: 1px solid #d0e7ff;
          }
          .user-info-label { font-size: 12px; color: #666; margin-bottom: 3px; }
          .user-info-value { font-size: 14px; color: #333; font-weight: 500; }
          .permissions { margin-bottom: 20px; }
          .permissions h3 { font-size: 15px; color: #333; margin-bottom: 12px; font-weight: 600; }
          .permission-item {
            display: flex;
            gap: 10px;
            padding: 10px;
            background: #f9f9f9;
            border-radius: 4px;
            margin-bottom: 8px;
          }
          .permission-icon {
            width: 18px;
            height: 18px;
            background: #0066cc;
            border-radius: 50%;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            flex-shrink: 0;
          }
          .permission-text { font-size: 13px; color: #555; line-height: 1.4; }
          .actions {
            display: flex;
            gap: 10px;
            margin-top: 20px;
          }
          .btn {
            flex: 1;
            padding: 12px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-deny {
            background: #f5f5f5;
            color: #666;
            border: 2px solid #ddd;
          }
          .btn-deny:hover { background: #ebebeb; }
          .btn-approve {
            background: #0066cc;
            color: white;
          }
          .btn-approve:hover { background: #0052a3; }
          .notice {
            text-align: center;
            font-size: 12px;
            color: #999;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Authorization Request</h1>
            <p>DigiLocker</p>
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
                <div class="permission-text">Access your basic profile information</div>
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
            
            <form method="POST" action="/public/oauth2/1/approve">
              <input type="hidden" name="redirect_uri" value="${redirectUri}" />
              <input type="hidden" name="state" value="${state}" />
              <input type="hidden" name="userId" value="${user.userId}" />
              
              <div class="actions">
                <button type="button" class="btn btn-deny" onclick="handleDeny()">Deny</button>
                <button type="submit" class="btn btn-approve">Authorize</button>
              </div>
            </form>
            
            <div class="notice">
              By authorizing, you agree to share your information with this application.
            </div>
          </div>
        </div>
        
        <script>
          function handleDeny() {
            if (confirm('Are you sure you want to deny access?')) {
              window.location.href = '${redirectUri}?error=access_denied&error_description=User+denied+authorization';
            }
          }
        </script>
      </body>
    </html>
  `;
}
