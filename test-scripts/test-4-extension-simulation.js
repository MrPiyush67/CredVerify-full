/**
 * TEST 4: Extension Simulation
 * 
 * This script simulates the EXACT flow of the extension:
 * 1. Popup gets image URL from page
 * 2. Popup converts to base64 (or sends URL)
 * 3. Popup sends to background script
 * 4. Background script sends to backend
 * 5. Background returns result to popup
 * 6. Popup displays result
 */

const BACKEND_URL = 'http://127.0.0.1:5000';

async function simulateExtensionFlow() {
  console.log('🧪 TEST 4: Extension Flow Simulation\n');
  console.log('=' .repeat(60));
  console.log('This test simulates the EXACT extension workflow');
  console.log('='.repeat(60));

  try {
    // Load test data
    const fs = await import('fs');
    const testData = JSON.parse(fs.readFileSync('./test-data.json', 'utf8'));

    console.log('\n🎬 SIMULATING EXTENSION FLOW...\n');

    // ===== POPUP SCRIPT SIMULATION =====
    console.log('📱 [POPUP] User clicks "Verify Certificate"');
    console.log('📱 [POPUP] Selected image URL:', testData.certificate.imageUrl);
    
    // Simulate popup converting blob to base64
    console.log('📱 [POPUP] Converting image to base64...');
    const fileData = {
      base64: testData.certificate.base64,
      type: testData.certificate.type || 'image/jpeg',
    };
    console.log('📱 [POPUP] ✅ Conversion complete, size:', fileData.base64.length);

    // Simulate popup sending message to background
    console.log('\n📱 [POPUP] Sending message to background script...');
    const messageToBackground = {
      action: 'verifyCertificate',
      data: {
        fileData: fileData,
        imageUrl: null, // Not needed since we have blob
        pageUrl: testData.certificate.pageUrl,
      },
    };
    console.log('📱 [POPUP] Message:', {
      action: messageToBackground.action,
      data: {
        hasFileData: !!messageToBackground.data.fileData,
        fileDataSize: messageToBackground.data.fileData?.base64.length,
        imageUrl: messageToBackground.data.imageUrl,
        pageUrl: messageToBackground.data.pageUrl,
      }
    });

    // ===== BACKGROUND SCRIPT SIMULATION =====
    console.log('\n🔧 [BACKGROUND] Received message from popup');
    console.log('🔧 [BACKGROUND] Action:', messageToBackground.action);
    
    console.log('🔧 [BACKGROUND] Calling handleCertificateVerification()...');
    
    const data = messageToBackground.data;
    
    console.log('🔧 [BACKGROUND] Getting auth token from storage...');
    const authToken = testData.token;
    console.log('🔧 [BACKGROUND] ✅ Token retrieved:', authToken.substring(0, 20) + '...');

    console.log('🔧 [BACKGROUND] Preparing imageData...');
    let imageData = null;
    
    if (data.fileData && data.fileData.base64) {
      imageData = data.fileData.base64;
      console.log('🔧 [BACKGROUND] ✅ Using base64 from fileData, length:', imageData.length);
    } else if (data.imageUrl) {
      console.log('🔧 [BACKGROUND] Fetching image from URL:', data.imageUrl);
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      imageData = Buffer.from(arrayBuffer).toString('base64');
      console.log('🔧 [BACKGROUND] ✅ Converted URL to base64, length:', imageData.length);
    }

    console.log('🔧 [BACKGROUND] Preparing request body...');
    const requestBody = {
      imageData: imageData,
      sourceUrl: data.pageUrl || 'https://unknown.com',
      imageType: 'base64'
    };
    console.log('🔧 [BACKGROUND] Request body:', {
      imageData: requestBody.imageData.substring(0, 50) + '... (' + requestBody.imageData.length + ' chars)',
      sourceUrl: requestBody.sourceUrl,
      imageType: requestBody.imageType,
    });

    // ===== API CALL SIMULATION =====
    console.log('\n🌐 [BACKGROUND] Sending request to backend...');
    console.log('🌐 [BACKGROUND] URL:', `${BACKEND_URL}/api/credentials/verify-certificate`);
    console.log('🌐 [BACKGROUND] Method: POST');
    console.log('🌐 [BACKGROUND] Headers:');
    console.log('    - Authorization: Bearer', authToken.substring(0, 20) + '...');
    console.log('    - Content-Type: application/json');

    const startTime = Date.now();

    const response = await fetch(`${BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;

    console.log('\n🌐 [BACKGROUND] Response received in', duration, 'ms');
    console.log('🌐 [BACKGROUND] Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('\n❌ [BACKGROUND] API Error!');
      console.error('Status:', response.status);
      console.error('Error:', errorData);
      
      console.log('\n🔧 [BACKGROUND] Sending error to popup...');
      const errorResponse = {
        success: false,
        error: errorData.message || `API error: ${response.status}`,
      };
      console.log('📱 [POPUP] Received error:', errorResponse.error);
      console.log('📱 [POPUP] Showing error to user');
      
      return;
    }

    const result = await response.json();
    console.log('🌐 [BACKGROUND] ✅ Success! Received result');

    console.log('\n🔧 [BACKGROUND] Sending result to popup...');
    const successResponse = {
      success: true,
      data: result.data,
    };

    // ===== POPUP RECEIVES RESULT =====
    console.log('\n📱 [POPUP] Received response from background');
    console.log('📱 [POPUP] Success:', successResponse.success);
    
    if (!successResponse.success) {
      console.log('📱 [POPUP] ❌ Showing error:', successResponse.error);
      return;
    }

    console.log('📱 [POPUP] ✅ Verification successful!');
    console.log('📱 [POPUP] Calling displayVerificationResult()...');

    const data_result = successResponse.data;
    
    console.log('\n📱 [POPUP] Displaying result to user:');
    console.log('    - Status:', data_result.verification?.status);
    console.log('    - Score:', data_result.verification?.finalScore + '%');
    console.log('    - Person Name:', data_result.extractedData?.personName);
    console.log('    - Course:', data_result.extractedData?.courseName);
    console.log('    - Issuer:', data_result.extractedData?.issuerName);

    // Display complete result
    console.log('\n' + '='.repeat(60));
    console.log('✅ EXTENSION FLOW SIMULATION COMPLETE!');
    console.log('='.repeat(60));

    console.log('\n📊 FINAL RESULT:');
    console.log(JSON.stringify(data_result, null, 2));

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST 4 PASSED - Extension Flow Works!');
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('1. Test with actual extension');
    console.log('2. Check browser console for any errors');
    console.log('3. If extension shows "Failed to fetch", check:');
    console.log('   - Extension manifest permissions');
    console.log('   - CORS settings in backend');
    console.log('   - Extension is reloaded after code changes');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nError details:', error);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Run test
simulateExtensionFlow();
