export function getConsentPage(user, redirectUri, state, documentCount) {
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            max-width: 450px;
            width: 100%;
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #10B981 0%, #059669 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .header h2 {
            font-size: 24px;
            margin-bottom: 10px;
          }
          .user-name {
            background: rgba(255,255,255,0.2);
            padding: 8px 16px;
            border-radius: 20px;
            display: inline-block;
            font-size: 14px;
          }
          .content {
            padding: 30px;
          }
          .message {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #10B981;
          }
          .message h3 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 16px;
          }
          .message p {
            color: #475569;
            font-size: 14px;
            line-height: 1.6;
          }
          .actions {
            display: flex;
            gap: 12px;
          }
          .btn {
            flex: 1;
            padding: 14px;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-approve {
            background: #10B981;
            color: white;
          }
          .btn-approve:hover {
            background: #059669;
          }
          .btn-deny {
            background: #f3f4f6;
            color: #6b7280;
          }
          .btn-deny:hover {
            background: #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✓ Login Successful</h2>
            <div class="user-name">${user.name}</div>
          </div>
          <div class="content">
            <div class="message">
              <h3>CredVerify wants to access your DigiLocker</h3>
              <p>You will be able to select which documents to import on the next page.</p>
            </div>
            
            <form method="POST" action="/public/oauth2/1/approve">
              <input type="hidden" name="redirect_uri" value="${redirectUri}" />
              <input type="hidden" name="state" value="${state || ''}" />
              <input type="hidden" name="userId" value="${user.userId}" />
              
              <div class="actions">
                <button type="button" onclick="window.close()" class="btn btn-deny">
                  Cancel
                </button>
                <button type="submit" class="btn btn-approve">
                  Authorize
                </button>
              </div>
            </form>
          </div>
        </div>
      </body>
    </html>
  `;
}

export function getLoginFailedPage(clientId, redirectUri, state, scope) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Login Failed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          .container {
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 450px;
            text-align: center;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          h2 { color: #d32f2f; margin-bottom: 15px; }
          p { color: #666; margin-bottom: 25px; }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: #10B981;
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          }
          .btn:hover {
            background: #059669;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>❌ Login Failed</h2>
          <p>Invalid email or password. Please try again.</p>
          <a href="/public/oauth2/1/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state || ''}&scope=${scope || ''}" class="btn">
            Try Again
          </a>
        </div>
      </body>
    </html>
  `;
}
