export function getDocumentSelectionPage(user, documents, redirectUri, state) {
  const documentsJson = JSON.stringify(documents);
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>DigiLocker - Select Documents</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #7B2CBF 0%, #5A189A 50%, #3C096C 100%);
            min-height: 100vh;
            padding: 10px;
            position: relative;
            overflow-x: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          body::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 50px 50px;
            animation: drift 20s linear infinite;
            pointer-events: none;
          }
          @keyframes drift {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .container {
            max-width: 900px;
            width: 100%;
            max-height: 95vh;
            margin: 0 auto;
            position: relative;
            z-index: 1;
            display: flex;
            flex-direction: column;
          }
          .header-card {
            background: white;
            border-radius: 16px 16px 0 0;
            padding: 30px 35px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.2);
          }
          .header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 20px;
          }
          .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
          }
          .logo {
            width: 56px;
            height: 56px;
            background: linear-gradient(135deg, #7B2CBF 0%, #5A189A 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 16px rgba(123, 44, 191, 0.3);
          }
          .logo svg {
            width: 32px;
            height: 32px;
          }
          .header-text h1 {
            font-size: 24px;
            color: #1F2937;
            font-weight: 600;
            margin-bottom: 4px;
          }
          .header-text p {
            font-size: 14px;
            color: #6B7280;
          }
          .user-info {
            display: flex;
            align-items: center;
            gap: 10px;
            background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%);
            padding: 10px 18px;
            border-radius: 25px;
            border: 1px solid #D8B4FE;
          }
          .user-info svg {
            width: 20px;
            height: 20px;
            color: #7B2CBF;
          }
          .user-info span {
            font-size: 14px;
            color: #5A189A;
            font-weight: 500;
          }
          .instruction {
            background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
            padding: 18px 20px;
            border-radius: 10px;
            border: 1px solid #93C5FD;
          }
          .instruction p {
            font-size: 14px;
            color: #1E3A8A;
            font-weight: 500;
            margin: 0;
          }
          .content-card {
            background: white;
            border-radius: 0 0 16px 16px;
            padding: 0;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            animation: slideUp 0.5s ease-out;
          }
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .documents-container {
            max-height: calc(95vh - 320px);
            overflow-y: auto;
            padding: 25px 35px;
            flex: 1;
          }
          .documents-container::-webkit-scrollbar {
            width: 8px;
          }
          .documents-container::-webkit-scrollbar-track {
            background: #F3F4F6;
            border-radius: 10px;
          }
          .documents-container::-webkit-scrollbar-thumb {
            background: #D1D5DB;
            border-radius: 10px;
          }
          .documents-container::-webkit-scrollbar-thumb:hover {
            background: #9CA3AF;
          }
          .document-item {
            border: 2px solid #E5E7EB;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 15px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: white;
            position: relative;
          }
          .document-item:hover {
            border-color: #D8B4FE;
            box-shadow: 0 4px 12px rgba(123, 44, 191, 0.1);
            transform: translateY(-2px);
          }
          .document-item.selected {
            border-color: #7B2CBF;
            background: linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%);
            box-shadow: 0 4px 16px rgba(123, 44, 191, 0.2);
          }
          .document-header {
            display: flex;
            align-items: flex-start;
            gap: 15px;
          }
          .checkbox-container {
            margin-top: 4px;
          }
          .checkbox {
            width: 24px;
            height: 24px;
            border: 2px solid #D1D5DB;
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s;
            background: white;
          }
          .document-item.selected .checkbox {
            background: #7B2CBF;
            border-color: #7B2CBF;
          }
          .checkbox svg {
            width: 16px;
            height: 16px;
            color: white;
            opacity: 0;
            transition: opacity 0.2s;
          }
          .document-item.selected .checkbox svg {
            opacity: 1;
          }
          .document-icon {
            width: 48px;
            height: 48px;
            background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
          .document-icon svg {
            width: 28px;
            height: 28px;
            color: #1E40AF;
          }
          .document-info {
            flex: 1;
          }
          .document-title {
            font-size: 16px;
            font-weight: 600;
            color: #1F2937;
            margin-bottom: 8px;
            line-height: 1.4;
          }
          .document-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            margin-bottom: 8px;
          }
          .meta-item {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 13px;
            color: #6B7280;
          }
          .meta-item svg {
            width: 14px;
            height: 14px;
            color: #9CA3AF;
          }
          .document-description {
            font-size: 13px;
            color: #6B7280;
            line-height: 1.5;
            margin-top: 8px;
          }
          .badge {
            display: inline-block;
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .badge-skill {
            background: #FEF3C7;
            color: #92400E;
          }
          .badge-education {
            background: #DBEAFE;
            color: #1E40AF;
          }
          .badge-technology {
            background: #D1FAE5;
            color: #065F46;
          }
          .footer-actions {
            padding: 25px 35px;
            border-top: 2px solid #F3F4F6;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #FAFAFA;
            border-radius: 0 0 16px 16px;
          }
          .selection-count {
            font-size: 14px;
            color: #6B7280;
            font-weight: 500;
          }
          .selection-count strong {
            color: #7B2CBF;
            font-size: 18px;
          }
          .action-buttons {
            display: flex;
            gap: 12px;
          }
          .btn {
            padding: 12px 28px;
            border: none;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: 'Roboto', sans-serif;
            position: relative;
            overflow: hidden;
          }
          .btn::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            transition: left 0.5s;
          }
          .btn:hover::before {
            left: 100%;
          }
          .btn-cancel {
            background: white;
            color: #6B7280;
            border: 2px solid #E5E7EB;
          }
          .btn-cancel:hover {
            background: #F9FAFB;
            border-color: #D1D5DB;
          }
          .btn-submit {
            background: linear-gradient(135deg, #7B2CBF 0%, #5A189A 100%);
            color: white;
            box-shadow: 0 4px 16px rgba(123, 44, 191, 0.3);
            min-width: 180px;
          }
          .btn-submit:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(123, 44, 191, 0.4);
          }
          .btn-submit:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .btn:active {
            transform: translateY(0);
          }
          .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #9CA3AF;
          }
          .empty-state svg {
            width: 64px;
            height: 64px;
            margin-bottom: 16px;
            opacity: 0.5;
          }
          @media (max-width: 768px) {
            .container {
              margin: 20px auto;
            }
            .header-top {
              flex-direction: column;
              align-items: flex-start;
              gap: 15px;
            }
            .document-meta {
              flex-direction: column;
              gap: 8px;
            }
            .footer-actions {
              flex-direction: column;
              gap: 15px;
            }
            .action-buttons {
              width: 100%;
            }
            .btn {
              flex: 1;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header-card">
            <div class="header-top">
              <div class="logo-section">
                <div class="logo">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 7V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V7L12 2Z" fill="white"/>
                    <path d="M10 17L6 13L7.41 11.59L10 14.17L16.59 7.58L18 9L10 17Z" fill="#7B2CBF"/>
                  </svg>
                </div>
                <div class="header-text">
                  <h1>Select Your Documents</h1>
                  <p>Choose documents to share with CredVerify</p>
                </div>
              </div>
              <div class="user-info">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
                <span>${user.name}</span>
              </div>
            </div>
            <div class="instruction">
              <p>📄 Select one or more documents from your DigiLocker to add to your CredVerify account</p>
            </div>
          </div>

          <div class="content-card">
            <div class="documents-container" id="documentsContainer">
              ${documents.length === 0 ? `
                <div class="empty-state">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                  <p>No documents found in your DigiLocker</p>
                </div>
              ` : documents.map((doc, index) => `
                <div class="document-item" data-index="${index}" onclick="toggleDocument(${index})">
                  <div class="document-header">
                    <div class="checkbox-container">
                      <div class="checkbox">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    </div>
                    <div class="document-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10 9 9 9 8 9"></polyline>
                      </svg>
                    </div>
                    <div class="document-info">
                      <div class="document-title">${doc.name || 'Document'}</div>
                      <div class="document-meta">
                        <div class="meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          <span>${doc.issuerName || doc.issuer || 'N/A'}</span>
                        </div>
                        <div class="meta-item">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>${doc.date ? new Date(doc.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>
                        </div>
                        ${doc.category ? `<span class="badge badge-${doc.category}">${doc.category}</span>` : ''}
                        ${doc.nsqfLevel ? `<div class="meta-item"><span>NSQF Level ${doc.nsqfLevel}</span></div>` : ''}
                      </div>
                      ${doc.description ? `<div class="document-description">${doc.description}</div>` : ''}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>

            <div class="footer-actions">
              <div class="selection-count">
                <strong id="selectedCount">0</strong> of <span id="totalCount">${documents.length}</span> selected
              </div>
              <div class="action-buttons">
                <button type="button" class="btn btn-cancel" onclick="cancelSelection()">Cancel</button>
                <button type="button" class="btn btn-submit" id="submitBtn" onclick="submitSelection()" disabled>
                  Continue with Selected
                </button>
              </div>
            </div>
          </div>
        </div>

        <script>
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
            if (confirm('Are you sure you want to cancel? No documents will be imported.')) {
              window.location.href = '${redirectUri}?error=user_cancelled&error_description=User+cancelled+document+selection';
            }
          }

          function submitSelection() {
            console.log('📤 Submitting document selection');
            console.log('Selected document count:', selectedDocuments.size);
            console.log('Selected document IDs:', Array.from(selectedDocuments));
            
            if (selectedDocuments.size === 0) {
              showToast('⚠️ Please select at least one document', 'error');
              return;
            }

            const selected = Array.from(selectedDocuments).map(index => documents[index]);
            
            console.log('📄 Documents to import:', selected.map(d => d.name));
            showToast(\`✅ Importing \${selected.length} document(s) to CredVerify...\`, 'success');
            
            // Submit the form to continue OAuth flow
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = '/public/oauth2/1/confirm-selection';
            
            const redirectInput = document.createElement('input');
            redirectInput.type = 'hidden';
            redirectInput.name = 'redirect_uri';
            redirectInput.value = '${redirectUri}';
            form.appendChild(redirectInput);
            
            const stateInput = document.createElement('input');
            stateInput.type = 'hidden';
            stateInput.name = 'state';
            stateInput.value = '${state || ''}';
            form.appendChild(stateInput);
            
            const userIdInput = document.createElement('input');
            userIdInput.type = 'hidden';
            userIdInput.name = 'userId';
            userIdInput.value = '${user.userId}';
            form.appendChild(userIdInput);
            
            const docsInput = document.createElement('input');
            docsInput.type = 'hidden';
            docsInput.name = 'selectedDocuments';
            docsInput.value = JSON.stringify(selected);
            form.appendChild(docsInput);
            
            console.log('Form data:', {
              redirectUri: '${redirectUri}',
              state: '${state || ''}',
              userId: '${user.userId}',
              documentCount: selected.length
            });
            
            document.body.appendChild(form);
            form.submit();
          }
          
          function showToast(message, type = 'success') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = 'toast show ' + type;
            setTimeout(() => {
              toast.classList.remove('show');
            }, 3000);
          }
        </script>
        
        <!-- Toast Container -->
        <div id="toast" class="toast"></div>
        
        <style>
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
            animation: slideInToast 0.3s ease-out;
          }
          .toast.show {
            display: flex;
          }
          .toast.success {
            border-left: 4px solid #10B981;
          }
          .toast.error {
            border-left: 4px solid #EF4444;
          }
          @keyframes slideInToast {
            from {
              transform: translateX(400px);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        </style>
      </body>
    </html>
  `;
}
