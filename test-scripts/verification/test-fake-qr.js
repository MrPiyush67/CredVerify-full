/**
 * Quick test for fake QR certificate
 */

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const filePath = path.join(process.cwd(), 'certificates-for-test/qr-fake/unverified_QR1.jpg');
const realname = 'Test User';

console.log('🧪 TESTING FAKE QR CODE VERIFICATION');
console.log('📄 Test Certificate: unverified_QR1.jpg');
console.log('   Expected Name:', realname);

// Check if file exists
if (!fs.existsSync(filePath)) {
  console.log('❌ File not found:', filePath);
  process.exit(1);
}

// Read file
const fileBuffer = fs.readFileSync(filePath);
console.log('   ✓ Loaded (' + fileBuffer.length + ' bytes)');

const formData = new FormData();
formData.append('certificateImage', fileBuffer, 'unverified_QR1.jpg');
formData.append('autoSave', 'false');
formData.append('testMode', 'true');
formData.append('testUserName', realname);

console.log('📤 Sending to manual verification endpoint...');

const startTime = Date.now();

fetch('http://localhost:8003/api/credentials/manual-verify', {
  method: 'POST',
  body: formData,
  headers: formData.getHeaders(),
})
  .then(response => {
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    console.log('⏱️  Processing Time: ' + processingTime + 'ms (' + (processingTime / 1000).toFixed(2) + 's)');

    return response.json().then(result => ({ response, result }));
  })
  .then(({ response, result }) => {
    if (!response.ok) {
      console.log('❌ VERIFICATION FAILED');
      console.log('   Status:', response.status);
      console.log('   Error:', result.message);
      console.log('   Full Response:', JSON.stringify(result, null, 2));
    } else {
      console.log('✅ VERIFICATION COMPLETED');
      console.log('📊 RESULTS:');
      console.log('   Overall Score:', result.data.verification.finalScore + '%');
      console.log('   Status:', result.data.verification.status);
      console.log('   Auto-Approved:', result.data.verification.autoApproved ? '✓' : '✗');

      if (result.data.verification.breakdown) {
        console.log('   🔍 Component Scores:');
        console.log('      Name Match:', result.data.verification.breakdown.name + '%');
        console.log('      Domain Trust:', result.data.verification.breakdown.domain + '%');
        console.log('      Metadata Valid:', result.data.verification.breakdown.metadata + '%');
      }

      if (result.data.verificationUrl) {
        console.log('   🔗 QR Code URL:');
        console.log('      ' + result.data.verificationUrl);
      }

      if (result.data.extractedData) {
        const data = result.data.extractedData;
        console.log('   📝 Extracted Information:');
        if (data.recipientName) {
          console.log('      Name:', data.recipientName);
        }
        if (data.courseTitle) log('      Course:', data.courseTitle);
        if (data.issueDate) log('      Issue Date:', data.issueDate);
      }
    }
  })
  .catch(error => {
    console.log('❌ ERROR:', error.message);
  });