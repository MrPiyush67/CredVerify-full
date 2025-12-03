/**
 * EXTENSION COMPLETE WORKFLOW TEST
 * 
 * This script tests the COMPLETE extension verification flow:
 * 1. Creates user accounts for each certificate owner from test.json
 * 2. Logs in each user via extension authentication
 * 3. Simulates extension sending certificate image + URL to backend
 * 4. Validates the complete extension → backend → verification flow
 * 
 * This tests the ACTUAL extension workflow, not just the verification API.
 * 
 * Usage: node certificates-for-test/test-extension-flow.js
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
  BACKEND_URL: 'http://127.0.0.1:5000',
  TEST_DATA_PATH: path.join(__dirname, 'test.json'),
  CERTS_DIR: __dirname,
  RESULTS_OUTPUT: path.join(__dirname, 'extension-test-results.json'),
};

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
    log(`\n👤 Creating account for: ${name}`, 'cyan');
    log(`   Email: ${email}`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: 'credentialist', // Default role
      }),
    });

    const result = await response.json();

    if (response.ok || response.status === 400) {
      // 400 might mean user already exists, which is fine
      if (response.status === 400 && result.message?.includes('already exists')) {
        log(`   ✅ User already exists`, 'yellow');
        return { email, password, existed: true };
      } else if (response.ok) {
        log(`   ✅ Account created successfully`, 'green');
        return { email, password, existed: false };
      }
    }

    log(`   ⚠️  Account creation returned status ${response.status}`, 'yellow');
    return { email, password, existed: true }; // Assume exists and continue

  } catch (error) {
    log(`   ⚠️  Error: ${error.message} (will attempt to login anyway)`, 'yellow');
    return { email, password, existed: true };
  }
}

/**
 * Login user and get auth token (simulates extension login)
 */
async function loginUser(email, password) {
  try {
    log(`\n🔐 Logging in as: ${email}`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Login failed: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    log(`   ✅ Login successful`, 'green');
    log(`   User: ${result.data.user.name}`, 'cyan');
    log(`   Token: ${result.data.token.substring(0, 20)}...`, 'cyan');

    return {
      token: result.data.token,
      user: result.data.user,
    };

  } catch (error) {
    log(`   ❌ Login failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Convert image file to base64 (simulates extension image capture)
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
 * Verify certificate via extension flow (authenticated request)
 */
async function verifyCertificateViaExtension(testCase, authToken, userName) {
  try {
    log(`\n${'='.repeat(80)}`, 'bright');
    log(`📋 EXTENSION VERIFICATION TEST`, 'bright');
    log('='.repeat(80), 'bright');
    log(`Certificate: ${testCase['cerf-location']}`, 'cyan');
    log(`User: ${userName}`, 'cyan');
    log(`Source URL: ${testCase.url}`, 'cyan');

    // Convert image to base64 (simulates extension capturing screenshot)
    const imageData = imageToBase64(testCase['cerf-location']);
    const imageSizeKB = Math.round(imageData.length / 1024);
    log(`\n📸 Image captured: ${imageSizeKB} KB`, 'cyan');

    // Send to backend (simulates extension API call)
    log(`\n🚀 Sending to backend via extension flow...`, 'cyan');
    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`, // Extension sends auth token
      },
      body: JSON.stringify({
        imageData: imageData,
        sourceUrl: testCase.url,
        imageType: 'base64',
        autoSave: true, // Extension auto-saves verified certificates
      }),
    });

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    const result = await response.json();

    // Check result
    if (!response.ok) {
      log(`\n❌ VERIFICATION FAILED (${processingTime}ms)`, 'red');
      log(`   Status: ${response.status}`, 'red');
      log(`   Message: ${result.message}`, 'red');

      if (result.error) {
        log(`   Error: ${result.error}`, 'red');
      }

      return {
        success: false,
        error: result.message,
        errorCode: result.error,
        processingTime,
        testCase,
      };
    }

    // Success
    const data = result.data || {};

    // Handle different response structures
    const verification = data.processing?.verification || data.verification || {};
    const extracted = data.processing?.extractedData || data.extractedData || {};

    const statusIcon = verification.status === 'VERIFIED' ? '✅' : '⚠️';
    log(`\n${statusIcon} ${verification.status} - Score: ${verification.finalScore}% (${processingTime}ms)`,
      verification.status === 'VERIFIED' ? 'green' : 'yellow');

    log(`\n📊 VERIFICATION DETAILS:`, 'cyan');
    log(`   Recipient: ${extracted.recipientName || 'N/A'}`, 'cyan');
    log(`   Issuer: ${extracted.issuerName || 'N/A'}`, 'cyan');
    log(`   Course: ${extracted.courseTitle || 'N/A'}`, 'cyan');
    log(`   Status: ${verification.status}`, verification.status === 'VERIFIED' ? 'green' : 'yellow');
    log(`   Score: ${verification.finalScore}%`, 'cyan');
    log(`   Auto-Approved: ${verification.autoApproved ? 'Yes' : 'No'}`, 'cyan');

    if (data.saved) {
      log(`\n💾 Certificate saved to database`, 'green');
      if (data.credential?._id) {
        log(`   Credential ID: ${data.credential._id}`, 'cyan');
      }
    }

    return {
      success: true,
      verification,
      extracted,
      saved: data.saved,
      credentialId: data.credential?._id,
      processingTime,
      testCase,
    };

  } catch (error) {
    log(`\n❌ EXCEPTION: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
      exception: true,
      testCase,
    };
  }
}

/**
 * Test complete extension flow for one user
 */
async function testUserFlow(testCase, index, total) {
  const userName = testCase.realname;

  log(`\n${'═'.repeat(80)}`, 'magenta');
  log(`🧪 TEST ${index + 1}/${total}: ${userName}`, 'magenta');
  log('═'.repeat(80), 'magenta');

  try {
    // Step 1: Create user account
    const { email, password, existed } = await createUserAccount(userName);

    // Step 2: Login (simulates extension login)
    const { token, user } = await loginUser(email, password);

    // Step 3: Verify certificate via extension flow
    const result = await verifyCertificateViaExtension(testCase, token, user.name);

    return {
      ...result,
      user: {
        name: user.name,
        email: user.email,
        existed,
      },
    };

  } catch (error) {
    log(`\n❌ Flow failed: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
      testCase,
      user: { name: userName, email: generateEmail(userName) },
    };
  }
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  log(`\n\n${'='.repeat(80)}`, 'bright');
  log('📊 EXTENSION FLOW TEST SUMMARY', 'bright');
  log('='.repeat(80), 'bright');

  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const verified = results.filter(r => r.verification?.status === 'VERIFIED').length;
  const saved = results.filter(r => r.saved).length;
  const newUsers = results.filter(r => r.user?.existed === false).length;
  const existingUsers = results.filter(r => r.user?.existed === true).length;

  log(`\n📈 Overall Results:`, 'cyan');
  log(`   Total Tests:        ${total}`, 'cyan');
  log(`   Successful:         ${successful} (${Math.round(successful / total * 100)}%)`, successful === total ? 'green' : 'yellow');
  log(`   Failed:             ${failed} (${Math.round(failed / total * 100)}%)`, failed > 0 ? 'red' : 'cyan');

  log(`\n👥 User Accounts:`, 'cyan');
  log(`   New Accounts:       ${newUsers}`, 'cyan');
  log(`   Existing Accounts:  ${existingUsers}`, 'cyan');

  log(`\n🎯 Verification Status:`, 'cyan');
  log(`   ✅ VERIFIED:        ${verified} (${Math.round(verified / total * 100)}%)`, 'green');
  log(`   💾 Saved to DB:     ${saved} (${Math.round(saved / total * 100)}%)`, 'green');

  if (successful > 0) {
    const avgTime = results
      .filter(r => r.processingTime)
      .reduce((sum, r) => sum + r.processingTime, 0) / successful;

    log(`\n⏱️  Performance:`, 'cyan');
    log(`   Avg Processing Time: ${avgTime.toFixed(0)}ms`, 'cyan');
  }

  // Issues
  const issues = results.filter(r => !r.success);
  if (issues.length > 0) {
    log(`\n⚠️  Issues Detected (${issues.length}):`, 'yellow');
    issues.forEach((issue, idx) => {
      log(`   ${idx + 1}. ${issue.testCase['cerf-location']}`, 'yellow');
      log(`      User: ${issue.user?.name}`, 'yellow');
      log(`      Error: ${issue.error}`, 'yellow');
    });
  }

  // User list
  log(`\n👤 Test User Credentials:`, 'cyan');
  results.forEach((r, idx) => {
    if (r.user) {
      log(`   ${idx + 1}. ${r.user.name}`, 'cyan');
      log(`      Email: ${r.user.email}`, 'cyan');
      log(`      Password: Test@123`, 'cyan');
      log(`      Status: ${r.success ? '✅ Verified' : '❌ Failed'}`, r.success ? 'green' : 'red');
    }
  });

  log(`\n${'='.repeat(80)}`, 'bright');
}

