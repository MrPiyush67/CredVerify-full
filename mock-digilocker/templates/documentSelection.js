/**
 * DigiLocker Document Selection Page
 * This mimics the real DigiLocker API document selection UI
 * Real API endpoint: https://digilocker.meripehchaan.gov.in/public/oauth2/1/files
 * 
 * When integrating with real DigiLocker API:
 * 1. Replace mock data with API calls to DigiLocker endpoints
 * 2. Update form action to DigiLocker's OAuth callback
 * 3. Ensure same document structure (uri, name, issuer, date, description)
 */
export function getDocumentSelectionPage(user, documents, redirectUri, state) {
  const documentsJson = JSON.stringify(documents);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Select Documents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f5;
            min-height: 100vh;
            padding: 20px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          .header {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
            background: #0066cc;
            color: white;
            border-radius: 8px 8px 0 0;
          }
          .header h1 { font-size: 20px; margin-bottom: 5px; }
          .header p { font-size: 14px; opacity: 0.9; }
          .user-info {
            padding: 15px 20px;
            background: #f9f9f9;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
            color: #666;
          }
          .documents { padding: 20px; max-height: 500px; overflow-y: auto; }
          .document-item {
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 12px;
            cursor: pointer;
            transition: all 0.2s;
          }
          .document-item:hover { border-color: #0066cc; }
          .document-item.selected {
            border-color: #0066cc;
            background: #f0f7ff;
          }
          .document-header {
            display: flex;
            gap: 12px;
            align-items: start;
          }
          .checkbox {
            width: 20px;
            height: 20px;
            border: 2px solid #ccc;
            border-radius: 4px;
            margin-top: 2px;
            flex-shrink: 0;
          }
          .document-item.selected .checkbox {
            background: #0066cc;
            border-color: #0066cc;
          }
          .document-info { flex: 1; }
          .document-title {
            font-size: 15px;
            font-weight: 600;
            color: #333;
            margin-bottom: 5px;
          }
          .document-meta {
            font-size: 13px;
            color: #666;
            margin-bottom: 4px;
          }
          .footer {
            padding: 15px 20px;
            border-top: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .selection-count { font-size: 14px; color: #666; }
          .btn {
            padding: 10px 20px;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
          }
          .btn-cancel {
            background: #f5f5f5;
            color: #666;
          }
          .btn-submit {
            background: #0066cc;
            color: white;
            margin-left: 10px;
          }
          .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .empty-state {
            text-align: center;
            padding: 40px;
            color: #999;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DigiLocker - Select Documents</h1>
            <p>Choose documents to share with the requesting application</p>
          </div>
          <div class="user-info">Logged in as: ${user.name}</div>
          <div class="documents" id="documentsContainer">
            ${documents.length === 0 ? `
              <div class="empty-state">
                <p>No documents found in your DigiLocker</p>
              </div>
            ` : documents.map((doc, index) => `
              <div class="document-item" data-index="${index}" onclick="toggleDocument(${index})">
                <div class="document-header">
                  <div class="checkbox"></div>
                  <div class="document-info">
                    <div class="document-title">${doc.name || 'Document'}</div>
                    <div class="document-meta">
                      Issuer: ${doc.issuerName || doc.issuer || 'N/A'} | 
                      Date: ${doc.date ? new Date(doc.date).toLocaleDateString('en-IN') : 'N/A'}
                      ${doc.category ? ` | Category: ${doc.category}` : ''}
                    </div>
                    ${doc.description ? `<div class="document-meta">${doc.description}</div>` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
          <div class="footer">
            <div class="selection-count">
              <strong id="selectedCount">0</strong> of ${documents.length} selected
            </div>
            <div>
              <button class="btn btn-cancel" onclick="cancelSelection()">Cancel</button>
              <button class="btn btn-submit" id="submitBtn" onclick="submitSelection()" disabled>
                Continue
              </button>
            </div>
          </div>
        </div>        <script>
          // DigiLocker document selection logic - mimics real API behavior
          const documents = ${documentsJson};
          const selectedDocuments = new Set();

          function toggleDocument(index) {
            const item = document.querySelector(\`.document-item[data-index="\${index}"]\`);
            if (selectedDocuments.has(index)) {
              selectedDocuments.delete(index);
              item.classList.remove('selected');
            } else {
              selectedDocuments.add(index);
              item.classList.add('selected');
            }
            updateUI();
          }

          function updateUI() {
            document.getElementById('selectedCount').textContent = selectedDocuments.size;
            document.getElementById('submitBtn').disabled = selectedDocuments.size === 0;
          }
          
          function cancelSelection() {
            window.location.href = '${redirectUri}?error=access_denied&error_description=User+cancelled';
          }

          function submitSelection() {
            if (selectedDocuments.size === 0) return;
            
            const selected = Array.from(selectedDocuments).map(index => documents[index]);
            
            // POST to OAuth callback - matches DigiLocker flow
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/public/oauth2/1/confirm-selection';
            
            ['redirect_uri', 'state', 'userId', 'selectedDocuments'].forEach(field => {
              const input = document.createElement('input');
              input.type = 'hidden';
              input.name = field;
              input.value = field === 'selectedDocuments' ? JSON.stringify(selected) :
                            field === 'userId' ? '${user.userId}' :
                            field === 'state' ? '${state || ''}' : '${redirectUri}';
              form.appendChild(input);
            });
            
            document.body.appendChild(form);
            form.submit();
          }
        </script>
      </body>
    </html>
  `;
}
