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
 * Usage: node test-scripts/verification/test-extension-complete-flow.js
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
  TEST_DATA_PATH: path.join(__dirname, '../../certificates-for-test/test.json'),
  CERTS_DIR: path.join(__dirname, '../../certificates-for-test'),
  RESULTS_OUTPUT: path.join(__dirname, '../../certificates-for-test/extension-test-results.json'),
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
    log(`\n🔐 Logging in: ${email}`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      log(`   ❌ Login failed: ${result.message}`, 'red');
      return null;
    }

    log(`   ✅ Login successful`, 'green');
    return result.token;

  } catch (error) {
    log(`   ❌ Login error: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Upload certificate via extension endpoint (FormData with file)
 */
async function uploadCertificate(token, testCase) {
  try {
    log(`\n📤 Uploading certificate via extension endpoint...`, 'cyan');

    const imagePath = path.join(CONFIG.CERTS_DIR, testCase['cerf-location'].replace('./', ''));

    // Create FormData
    const formData = new FormData();
    formData.append('certificate', fs.createReadStream(imagePath));
    formData.append('sourceUrl', testCase.url);

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/upload-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      log(`   ❌ Upload failed: ${result.message}`, 'red');
      return { success: false, error: result.message };
    }

    log(`   ✅ Upload successful`, 'green');
    return { success: true, result };

  } catch (error) {
    log(`   ❌ Upload error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Test a single certificate with complete extension flow
 */
async function testCertificateFlow(testCase, index) {
  try {
    log(`\n${'='.repeat(80)}`, 'bright');
    log(`🧪 TEST #${index + 1}: ${testCase.realname}`, 'bright');
    log(`   Certificate: ${testCase['cerf-location']}`, 'cyan');
    log('='.repeat(80), 'bright');

    const startTime = Date.now();

    // Step 1: Create user account
    const account = await createUserAccount(testCase.realname);
    if (!account) {
      return {
        success: false,
        index,
        testCase,
        error: 'Failed to create account',
        step: 'account_creation',
      };
    }

    // Step 2: Login
    const token = await loginUser(account.email, account.password);
    if (!token) {
      return {
        success: false,
        index,
        testCase,
        error: 'Failed to login',
        step: 'login',
      };
    }

    // Step 3: Upload certificate
    const uploadResult = await uploadCertificate(token, testCase);
    if (!uploadResult.success) {
      return {
        success: false,
        index,
        testCase,
        error: uploadResult.error,
        step: 'upload',
      };
    }

    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Display results
    const result = uploadResult.result;
    log(`\n✅ COMPLETE FLOW SUCCESSFUL (${processingTime}ms)`, 'green');
    log(`\n📊 VERIFICATION RESULTS:`, 'bright');
    log(`   Overall Score: ${colors.bright}${result.verificationScore}%${colors.reset}`, 'cyan');
    log(`   Status: ${result.verificationStatus}`, result.verificationStatus === 'verified' ? 'green' : 'yellow');

    if (result.verificationDetails) {
      const details = result.verificationDetails;
      log(`\n   🔍 Component Scores:`, 'yellow');
      if (details.ocrScore !== undefined) log(`      OCR Score: ${details.ocrScore}%`, 'cyan');
      if (details.domainScore !== undefined) log(`      Domain Score: ${details.domainScore}%`, 'cyan');
      if (details.nameScore !== undefined) log(`      Name Match: ${details.nameScore}%`, 'cyan');
      if (details.antiTamperScore !== undefined) log(`      Anti-Tamper: ${details.antiTamperScore}%`, 'cyan');
    }

    if (result.extractedName) log(`\n   Extracted Name: ${result.extractedName}`, 'cyan');
    if (result.extractedOrg) log(`   Organization: ${result.extractedOrg}`, 'cyan');
    if (result.domainMatch !== undefined) log(`   Domain Match: ${result.domainMatch ? '✓' : '✗'}`, result.domainMatch ? 'green' : 'red');

    if (result.warnings && result.warnings.length > 0) {
      log(`\n   ⚠️  Warnings:`, 'yellow');
      result.warnings.forEach(warning => log(`      - ${warning}`, 'yellow'));
    }

    return {
      success: true,
      index,
      testCase,
      account: { email: account.email, existed: account.existed },
      result,
      processingTime,
    };

  } catch (error) {
    log(`❌ ERROR: ${error.message}`, 'red');
    return {
      success: false,
      index,
      testCase,
      error: error.message,
      step: 'unknown',
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n' + '='.repeat(80), 'bright');
  log('🚀 STARTING EXTENSION COMPLETE WORKFLOW TEST SUITE', 'bright');
  log('='.repeat(80) + '\n', 'bright');

  const results = [];
  const startTime = Date.now();

  // Run tests sequentially
  for (let i = 0; i < testData.testCases.length; i++) {
    const testCase = testData.testCases[i];
    const result = await testCertificateFlow(testCase, i);
    results.push(result);

    // Small delay between tests
    if (i < testData.testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  // Generate summary
  generateSummary(results, totalTime);

  // Save results
  saveResults(results);
}

/**
 * Generate and display summary
 */
function generateSummary(results, totalTime) {
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  const verified = results.filter(r => r.success && r.result.verificationStatus === 'verified').length;

  const avgScore = results
    .filter(r => r.success && r.result.verificationScore)
    .reduce((sum, r) => sum + r.result.verificationScore, 0) / (successful || 1);

  const avgTime = results
    .reduce((sum, r) => sum + (r.processingTime || 0), 0) / results.length;

  log('\n' + '='.repeat(80), 'bright');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(80), 'bright');

  log(`\n   Total Tests: ${results.length}`, 'cyan');
  log(`   Successful: ${successful} ${colors.green}✓${colors.reset}`, 'green');
  log(`   Failed: ${failed} ${failed > 0 ? colors.red + '✗' : ''}${colors.reset}`, failed > 0 ? 'red' : 'reset');
  log(`   Verified: ${verified}`, 'green');
  log(`\n   Average Score: ${avgScore.toFixed(2)}%`, 'cyan');
  log(`   Average Time: ${avgTime.toFixed(0)}ms`, 'cyan');
  log(`   Total Time: ${(totalTime / 1000).toFixed(2)}s`, 'cyan');

  if (failed > 0) {
    log(`\n   ❌ Failed Tests:`, 'red');
    results.filter(r => !r.success).forEach(r => {
      log(`      #${r.index + 1}: ${r.testCase.realname} - ${r.error} (${r.step})`, 'red');
    });
  }

  log('\n' + '='.repeat(80) + '\n', 'bright');
}

/**
 * Save results to JSON
 */
function saveResults(results) {
  const output = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    successful: results.filter(r => r.success).length,
    failed: results.filter(r => !r.success).length,
    results: results.map(r => ({
      index: r.index,
      testCase: r.testCase,
      success: r.success,
      processingTime: r.processingTime,
      ...(r.success ? {
        account: r.account,
        verificationScore: r.result.verificationScore,
        verificationStatus: r.result.verificationStatus,
        extractedName: r.result.extractedName,
        extractedOrg: r.result.extractedOrg,
        domainMatch: r.result.domainMatch,
        verificationDetails: r.result.verificationDetails,
        warnings: r.result.warnings,
      } : {
        error: r.error,
        step: r.step,
      }),
    })),
  };

  fs.writeFileSync(CONFIG.RESULTS_OUTPUT, JSON.stringify(output, null, 2));
  log(`💾 Results saved to: ${CONFIG.RESULTS_OUTPUT}`, 'green');
}

// Load test data
let testData;
try {
  testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf-8'));
  log(`📁 Loaded ${testData.testCases.length} test cases from ${CONFIG.TEST_DATA_PATH}`, 'cyan');
} catch (error) {
  log(`❌ Failed to load test data: ${error.message}`, 'red');
  process.exit(1);
}

// Run tests
runAllTests().catch(error => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
