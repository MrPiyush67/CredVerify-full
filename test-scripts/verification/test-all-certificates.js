/**
 * TEST ALL CERTIFICATES FROM test.json
 * Runs verification on all certificates and generates a comprehensive report
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
  RESULTS_OUTPUT: path.join(__dirname, '../../certificates-for-test/test-results.json'),
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
    log(`\n${'='.repeat(80)}`, 'bright');
    log(`🧪 TEST #${index + 1}/${testData.testCases.length}: ${testCase['cerf-location']}`, 'bright');
    log('='.repeat(80), 'bright');

    // Convert image to base64 (SVG files will be converted to PNG automatically by backend)
    const imageData = imageToBase64(testCase['cerf-location']);

    // Call verification API
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

    if (!response.ok) {
      log(`❌ FAILED (${processingTime}ms)`, 'red');
      log(`   Error: ${result.message}`, 'red');

      return {
        success: false,
        index,
        testCase,
        error: result.message,
        errorCode: result.error,
        processingTime,
      };
    }

    // Display results
    log(`✅ COMPLETED (${processingTime}ms)`, 'green');
    log(`\n📊 VERIFICATION RESULTS:`, 'bright');
    log(`   Overall Score: ${colors.bright}${result.verificationScore}%${colors.reset}`, 'cyan');

    // Display component scores
    if (result.verificationDetails) {
      const details = result.verificationDetails;
      log(`\n   🔍 Component Scores:`, 'yellow');
      if (details.ocrScore !== undefined) log(`      OCR Score: ${details.ocrScore}%`, 'cyan');
      if (details.domainScore !== undefined) log(`      Domain Score: ${details.domainScore}%`, 'cyan');
      if (details.nameScore !== undefined) log(`      Name Match: ${details.nameScore}%`, 'cyan');
      if (details.antiTamperScore !== undefined) log(`      Anti-Tamper: ${details.antiTamperScore}%`, 'cyan');
    }

    // Display verification status
    log(`\n   📝 Details:`, 'yellow');
    log(`      Status: ${result.verificationStatus}`, result.verificationStatus === 'verified' ? 'green' : 'yellow');
    if (result.extractedName) log(`      Extracted Name: ${result.extractedName}`, 'cyan');
    if (result.extractedOrg) log(`      Organization: ${result.extractedOrg}`, 'cyan');
    if (result.domainMatch !== undefined) log(`      Domain Match: ${result.domainMatch ? '✓' : '✗'}`, result.domainMatch ? 'green' : 'red');

    // Display warnings if any
    if (result.warnings && result.warnings.length > 0) {
      log(`\n   ⚠️  Warnings:`, 'yellow');
      result.warnings.forEach(warning => {
        log(`      - ${warning}`, 'yellow');
      });
    }

    return {
      success: true,
      index,
      testCase,
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
      processingTime: 0,
    };
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  log('\n' + '='.repeat(80), 'bright');
  log('🚀 STARTING CERTIFICATE VERIFICATION TEST SUITE', 'bright');
  log('='.repeat(80) + '\n', 'bright');

  const results = [];
  const startTime = Date.now();

  // Run tests sequentially (to avoid overloading the backend)
  for (let i = 0; i < testData.testCases.length; i++) {
    const testCase = testData.testCases[i];
    const result = await testCertificate(testCase, i);
    results.push(result);

    // Small delay between tests
    if (i < testData.testCases.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
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
  const unverified = results.filter(r => r.success && r.result.verificationStatus !== 'verified').length;

  const avgScore = results
    .filter(r => r.success && r.result.verificationScore)
    .reduce((sum, r) => sum + r.result.verificationScore, 0) / (successful || 1);

  const avgTime = results
    .reduce((sum, r) => sum + r.processingTime, 0) / results.length;

  log('\n' + '='.repeat(80), 'bright');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(80), 'bright');

  log(`\n   Total Tests: ${results.length}`, 'cyan');
  log(`   Successful: ${successful} ${colors.green}✓${colors.reset}`, 'green');
  log(`   Failed: ${failed} ${failed > 0 ? colors.red + '✗' : ''}${colors.reset}`, failed > 0 ? 'red' : 'reset');

  log(`\n   Verified: ${verified}`, 'green');
  log(`   Unverified: ${unverified}`, unverified > 0 ? 'yellow' : 'reset');

  log(`\n   Average Score: ${avgScore.toFixed(2)}%`, 'cyan');
  log(`   Average Time: ${avgTime.toFixed(0)}ms`, 'cyan');
  log(`   Total Time: ${(totalTime / 1000).toFixed(2)}s`, 'cyan');

  // Show failed tests
  if (failed > 0) {
    log(`\n   ❌ Failed Tests:`, 'red');
    results.filter(r => !r.success).forEach(r => {
      log(`      #${r.index + 1}: ${r.testCase['cerf-location']} - ${r.error}`, 'red');
    });
  }

  log('\n' + '='.repeat(80) + '\n', 'bright');
}

/**
 * Save results to JSON file
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
        verificationScore: r.result.verificationScore,
        verificationStatus: r.result.verificationStatus,
        extractedName: r.result.extractedName,
        extractedOrg: r.result.extractedOrg,
        domainMatch: r.result.domainMatch,
        verificationDetails: r.result.verificationDetails,
        warnings: r.result.warnings,
      } : {
        error: r.error,
        errorCode: r.errorCode,
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
