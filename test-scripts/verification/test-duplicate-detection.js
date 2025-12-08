/**
 * DUPLICATE CERTIFICATE DETECTION TEST
 * 
 * Tests the duplicate detection feature:
 * 1. Uploads a certificate for the first time (should succeed)
 * 2. Tries to upload the same certificate again (should be rejected as duplicate)
 * 
 * Usage: node test-scripts/verification/test-duplicate-detection.js [index]
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
  TEST_DATA_PATH: path.join(__dirname, '../../certificates-for-test/test.json'),
  CERTS_DIR: path.join(__dirname, '../../certificates-for-test'),
};

// Get test case index from command line (default: 0 - Pinky Gupta)
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
 * Generate email from name
 */
function generateEmail(name) {
  return name.toLowerCase().replace(/\s+/g, '.') + '@test.credverify.com';
}

/**
 * Create user account
 */
async function createUserAccount(name) {
  const email = generateEmail(name);
  const password = 'Test@123';

  try {
    log(`\n👤 Creating/checking account for: ${name}`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: 'learner',
      }),
    });

    const result = await response.json();

    if (response.ok || response.status === 400) {
      log(`   ✅ Account ready`, 'green');
      return { email, password };
    }

    throw new Error(`Account creation failed: ${result.message}`);
  } catch (error) {
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
    // Return anyway - we'll try to login
    return { email: generateEmail(name), password: 'Test@123' };
  }
}

/**
 * Login user
 */
