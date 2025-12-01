/**
 * TEST 3: Verify Certificate API
 * 
 * This script:
 * 1. Reads auth token and image from test-data.json
 * 2. Calls the verification API
 * 3. Shows complete verification result
 * 4. Tests the exact flow the extension uses
 */

const BACKEND_URL = 'http://127.0.0.1:5000';

async function testVerifyAPI() {
  console.log('🧪 TEST 3: Certificate Verification API\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Load test data
    console.log('\n📝 Step 1: Loading test data...');

    const fs = await import('fs');
    let testData;

    try {
      const fileData = fs.readFileSync('./test-data.json', 'utf8');
      testData = JSON.parse(fileData);
    } catch (error) {
      console.error('\n❌ Cannot find test-data.json');
      console.error('Run test-1-auth.js and test-2-fetch-image.js first!');
      return;
    }

    if (!testData.token) {
      console.error('\n❌ No auth token found in test-data.json');
      console.error('Run test-1-auth.js first!');
      return;
    }

    if (!testData.certificate || !testData.certificate.base64) {
      console.error('\n❌ No certificate image data found in test-data.json');
      console.error('Run test-2-fetch-image.js first!');
      return;
    }

    console.log('✅ Test data loaded');
    console.log('  - User:', testData.user.name, `(${testData.user.email})`);
    console.log('  - Token:', testData.token.substring(0, 20) + '...');
    console.log('  - Certificate URL:', testData.certificate.pageUrl);
    console.log('  - Image size:', Math.round(testData.certificate.size / 1024), 'KB');
    console.log('  - Base64 length:', testData.certificate.base64.length);

    // Step 2: Prepare request (exactly like extension)
    console.log('\n📝 Step 2: Preparing verification request...');

    const requestBody = {
      imageData: testData.certificate.base64,
      sourceUrl: testData.certificate.pageUrl,
      imageType: 'base64'
    };

    console.log('Request body structure:');
    console.log('  - imageData:', requestBody.imageData.substring(0, 50) + '... (' + requestBody.imageData.length + ' chars)');
    console.log('  - sourceUrl:', requestBody.sourceUrl);
    console.log('  - imageType:', requestBody.imageType);

    // Step 3: Send verification request
    console.log('\n📝 Step 3: Sending verification request...');
    console.log('Endpoint:', `${BACKEND_URL}/api/credentials/verify-certificate`);
    console.log('Method: POST');
    console.log('Headers:');
    console.log('  - Authorization: Bearer', testData.token.substring(0, 20) + '...');
    console.log('  - Content-Type: application/json');

    const startTime = Date.now();

    const response = await fetch(`${BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testData.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    console.log('\n⏱️  Response received in:', duration, 'ms');
    console.log('Status:', response.status, response.statusText);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));

    // Step 4: Parse response
    console.log('\n📝 Step 4: Parsing response...');

    let result;
    const responseText = await response.text();

    try {
      result = JSON.parse(responseText);
    } catch (error) {
      console.error('\n❌ Response is not valid JSON!');
      console.error('Raw response:', responseText);
      throw error;
    }

    if (!response.ok) {
      console.error('\n❌ Verification failed!');
      console.error('Status:', response.status);
      console.error('Error:', result);
      return;
    }

    console.log('✅ Verification successful!');

    // Step 5: Display results
    console.log('\n' + '='.repeat(60));
    console.log('📊 VERIFICATION RESULTS');
    console.log('='.repeat(60));

    console.log('\n🎯 Overall Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.data) {
      const data = result.data;

      // Check if credential was saved
      if (data.saved) {
        console.log('\n💾 CERTIFICATE SAVED TO DATABASE!');
        console.log('  - Credential ID:', data.credential?._id || 'N/A');
        console.log('  - Status:', data.credential?.verificationStatus || 'N/A');
        console.log('  - Score:', data.credential?.finalVerificationScore || 0, '%');
        console.log('  - Auto-Approved:', data.credential?.autoApproved || false);
      }

      console.log('\n📋 Extracted Data:');
      console.log('  - Person Name:', data.processing?.extractedData?.personName || 'N/A');
      console.log('  - Course Name:', data.processing?.extractedData?.certificateName || 'N/A');
      console.log('  - Issuer:', data.processing?.extractedData?.issuerName || 'N/A');
      console.log('  - Company:', data.processing?.extractedData?.companyName || 'N/A');
      console.log('  - Certificate ID:', data.processing?.extractedData?.certificateId || 'N/A');
      console.log('  - Issue Date:', data.processing?.extractedData?.issueDate || 'N/A');

      console.log('\n🔍 Verification Status:');
      console.log('  - Status:', data.processing?.verification?.status || 'N/A');
      console.log('  - Final Score:', data.processing?.verification?.finalScore || 0, '%');
      console.log('  - Auto Approved:', data.processing?.verification?.autoApproved || false);
      console.log('  - Requires Review:', data.processing?.verification?.requiresReview || false);
      console.log('  - Reason:', data.processing?.verification?.reason || 'N/A');

      console.log('\n📊 Confidence Breakdown:');
      if (data.processing?.verification?.confidence) {
        console.log('  - Name Match:', data.processing.verification.confidence.name, '% (Weight: 60%)');
        console.log('  - Domain Validation:', data.processing.verification.confidence.domain, '% (Weight: 30%)');
        console.log('  - Metadata:', data.processing.verification.confidence.metadata, '% (Weight: 10%)');
      }

      console.log('  - Match:', data.processing?.nameValidation?.match ? 'YES' : 'NO');
      console.log('  - Confidence:', data.processing?.nameValidation?.confidence || 0, '%');
      console.log('  - Reason:', data.processing?.nameValidation?.reason || 'N/A');

      console.log('\n🌐 Domain Validation:');
      console.log('  - Source URL:', data.processing?.domainValidation?.sourceUrl || 'N/A');
      console.log('  - Domain:', data.processing?.domainValidation?.domain || 'N/A');
      console.log('  - Is Trusted:', data.processing?.domainValidation?.isTrusted ? 'YES' : 'NO');
      console.log('  - Confidence:', data.processing?.domainValidation?.confidence || 0, '%');
      console.log('  - Reason:', data.processing?.domainValidation?.reason || 'N/A');

      if (data.processing?.recommendations && data.processing.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        data.processing.recommendations.forEach(rec => console.log('  •', rec));
      }

      if (data.processing?.warnings && data.processing.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        data.processing.warnings.forEach(warn => console.log('  •', warn));
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST 3 PASSED - Verification API Working!');
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('1. Test extension directly');
    console.log('2. Run: node test-4-extension-simulation.js');

    // Save result for analysis
    testData.verificationResult = {
      response: result,
      timestamp: new Date().toISOString(),
      duration: duration,
    };

    fs.writeFileSync(
      './test-data.json',
      JSON.stringify(testData, null, 2)
    );

    console.log('\n💾 Results saved to test-data.json');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);

    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Backend server is not running!');
      console.error('Start it with: cd backend && npm run dev');
    } else {
      console.error('\nError details:', error);
      if (error.stack) {
        console.error('\nStack trace:', error.stack);
      }
    }
  }
}

// Run test
testVerifyAPI();
