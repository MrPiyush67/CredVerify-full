/**
 * SIMPLE CERTIFICATE VERIFICATION TEST
 * Tests a single certificate from test.json
 * Usage: node test-scripts/test-single-certificate.js [index]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  BACKEND_URL: 'http://127.0.0.1:5000',
  TEST_DATA_PATH: path.join(__dirname, '../certificates-for-test/test.json'),
  CERTS_DIR: path.join(__dirname, '../certificates-for-test'),
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
 * Test certificate verification (NO AUTH - Direct API call)
 */
async function testVerification() {
  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf8'));
    const testCase = testData.testCases[testIndex];

    if (!testCase) {
      log(`❌ Test case at index ${testIndex} not found`, 'red');
      log(`Available indices: 0-${testData.testCases.length - 1}`, 'yellow');
      return;
    }

    log('\n' + '='.repeat(80), 'bright');
    log(`🧪 TESTING CERTIFICATE #${testIndex}`, 'bright');
    log('='.repeat(80), 'bright');

    log(`\n📋 Test Case:`, 'cyan');
    log(`   Certificate: ${testCase['cerf-location']}`, 'cyan');
    log(`   Source URL:  ${testCase.url}`, 'cyan');
    log(`   Real Name:   ${testCase.realname}`, 'cyan');

    // Convert image to base64
    log(`\n🖼️  Converting image to base64...`, 'cyan');
    const imageData = imageToBase64(testCase['cerf-location']);
    log(`   ✅ Image size: ${Math.round(imageData.length / 1024)} KB`, 'green');

    // Call verification API endpoint directly (testing OCR + LLM extraction)
    log(`\n🔍 Calling verification API...`, 'cyan');

    const requestBody = {
      imageData: imageData,
      sourceUrl: testCase.url,
      imageType: 'base64',
      autoSave: false, // Don't save during testing
      // For testing: we'll simulate user data in the payload
      testMode: true,
      testUserName: testCase.realname, // This simulates the user's legal name from DB
    };

    log(`\n📤 Request payload:`, 'blue');
    log(`   - imageData: [${Math.round(imageData.length / 1024)} KB base64]`, 'blue');
    log(`   - sourceUrl: ${testCase.url}`, 'blue');
    log(`   - testUserName: ${testCase.realname}`, 'blue');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No auth token - we'll need to modify the endpoint to accept test mode
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json();

    // Display results
    log(`\n📊 RESPONSE STATUS: ${response.status}`, response.ok ? 'green' : 'red');
    log('='.repeat(80), 'bright');

    if (!response.ok) {
      log(`\n❌ VERIFICATION FAILED`, 'red');
      log(`Message: ${result.message}`, 'red');

      if (result.error) {
        log(`\nError Code: ${result.error}`, 'yellow');
      }

      if (result.data) {
        log(`\nPartial Data:`, 'yellow');
        console.log(JSON.stringify(result.data, null, 2));

        // Show certificate URL validation details if available
        if (result.data.certificateUrlValidation) {
          log(`\n🔗 CERTIFICATE URL ISSUE:`, 'red');
          log(`   Extracted URL: ${result.data.certificateUrlValidation.url}`, 'red');
          log(`   Extracted Domain: ${result.data.certificateUrlValidation.domain}`, 'red');
          log(`   Is Trusted: ${result.data.certificateUrlValidation.isTrusted ? 'Yes' : 'No'}`, 'red');
          log(`   Reason: ${result.data.certificateUrlValidation.reason}`, 'red');
        }
      }
      return;
    }

    // Success - display detailed results
    const data = result.data || {};
    const verification = data.verification || {};
    const extracted = data.extractedData || {};
    const nameValidation = data.nameValidation || {};
    const domainValidation = data.domainValidation || {};

    log(`\n✅ VERIFICATION COMPLETE`, 'green');

    // Verification Status
    const statusColor = verification.status === 'VERIFIED' ? 'green'
      : verification.status === 'REVIEW_REQUIRED' ? 'yellow'
        : 'red';

    log(`\n📊 VERIFICATION STATUS: ${verification.status}`, statusColor);
    log(`   Final Score: ${verification.finalScore}%`, statusColor);
    log(`   Auto-Approved: ${verification.autoApproved ? 'Yes' : 'No'}`, statusColor);

    // Confidence Breakdown
    log(`\n🎯 CONFIDENCE BREAKDOWN:`, 'cyan');
    log(`   Name Match:     ${verification.confidence?.name || 0}% (Weight: 60%)`, 'cyan');
    log(`   Domain Trust:   ${verification.confidence?.domain || 0}% (Weight: 30%)`, 'cyan');
    log(`   Metadata Valid: ${verification.confidence?.metadata || 0}% (Weight: 10%)`, 'cyan');

    // Extracted Data (OCR + LLM)
    log(`\n📝 EXTRACTED DATA (OCR + LLM):`, 'blue');
    log(`   Recipient Name:  ${extracted.recipientName || 'N/A'}`, 'blue');
    log(`   Issuer:          ${extracted.issuerName || 'N/A'}`, 'blue');
    log(`   Course Title:    ${extracted.courseTitle || 'N/A'}`, 'blue');
    log(`   Certificate URL: ${extracted.certificateUrl || 'N/A'}`, 'blue');
    log(`   Issue Date:      ${extracted.issueDate || 'N/A'}`, 'blue');
    log(`   Duration:        ${extracted.duration || 'N/A'}`, 'blue');
    log(`   Skills:          ${extracted.skills?.join(', ') || 'N/A'}`, 'blue');

    // Name Validation
    log(`\n👤 NAME VALIDATION:`, 'yellow');
    log(`   Expected Name:       ${testCase.realname}`, 'yellow');
    log(`   Extracted Name:      ${extracted.recipientName || 'N/A'}`, 'yellow');
    log(`   Match Confidence:    ${nameValidation.confidence || 0}%`, 'yellow');
    log(`   Match Result:        ${nameValidation.match ? '✅ MATCH' : '❌ NO MATCH'}`, 'yellow');
    log(`   Reason:              ${nameValidation.reason || 'N/A'}`, 'yellow');

    // Domain Validation
    log(`\n🌐 DOMAIN VALIDATION:`, 'green');
    log(`   Source URL:      ${testCase.url}`, 'green');
    log(`   Extracted Domain: ${domainValidation.domain || 'N/A'}`, 'green');
    log(`   Is Trusted:      ${domainValidation.isTrusted ? '✅ Yes' : '❌ No'}`, 'green');
    log(`   Issuer:          ${domainValidation.issuer?.name || 'N/A'}`, 'green');
    log(`   Category:        ${domainValidation.issuer?.category || 'N/A'}`, 'green');
    log(`   Confidence:      ${domainValidation.confidence || 0}%`, 'green');

    // Certificate URL Validation (if extracted)
    if (extracted.certificateUrl) {
      log(`\n🔗 CERTIFICATE URL VALIDATION:`, 'cyan');
      log(`   Extracted Cert URL: ${extracted.certificateUrl}`, 'cyan');
      log(`   Matches Source URL: ${extracted.certificateUrl === testCase.url ? '✅ Yes' : '❌ No'}`, 'cyan');
    }

    // Recommendations
    if (data.recommendations && data.recommendations.length > 0) {
      log(`\n💡 RECOMMENDATIONS:`, 'cyan');
      data.recommendations.forEach(rec => {
        log(`   • ${rec}`, 'cyan');
      });
    }

    // Warnings
    if (data.warnings && data.warnings.length > 0) {
      log(`\n⚠️  WARNINGS:`, 'yellow');
      data.warnings.forEach(warn => {
        log(`   • ${warn}`, 'yellow');
      });
    }

    log(`\n` + '='.repeat(80), 'bright');
    log(`✅ Test complete for certificate #${testIndex}`, 'green');
    log('='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ TEST FAILED: ${error.message}`, 'red');
    console.error(error);
  }
}

// Run test
testVerification();