async function loginUser(email, password) {
  try {
    log(`\n🔐 Logging in...`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Login failed: ${result.message}`);
    }

    log(`   ✅ Login successful`, 'green');
    log(`   Token received: ${result.token ? 'Yes' : 'No'}`, result.token ? 'green' : 'red');

    if (!result.token && result.data?.token) {
      return result.data.token;
    }

    return result.token;
  } catch (error) {
    log(`   ❌ Login error: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Upload certificate via manual verification
 */
async function uploadCertificate(token, testCase, attemptNumber) {
  try {
    log(`\n📤 Upload Attempt #${attemptNumber}`, attemptNumber === 1 ? 'cyan' : 'yellow');
    log(`   URL: ${testCase.url}`, 'cyan');

    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/manual-verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
      },
      body: JSON.stringify({
        link: testCase.url,
        autoSave: true,  // Important: enable auto-save to trigger duplicate check
        testMode: false,  // Real mode to actually save to DB (requires auth)
        testUserName: testCase.realname,
      }),
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const result = await response.json();

    log(`\n   ⏱️  Processing Time: ${processingTime}ms`, 'cyan');

    return {
      success: response.ok,
      status: response.status,
      result,
      processingTime,
    };
  } catch (error) {
    log(`   ❌ Upload error: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Main test function
 */
async function testDuplicateDetection() {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log('🧪 DUPLICATE CERTIFICATE DETECTION TEST', 'bright');
    log('='.repeat(80) + '\n', 'bright');

    // Load test data
    const testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf-8'));
    const testCase = testData.testCases[testIndex];

    if (!testCase) {
      log(`❌ Test case at index ${testIndex} not found`, 'red');
      process.exit(1);
    }

    log(`📄 Test Certificate:`, 'yellow');
    log(`   Name: ${testCase.realname}`, 'cyan');
    log(`   URL: ${testCase.url}`, 'cyan');

    // Step 1: Create account and login
    const account = await createUserAccount(testCase.realname);
    const token = await loginUser(account.email, account.password);

    // Step 2: First upload attempt (should succeed)
    log('\n' + '='.repeat(80), 'bright');
    log('📝 FIRST UPLOAD ATTEMPT (Should Succeed)', 'bright');
    log('='.repeat(80), 'bright');

    const firstAttempt = await uploadCertificate(token, testCase, 1);

    if (firstAttempt.success) {
      log(`\n✅ FIRST UPLOAD SUCCESSFUL`, 'green');
      log(`   Status: ${firstAttempt.status}`, 'green');
      log(`   Verification Score: ${firstAttempt.result.data?.verification?.finalScore}%`, 'green');
      log(`   Verification Status: ${firstAttempt.result.data?.verification?.status}`, 'green');

      if (firstAttempt.result.data?.credential) {
        log(`   Credential ID: ${firstAttempt.result.data.credential._id}`, 'green');
      }
    } else {
      log(`\n⚠️  FIRST UPLOAD FAILED (Unexpected)`, 'yellow');
      log(`   Status: ${firstAttempt.status}`, 'yellow');
      log(`   Error: ${firstAttempt.result.error || firstAttempt.result.message}`, 'yellow');
      log(`\n   Full Response:`, 'blue');
      log(JSON.stringify(firstAttempt.result, null, 2), 'blue');
    }

    // Wait a moment before second attempt
    log(`\n⏳ Waiting 2 seconds before second upload...`, 'cyan');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Second upload attempt (should be rejected as duplicate)
    log('\n' + '='.repeat(80), 'bright');
    log('📝 SECOND UPLOAD ATTEMPT (Should Be Rejected)', 'bright');
    log('='.repeat(80), 'bright');

    const secondAttempt = await uploadCertificate(token, testCase, 2);

    if (!secondAttempt.success && secondAttempt.result.error === 'DUPLICATE_CERTIFICATE') {
      log(`\n✅ DUPLICATE DETECTION WORKING!`, 'green');
      log(`   Status: ${secondAttempt.status} (Conflict)`, 'green');
      log(`   Error: ${secondAttempt.result.error}`, 'green');
      log(`   Message: ${secondAttempt.result.message}`, 'green');

      if (secondAttempt.result.data?.existingCertificate) {
        const existing = secondAttempt.result.data.existingCertificate;
        log(`\n   📋 Existing Certificate Details:`, 'cyan');
        log(`      ID: ${existing.id}`, 'cyan');
        log(`      Title: ${existing.title}`, 'cyan');
        log(`      Issuer: ${existing.issuer}`, 'cyan');
        log(`      Issue Date: ${existing.issueDate}`, 'cyan');
        log(`      Uploaded At: ${existing.uploadedAt}`, 'cyan');
        log(`      Owner: ${existing.owner?.name} (${existing.owner?.email})`, 'cyan');
        log(`      Status: ${existing.verificationStatus}`, 'cyan');
      }

      if (secondAttempt.result.data?.fingerprint) {
        log(`\n   🔑 Fingerprint: ${secondAttempt.result.data.fingerprint}`, 'cyan');
      }

      log(`\n✅ TEST PASSED: Duplicate detection successfully prevented duplicate upload`, 'green');
    } else if (secondAttempt.success) {
      log(`\n❌ TEST FAILED: Second upload succeeded (should have been rejected)`, 'red');
      log(`   Status: ${secondAttempt.status}`, 'red');
      log(`   This indicates duplicate detection is NOT working`, 'red');
    } else {
      log(`\n⚠️  UNEXPECTED ERROR`, 'yellow');
      log(`   Status: ${secondAttempt.status}`, 'yellow');
      log(`   Error: ${secondAttempt.result.error || secondAttempt.result.message}`, 'yellow');
      log(`\n   Full Response:`, 'blue');
      log(JSON.stringify(secondAttempt.result, null, 2), 'blue');
    }

    // Summary
    log('\n' + '='.repeat(80), 'bright');
    log('📊 TEST SUMMARY', 'bright');
    log('='.repeat(80), 'bright');
    log(`\n   First Upload: ${firstAttempt.success ? '✅ Success' : '❌ Failed'}`, firstAttempt.success ? 'green' : 'red');
    log(`   Second Upload: ${!secondAttempt.success && secondAttempt.result.error === 'DUPLICATE_CERTIFICATE' ? '✅ Correctly Rejected' : '❌ Should Have Been Rejected'}`, !secondAttempt.success ? 'green' : 'red');
    log(`\n   Duplicate Detection: ${!secondAttempt.success && secondAttempt.result.error === 'DUPLICATE_CERTIFICATE' ? '✅ WORKING' : '❌ NOT WORKING'}`, !secondAttempt.success ? 'green' : 'red');
    log('\n' + '='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Test failed with error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run test
testDuplicateDetection().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
