export function getConsentPageMinimal(user, clientId, redirectUri, state) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Authorize</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f8f9fa;
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
            max-width: 420px;
            width: 100%;
            padding: 32px;
          }
          .header {
            text-align: center;
            margin-bottom: 24px;
          }
          .icon {
            width: 48px;
            height: 48px;
            background: #0066cc;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            color: white;
            font-size: 24px;
          }
          h1 {
            font-size: 20px;
            color: #1a1a1a;
            font-weight: 600;
            margin-bottom: 8px;
          }
          .subtitle {
            font-size: 14px;
            color: #666;
          }
          .app-box {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            border-left: 3px solid #0066cc;
          }
          .app-name {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 4px;
          }
          .permissions {
            font-size: 13px;
            color: #666;
            margin-top: 16px;
          }
          .permissions strong {
            display: block;
            margin-bottom: 8px;
            color: #333;
          }
          .permissions ul {
            margin: 0;
            padding-left: 20px;
          }
          .permissions li {
            margin-bottom: 4px;
          }
          .actions {
            display: flex;
            gap: 12px;
            margin-top: 24px;
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
            background: #f1f3f5;
            color: #495057;
          }
          .btn-deny:hover {
            background: #e9ecef;
          }
          .btn-approve {
            background: #0066cc;
            color: white;
          }
          .btn-approve:hover {
            background: #0052a3;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🔐</div>
            <h1>Authorize Access</h1>
            <p class="subtitle">Signed in as <strong>${user.name}</strong></p>
          </div>
          
          <div class="app-box">
            <div class="app-name">CredVerify</div>
            <div style="font-size: 13px; color: #666;">wants to access your DigiLocker</div>
            
            <div class="permissions">
              <strong>Will have access to:</strong>
              <ul>
                <li>Your profile information</li>
                <li>Your documents and certificates</li>
              </ul>
            </div>
          </div>
          
          <form method="POST" action="/public/oauth2/1/approve" id="approveForm">
            <input type="hidden" name="redirect_uri" value="${redirectUri}" />
            <input type="hidden" name="state" value="${state}" />
            <input type="hidden" name="userId" value="${user.userId}" />
            
            <div class="actions">
              <button type="button" class="btn btn-deny" onclick="handleDeny()">Deny</button>
              <button type="submit" class="btn btn-approve">Authorize</button>
            </div>
          </form>
        </div>
        
        <script>
          function handleDeny() {
            if (confirm('Deny access to CredVerify?')) {
              window.location.href = '${redirectUri}?error=access_denied';
            }
          }
          
          console.log('📄 DigiLocker Authorization Page loaded');
          console.log('👤 User:', '${user.name}');
          console.log('🔗 Redirect URI:', '${redirectUri}');
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
            background: #f8f9fa;
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
            max-width: 400px;
            width: 100%;
            padding: 32px;
            text-align: center;
          }
          .error-icon {
            width: 48px;
            height: 48px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 16px;
            color: #dc2626;
            font-size: 24px;
          }
          h1 {
            font-size: 20px;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          p {
            color: #666;
            margin-bottom: 20px;
          }
          .btn {
            background: #0066cc;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
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
