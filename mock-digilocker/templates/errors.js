export function getErrorPage(title, message) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Mock DigiLocker - ${title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
          .error-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          h2 { color: #d32f2f; margin-bottom: 15px; }
          p { color: #666; margin-bottom: 25px; }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="error-icon">❌</div>
          <h2>${title}</h2>
          <p>${message}</p>
        </div>
      </body>
    </html>
  `;
}

export function getInvalidRequestPage() {
  return `
    <html>
      <head><title>Mock DigiLocker - Error</title></head>
      <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #d32f2f;">Error: Invalid Request</h2>
          <p>Missing required parameters: response_type, client_id, or redirect_uri</p>
          <a href="/" style="color: #1976d2;">Go back</a>
        </div>
      </body>
    </html>
  `;
}

export function getInvalidClientPage(expectedClientId) {
  return `
    <html>
      <head><title>Mock DigiLocker - Error</title></head>
      <body style="font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #d32f2f;">Error: Invalid Client</h2>
          <p>The client_id provided is not recognized.</p>
          <p style="font-size: 12px; color: #666;">Expected: ${expectedClientId}</p>
        </div>
      </body>
    </html>
  `;
}
