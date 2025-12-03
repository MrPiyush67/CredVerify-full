export function getLoginPage(clientId, redirectUri, state, scope, userEmail, userPassword) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Sign In</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            background:#F2F2F2;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }
          
          .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            max-width: 440px;
            width: 100%;
            overflow: hidden;
          }
          
          .header {
            background: #CFB9F8;
            padding: 40px 30px;
            text-align: center;
            color: white;
          }
          
          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
          }
          
          .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .header p {
            font-size: 14px;
            opacity: 0.9;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .form-group {
            margin-bottom: 24px;
          }
          
          label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            margin-bottom: 8px;
          }
          
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            font-family: 'Inter', sans-serif;
            transition: all 0.2s;
            background: #f9fafb;
          }
          
          input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }
          
          .btn-signin {
            width: 100%;
            padding: 16px;
            background: #0F1729;
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            font-family: 'Inter', sans-serif;
            cursor: pointer;
            transition: all 0.3s;
            margin-top: 8px;
          }
          
          .btn-signin:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
          }
          
          .btn-signin:active {
            transform: translateY(0);
          }
          
          .test-creds {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            border-radius: 10px;
            margin-top: 24px;
          }
          
          .test-creds p {
            font-size: 13px;
            color: #92400e;
            margin-bottom: 8px;
            line-height: 1.6;
          }
          
          .test-creds p:first-child {
            font-weight: 600;
            margin-bottom: 12px;
            font-size: 14px;
          }
          
          .test-creds code {
            background: white;
            padding: 4px 10px;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            color: #92400e;
            font-size: 13px;
            border: 1px solid #fcd34d;
            display: inline-block;
            margin-top: 4px;
          }
          
          .footer {
            text-align: center;
            padding: 20px;
            color: #9ca3af;
            font-size: 12px;
            border-top: 1px solid #e5e7eb;
          }
          
          @media (max-width: 600px) {
            .content {
              padding: 30px 24px;
            }
            .header {
              padding: 32px 24px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <div class="logo">🔐</div>
            <h1>DigiLocker</h1>
            <p>Sign in to access your documents</p>
          </div>

          <!-- Form -->
          <div class="content">
            <form method="POST" action="/public/oauth2/1/login" id="loginForm">
              <input type="hidden" name="client_id" value="${clientId}" />
              <input type="hidden" name="redirect_uri" value="${redirectUri}" />
              <input type="hidden" name="state" value="${state || ''}" />
              <input type="hidden" name="scope" value="${scope || ''}" />
              
              <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email" 
                  placeholder="Enter your email"
                  value="${userEmail}"
                  required
                  autocomplete="username"
                />
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  placeholder="Enter your password"
                  value="${userPassword}"
                  required
                  autocomplete="current-password"
                />
              </div>
              
              <button type="submit" class="btn-signin">Sign In</button>
            </form>
            
            <div class="test-creds">
              <p>🧪 Test Mode - Credentials Pre-filled</p>
              <p>Email: <code>${userEmail}</code></p>
              <p>Password: <code>${userPassword}</code></p>
              <p style="margin-top: 12px; font-size: 12px; opacity: 0.8;">Click "Sign In" to continue →</p>
            </div>
          </div>
          
          <div class="footer">
            Mock DigiLocker Server • Test Environment
          </div>
        </div>
        
        <script>
          console.log('🔐 [DIGILOCKER LOGIN] Page loaded');
          console.log('Client ID:', '${clientId}');
          console.log('Redirect URI:', '${redirectUri}');
          
          document.getElementById('loginForm').addEventListener('submit', function(e) {
            console.log('🔐 [DIGILOCKER LOGIN] Form submitted');
            console.log('Email:', document.getElementById('email').value);
          });
        </script>
      </body>
    </html>
  `;
}
