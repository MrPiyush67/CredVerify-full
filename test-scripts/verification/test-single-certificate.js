/**
 * SIMPLE CERTIFICATE VERIFICATION TEST
 * Tests a single certificate from test.json
 * Usage: node test-scripts/verification/test-single-certificate.js [index]
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
  CERTS_DIR: path.join(__dirname, '../../certificates-for-test'),
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
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Convert image file to base64
 */
function imageToBase64(imagePath) {
  const fullPath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(CONFIG.CERTS_DIR, imagePath.replace('./', ''));

  const imageBuffer = fs.readFileSync(fullPath);
  const base64 = imageBuffer.toString('base64');

  // Determine MIME type
  const ext = path.extname(fullPath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png'
    : ext === '.svg' ? 'image/svg+xml'
      : 'image/jpeg';

  return `data:${mimeType};base64,${base64}`;
}

/**
 * Test a single certificate
 */
async function testCertificate(testCase, index) {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log(`🧪 TESTING CERTIFICATE #${index}`, 'bright');
    log('='.repeat(80), 'bright');

    log(`\n📄 Test Case:`, 'yellow');
    log(`   Name: ${testCase.realname}`, 'cyan');
    log(`   URL: ${testCase.url}`, 'cyan');
    log(`   Image: ${testCase['cerf-location']}`, 'cyan');

    // Convert image to base64
    log(`\n🔄 Converting image to base64...`, 'yellow');
    const imageData = imageToBase64(testCase['cerf-location']);
    log(`   ✓ Image converted (${imageData.length} characters)`, 'green');

    // Call verification API
    log(`\n🚀 Sending to verification API...`, 'yellow');
    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageData: imageData,
        sourceUrl: testCase.url,
        imageType: 'base64',
        autoSave: false,
        testMode: true,
        testUserName: testCase.realname,
      }),
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const result = await response.json();

    // Display results
    log(`\n⏱️  Processing Time: ${processingTime}ms`, 'cyan');

    if (!response.ok) {
      log(`\n❌ VERIFICATION FAILED`, 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Error: ${result.message}`, 'red');
      if (result.error) log(`   Code: ${result.error}`, 'red');
      return;
    }

    log(`\n✅ VERIFICATION COMPLETED`, 'green');
    log(`\n📊 RESULTS:`, 'bright');
    log('='.repeat(80), 'bright');

    // Overall score
    log(`\n   Overall Score: ${colors.bright}${colors.cyan}${result.verificationScore}%${colors.reset}`, 'cyan');
    log(`   Status: ${result.verificationStatus}`, result.verificationStatus === 'verified' ? 'green' : 'yellow');

    // Component scores
    if (result.verificationDetails) {
      const details = result.verificationDetails;
      log(`\n   🔍 Component Scores:`, 'yellow');

      if (details.ocrScore !== undefined) {
        log(`      OCR Score: ${details.ocrScore}%`, 'cyan');
      }

      if (details.domainScore !== undefined) {
        log(`      Domain Score: ${details.domainScore}%`, 'cyan');
      }

      if (details.nameScore !== undefined) {
        log(`      Name Match: ${details.nameScore}%`, 'cyan');
      }

      if (details.antiTamperScore !== undefined) {
        log(`      Anti-Tamper: ${details.antiTamperScore}%`, 'cyan');
      }
    }

    // Extracted information
    log(`\n   📝 Extracted Information:`, 'yellow');
    if (result.extractedName) {
      const nameMatch = result.extractedName.toLowerCase() === testCase.realname.toLowerCase();
      log(`      Name: ${result.extractedName} ${nameMatch ? '✓' : '✗'}`, nameMatch ? 'green' : 'yellow');
    }
    if (result.extractedOrg) log(`      Organization: ${result.extractedOrg}`, 'cyan');
    if (result.extractedDate) log(`      Date: ${result.extractedDate}`, 'cyan');
    if (result.extractedCourse) log(`      Course: ${result.extractedCourse}`, 'cyan');

    // Domain validation
    if (result.domainMatch !== undefined) {
      log(`\n   🌐 Domain Validation:`, 'yellow');
      log(`      Match: ${result.domainMatch ? '✓ Verified' : '✗ Mismatch'}`, result.domainMatch ? 'green' : 'red');
      if (result.extractedDomain) log(`      Extracted: ${result.extractedDomain}`, 'cyan');
      if (result.expectedDomain) log(`      Expected: ${result.expectedDomain}`, 'cyan');
    }

    // Anti-tamper analysis
    if (result.antiTamperAnalysis) {
      log(`\n   🔒 Anti-Tamper Analysis:`, 'yellow');
      const analysis = result.antiTamperAnalysis;
      if (analysis.tampered !== undefined) {
        log(`      Tampered: ${analysis.tampered ? '⚠️  Yes' : '✓ No'}`, analysis.tampered ? 'red' : 'green');
      }
      if (analysis.confidence !== undefined) {
        log(`      Confidence: ${analysis.confidence}%`, 'cyan');
      }
    }

    // Warnings
    if (result.warnings && result.warnings.length > 0) {
      log(`\n   ⚠️  Warnings:`, 'yellow');
      result.warnings.forEach(warning => {
        log(`      - ${warning}`, 'yellow');
      });
    }

    // Full result for debugging
    log(`\n   🔍 Full Result (for debugging):`, 'blue');
    log(JSON.stringify(result, null, 2), 'blue');

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
  log(`❌ Invalid test index: ${testIndex}`, 'red');
  log(`   Valid range: 0-${testData.testCases.length - 1}`, 'yellow');
  process.exit(1);
}

// Run test
const testCase = testData.testCases[testIndex];
testCertificate(testCase, testIndex).catch(error => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
