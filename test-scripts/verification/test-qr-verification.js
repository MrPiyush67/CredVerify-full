/**
 * QR CODE FULL VERIFICATION TEST
 * Tests complete QR verification: Extract QR → Verify certificate
 * Usage: node test-scripts/verification/test-qr-verification.js [filename] [realname]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';
import FormData from 'form-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:8003',
  QR_CERTS_DIR: path.join(__dirname, '../../certificates-for-test/qr-real'),
};

// Get parameters from command line
const filename = process.argv[2] || 'verified_QR5.jpg';
const realname = process.argv[3] || 'Raunak Mallick';

// Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Test full QR verification workflow
 */
async function testQrVerification(filename, realname) {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log(`🧪 TESTING QR CODE VERIFICATION - FULL WORKFLOW`, 'bright');
    log('='.repeat(80), 'bright');

    const filePath = path.join(CONFIG.QR_CERTS_DIR, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      log(`❌ File not found: ${filePath}`, 'red');
      log(`\n📁 Available files:`, 'yellow');
      const files = fs.readdirSync(CONFIG.QR_CERTS_DIR);
      files.forEach(f => log(`   - ${f}`, 'cyan'));
      return;
    }

    log(`\n📄 Test Certificate:`, 'yellow');
    log(`   File: ${filename}`, 'cyan');
    log(`   Expected Name: ${realname}`, 'cyan');
    log(`   Method: QR Code Verification`, 'magenta');

    // Check file size
    const stats = fs.statSync(filePath);
    log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`, 'cyan');

    // Read file
    log(`\n🔄 Loading certificate image...`, 'yellow');
    const fileBuffer = fs.readFileSync(filePath);
    log(`   ✓ Loaded (${fileBuffer.length} bytes)`, 'green');

    // Create form data with the image
    log(`\n📤 Sending to manual verification endpoint...`, 'yellow');
    log(`   Endpoint: POST /api/credentials/manual-verify`, 'cyan');
    log(`   Flow: QR extraction → Domain validation → Page scraping → OCR → LLM → Verification`, 'cyan');

    const formData = new FormData();
    formData.append('certificateImage', fileBuffer, filename);
    formData.append('autoSave', 'false');
    formData.append('testMode', 'true');
    formData.append('testUserName', realname);

    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/manual-verify`, {
      method: 'POST',
      body: formData,
      headers: formData.getHeaders(),
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const result = await response.json();

    // Display results
    log(`\n⏱️  Processing Time: ${processingTime}ms (${(processingTime / 1000).toFixed(2)}s)`, 'cyan');

    if (!response.ok) {
      log(`\n❌ VERIFICATION FAILED`, 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${result.message}`, 'red');
      if (result.error) log(`   Code: ${result.error}`, 'red');

      log(`\n   🔍 Full Response:`, 'blue');
      log(JSON.stringify(result, null, 2), 'blue');
      return;
    }

    log(`\n✅ VERIFICATION COMPLETED`, 'green');
    log(`\n📊 RESULTS:`, 'bright');
    log('='.repeat(80), 'bright');

    // Overall score
    const verification = result.data.verification;
    log(`\n   Overall Score: ${colors.bright}${colors.cyan}${verification.finalScore}%${colors.reset}`, 'cyan');
    log(`   Status: ${verification.status}`, verification.status === 'VERIFIED' ? 'green' : 'yellow');
    log(`   Auto-Approved: ${verification.autoApproved ? '✓' : '✗'}`, verification.autoApproved ? 'green' : 'yellow');

    // Component scores
    if (verification.breakdown) {
      log(`\n   🔍 Component Scores:`, 'yellow');
      log(`      Name Match: ${verification.breakdown.name}%`, 'cyan');
      log(`      Domain Trust: ${verification.breakdown.domain}%`, 'cyan');
      log(`      Metadata Valid: ${verification.breakdown.metadata}%`, 'cyan');
    }

    // Extracted URL from QR
    if (result.data.verificationUrl) {
      log(`\n   🔗 QR Code URL:`, 'yellow');
      log(`      ${result.data.verificationUrl}`, 'cyan');
    }

    // Extracted information
    if (result.data.extractedData) {
      const data = result.data.extractedData;
      log(`\n   📝 Extracted Information:`, 'yellow');
      if (data.recipientName) {
        const nameMatch = data.recipientName.toLowerCase() === realname.toLowerCase();
        log(`      Name: ${data.recipientName} ${nameMatch ? '✓' : '✗'}`, nameMatch ? 'green' : 'yellow');
      }
      if (data.courseTitle) log(`      Course: ${data.courseTitle}`, 'cyan');
      if (data.issueDate) log(`      Issue Date: ${data.issueDate}`, 'cyan');
      if (data.completionDate) log(`      Completion Date: ${data.completionDate}`, 'cyan');
      if (data.duration) log(`      Duration: ${data.duration}`, 'cyan');
      if (data.skills && data.skills.length > 0) log(`      Skills: ${data.skills.join(', ')}`, 'cyan');
      if (data.description) log(`      Description: ${data.description.substring(0, 100)}...`, 'cyan');
    }

    // Name validation
    if (result.data.nameValidation) {
      const nameVal = result.data.nameValidation;
      log(`\n   👤 Name Validation:`, 'yellow');
      log(`      Match: ${nameVal.match ? '✓ Yes' : '✗ No'}`, nameVal.match ? 'green' : 'red');
      log(`      Confidence: ${nameVal.confidence}%`, 'cyan');
      log(`      Reason: ${nameVal.reason}`, 'cyan');
    }

    // Domain validation
    if (result.data.domainValidation) {
      const domainVal = result.data.domainValidation;
      log(`\n   🌐 Domain Validation:`, 'yellow');
      log(`      Trusted: ${domainVal.isTrusted ? '✓ Yes' : '✗ No'}`, domainVal.isTrusted ? 'green' : 'red');
      log(`      Issuer: ${domainVal.issuer.name}`, 'cyan');
      log(`      Domain: ${domainVal.domain}`, 'cyan');
      log(`      Confidence: ${domainVal.confidence}%`, 'cyan');
    }

    // Recommendations
    if (verification.recommendations && verification.recommendations.length > 0) {
      log(`\n   💡 Recommendations:`, 'yellow');
      verification.recommendations.forEach(rec => {
        log(`      ${rec}`, 'cyan');
      });
    }

    // Candidates analyzed
    if (result.data.candidatesAnalyzed) {
      log(`\n   🖼️  Images Analyzed: ${result.data.candidatesAnalyzed}`, 'yellow');
    }

    log('\n' + '='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run the test
log(`\n📁 QR Certificates Directory: ${CONFIG.QR_CERTS_DIR}`, 'cyan');

testQrVerification(filename, realname)
  .then(() => {
    log('✅ Test completed', 'green');
  })
  .catch(error => {
    log(`❌ Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