/**
 * Save detailed results
 */
function saveResults(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    summary: {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      verified: results.filter(r => r.verification?.status === 'VERIFIED').length,
      saved: results.filter(r => r.saved).length,
      newUsers: results.filter(r => r.user?.existed === false).length,
    },
    results: results.map(r => ({
      certificate: r.testCase['cerf-location'],
      sourceUrl: r.testCase.url,
      user: r.user,
      success: r.success,
      processingTime: r.processingTime,
      verification: r.verification,
      extractedData: r.extracted,
      saved: r.saved,
      credentialId: r.credentialId,
      error: r.error,
    })),
    testCredentials: {
      email: 'Use format: firstname.lastname@test.credverify.com',
      password: 'Test@123',
    },
  };

  fs.writeFileSync(CONFIG.RESULTS_OUTPUT, JSON.stringify(report, null, 2));
  log(`\n💾 Detailed results saved to: ${CONFIG.RESULTS_OUTPUT}`, 'green');
}

/**
 * Main test runner
 */
async function runExtensionFlowTests() {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log('🚀 EXTENSION COMPLETE WORKFLOW TEST SUITE', 'bright');
    log('='.repeat(80), 'bright');
    log('\nThis tests the COMPLETE extension flow:', 'cyan');
    log('  1. Create user accounts', 'cyan');
    log('  2. Login via extension', 'cyan');
    log('  3. Verify certificates with authentication', 'cyan');
    log('  4. Save to database', 'cyan');

    // Load test data
    const testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf8'));
    log(`\n📋 Loaded ${testData.testCases.length} test cases`, 'green');

    // Run tests
    const results = [];
    for (let i = 0; i < testData.testCases.length; i++) {
      const result = await testUserFlow(testData.testCases[i], i, testData.testCases.length);
      results.push(result);

      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Generate summary
    generateSummary(results);

    // Save results
    saveResults(results);

    log(`\n✅ Extension flow tests completed!`, 'green');
    log('='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runExtensionFlowTests();
