export function getHomePage(port, userEmail, userPassword, clientId, clientSecret) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock DigiLocker Server</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
          }
          .card {
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            margin-bottom: 20px;
          }
          h1 { color: #333; margin-bottom: 10px; }
          .status { color: #4caf50; font-weight: 600; }
          code {
            background: #f5f5f5;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
          }
          ul { line-height: 2; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>🔐 Mock DigiLocker Server</h1>
          <p class="status">✅ Server is running on port ${port}</p>
          <p>This is a mock DigiLocker sandbox server for testing OAuth integration locally.</p>
        </div>
        
        <div class="card">
          <h3>📋 Available Endpoints</h3>
          <ul>
            <li><code>GET /public/oauth2/1/authorize</code> - Authorization endpoint</li>
            <li><code>POST /public/oauth2/1/token</code> - Token endpoint</li>
            <li><code>GET /public/oauth2/1/user_info</code> - User info</li>
            <li><code>GET /public/oauth2/1/files</code> - List documents</li>
            <li><code>POST /public/oauth2/1/files/download</code> - Download document</li>
            <li><code>GET /health</code> - Health check</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🔑 Demo Credentials</h3>
          <p>Email: <code>${userEmail}</code></p>
          <p>Password: <code>${userPassword}</code></p>
          <p>Client ID: <code>${clientId}</code></p>
          <p>Client Secret: <code>${clientSecret}</code></p>
        </div>
      </body>
    </html>
  `;
}
