/**
 * LINK-ONLY CERTIFICATE VERIFICATION TEST
 * Tests verification using ONLY the verification link and user's real name
 * Does NOT provide the certificate image - system will scrape the page
 * Usage: node test-scripts/verification/test-link-only.js [index]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://localhost:8003',
  TEST_DATA_PATH: path.join(__dirname, '../../certificates-for-test/test.json'),
};

// Get test case index from command line (default: 0)
const testIndex = parseInt(process.argv[2] || '0', 10);

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
 * Test a single certificate using LINK ONLY
 */
async function testCertificateByLink(testCase, index) {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log(`🧪 TESTING CERTIFICATE #${index} - LINK-ONLY METHOD`, 'bright');
    log('='.repeat(80), 'bright');

    log(`\n📄 Test Case:`, 'yellow');
    log(`   Name: ${testCase.realname}`, 'cyan');
    log(`   URL: ${testCase.url}`, 'cyan');
    log(`   Method: Link verification (no image provided)`, 'magenta');

    // Call manual verification API with ONLY link + name
    log(`\n🚀 Sending to manual verification API...`, 'yellow');
    log(`   Endpoint: POST /api/credentials/manual-verify`, 'cyan');
    log(`   Payload: { link, testMode, testUserName }`, 'cyan');

    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/manual-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        link: testCase.url,
        autoSave: false,
        testMode: true,
        testUserName: testCase.realname,
      }),
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

      // Show full response for debugging
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

    // Extracted information
    if (result.data.extractedData) {
      const data = result.data.extractedData;
      log(`\n   📝 Extracted Information:`, 'yellow');
      if (data.recipientName) {
        const nameMatch = data.recipientName.toLowerCase() === testCase.realname.toLowerCase();
        log(`      Name: ${data.recipientName} ${nameMatch ? '✓' : '✗'}`, nameMatch ? 'green' : 'yellow');
      }
      if (data.courseTitle) log(`      Course: ${data.courseTitle}`, 'cyan');
      if (data.issueDate) log(`      Issue Date: ${data.issueDate}`, 'cyan');
      if (data.completionDate) log(`      Completion Date: ${data.completionDate}`, 'cyan');
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

    // Verification URL used
    if (result.data.verificationUrl) {
      log(`\n   🔗 Verification URL:`, 'yellow');
      log(`      ${result.data.verificationUrl}`, 'cyan');
    }

    log('\n' + '='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ ERROR: ${error.message}`, 'red');
    console.error(error);
  }
}

// Load test data
let testData;
try {
  testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf-8'));
  log(`\n📁 Loaded ${testData.testCases.length} test cases`, 'cyan');
} catch (error) {
  log(`❌ Failed to load test data: ${error.message}`, 'red');
  process.exit(1);
}

// Validate test index
if (testIndex < 0 || testIndex >= testData.testCases.length) {
  log(`❌ Invalid test index: ${testIndex}. Must be between 0 and ${testData.testCases.length - 1}`, 'red');
  process.exit(1);
}

// Run the test
const testCase = testData.testCases[testIndex];
testCertificateByLink(testCase, testIndex)
  .then(() => {
    log('✅ Test completed', 'green');
  })
  .catch(error => {
    log(`❌ Test failed: ${error.message}`, 'red');
    process.exit(1);
  });
