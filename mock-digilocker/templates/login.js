/**
 * DigiLocker Login Page
 * Mimics real DigiLocker login screen
 * Real endpoint: https://digilocker.meripehchaan.gov.in/public/oauth2/1/authorize
 */
export function getLoginPage(clientId, redirectUri, state, scope, userEmail, userPassword) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Sign In</title>
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
            max-width: 400px;
            width: 100%;
          }
          .header {
            background: #0066cc;
            padding: 30px;
            text-align: center;
            color: white;
            border-radius: 8px 8px 0 0;
          }
          .header h1 { font-size: 22px; margin-bottom: 5px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .content { padding: 30px; }
          .form-group { margin-bottom: 20px; }
          label {
            display: block;
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 6px;
          }
          input[type="email"],
          input[type="password"] {
            width: 100%;
            padding: 12px;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            font-size: 14px;
            transition: border-color 0.2s;
          }
          input:focus {
            outline: none;
            border-color: #0066cc;
          }
          .btn-signin {
            width: 100%;
            padding: 14px;
            background: #0066cc;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
          }
          .btn-signin:hover { background: #0052a3; }
          .test-creds {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 15px;
            margin-top: 20px;
            font-size: 13px;
            color: #856404;
          }
          .test-creds p { margin-bottom: 5px; }
          .test-creds code {
            background: white;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: monospace;
          }
          .footer {
            text-align: center;
            padding: 15px;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DigiLocker</h1>
            <p>Sign in to your account</p>
          </div>

          <div class="content">
            <form method="POST" action="/public/oauth2/1/login">
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
                  value="${userEmail}"
                  required
                />
              </div>
              
              <div class="form-group">
                <label for="password">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  name="password" 
                  value="${userPassword}"
                  required
                />
              </div>
              
              <button type="submit" class="btn-signin">Sign In</button>
            </form>
            
            <div class="test-creds">
              <p><strong>🧪 Test Mode - Credentials Pre-filled</strong></p>
              <p>Email: <code>${userEmail}</code></p>
              <p>Password: <code>${userPassword}</code></p>
            </div>
          </div>
          
          <div class="footer">
            Mock DigiLocker Server • Test Environment
          </div>
        </div>
      </body>
    </html>
  `;
}

color: white;
border: none;
border - radius: 10px;
font - size: 16px;
font - weight: 600;
font - family: 'Inter', sans - serif;
cursor: pointer;
transition: all 0.3s;
margin - top: 8px;
          }
          
          .btn - signin:hover {
  transform: translateY(-2px);
  box - shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
}
          
          .btn - signin:active {
  transform: translateY(0);
}
          
          .test - creds {
  background: #fef3c7;
  border - left: 4px solid #f59e0b;
  padding: 20px;
  border - radius: 10px;
  margin - top: 24px;
}
          
          .test - creds p {
  font - size: 13px;
  color: #92400e;
  margin - bottom: 8px;
  line - height: 1.6;
}
          
          .test - creds p: first - child {
  font - weight: 600;
  margin - bottom: 12px;
  font - size: 14px;
}
          
          .test - creds code {
  background: white;
  padding: 4px 10px;
  border - radius: 6px;
  font - family: 'Courier New', monospace;
  color: #92400e;
  font - size: 13px;
  border: 1px solid #fcd34d;
  display: inline - block;
  margin - top: 4px;
}
          
          .footer {
  text - align: center;
  padding: 20px;
  color: #9ca3af;
  font - size: 12px;
  border - top: 1px solid #e5e7eb;
}

@media(max - width: 600px) {
            .content {
    padding: 30px 24px;
  }
            .header {
    padding: 32px 24px;
  }
}
        </style >
      </head >
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
  </body>
    </html >
  `;
}
