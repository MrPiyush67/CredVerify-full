import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const CONFIG = {
  BACKEND_URL: 'http://127.0.0.1:5000',
  FILE_PATH: './certificates-for-test/qr-fake/unverified_QR1.jpg'
};

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

async function testFakeQR() {
  console.log(`\n${colors.bright}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.bright}í·ª TESTING FAKE QR CODE - No Valid Link${colors.reset}`);
  console.log(`${colors.bright}${'='.repeat(80)}${colors.reset}\n`);

  const fileBuffer = fs.readFileSync(CONFIG.FILE_PATH);
  console.log(`${colors.cyan}í³„ File: unverified_QR1.jpg (${(fileBuffer.length/1024).toFixed(2)} KB)${colors.reset}`);
  console.log(`${colors.yellow}í³¤ Sending to verification endpoint...${colors.reset}\n`);

  const formData = new FormData();
  formData.append('certificateImage', fileBuffer, 'unverified_QR1.jpg');
  formData.append('autoSave', 'false');
  formData.append('testMode', 'true');
  formData.append('testUserName', 'Test User');

  const startTime = Date.now();
  const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/manual-verify`, {
    method: 'POST',
    body: formData,
    headers: formData.getHeaders(),
  });

  const result = await response.json();
  const processingTime = Date.now() - startTime;

  console.log(`${colors.cyan}â±ï¸  Processing Time: ${processingTime}ms (${(processingTime/1000).toFixed(2)}s)${colors.reset}\n`);

  if (!response.ok) {
    console.log(`${colors.red}âŒ VERIFICATION FAILED${colors.reset}`);
    console.log(`${colors.red}   Status: ${response.status}${colors.reset}`);
    console.log(`${colors.red}   Error: ${result.message}${colors.reset}\n`);
    console.log(`${colors.yellow}   í´ Full Response:${colors.reset}`);
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`${colors.green}âœ… REQUEST COMPLETED${colors.reset}\n`);
    console.log(`${colors.bright}í³Š RESULTS:${colors.reset}`);
    console.log(`${colors.bright}${'='.repeat(80)}${colors.reset}\n`);
    
    const verification = result.data.verification;
    console.log(`   Overall Score: ${colors.cyan}${verification.finalScore}%${colors.reset}`);
    console.log(`   Status: ${colors[verification.status === 'VERIFIED' ? 'green' : 'red']}${verification.status}${colors.reset}`);
    console.log(`   Auto-Approved: ${verification.autoApproved ? 'âœ“' : 'âœ—'}\n`);

    if (result.data.verificationUrl) {
      console.log(`${colors.yellow}   í´— Extracted URL:${colors.reset}`);
      console.log(`      ${result.data.verificationUrl}\n`);
    }

    if (result.data.extractedData) {
      const data = result.data.extractedData;
      console.log(`${colors.yellow}   í³ Extracted Data:${colors.reset}`);
      if (data.recipientName) console.log(`      Name: ${data.recipientName}`);
      if (data.courseTitle) console.log(`      Course: ${data.courseTitle}`);
    }

    if (verification.breakdown) {
      console.log(`\n${colors.yellow}   í´ Component Scores:${colors.reset}`);
      console.log(`      Name Match: ${verification.breakdown.name}%`);
      console.log(`      Domain Trust: ${verification.breakdown.domain}%`);
      console.log(`      Metadata Valid: ${verification.breakdown.metadata}%`);
    }

    if (verification.recommendations) {
      console.log(`\n${colors.yellow}   í²¡ Recommendations:${colors.reset}`);
      verification.recommendations.forEach(rec => console.log(`      ${rec}`));
    }
  }

  console.log(`\n${colors.bright}${'='.repeat(80)}${colors.reset}\n`);
}

testFakeQR().catch(console.error);
