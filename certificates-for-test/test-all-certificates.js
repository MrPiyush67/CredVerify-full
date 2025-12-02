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
  TEST_DATA_PATH: path.join(__dirname, './test.json'),
  CERTS_DIR: path.join(__dirname, '../certificates-for-test'),
  RESULTS_OUTPUT: path.join(__dirname, '../certificates-for-test/test-results.json'),
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
        partialData: result.data,
      };
    }

    const data = result.data || {};
    const verification = data.verification || {};
    const extracted = data.extractedData || {};
    const nameValidation = data.nameValidation || {};

    const statusIcon = verification.status === 'VERIFIED' ? '✅'
      : verification.status === 'REVIEW_REQUIRED' ? '⚠️'
        : '❌';

    log(`${statusIcon} ${verification.status} - Score: ${verification.finalScore}% (${processingTime}ms)`,
      verification.status === 'VERIFIED' ? 'green' : 'yellow');
    log(`   Name: ${extracted.recipientName || 'N/A'} (Match: ${nameValidation.confidence || 0}%)`, 'cyan');
    log(`   Issuer: ${extracted.issuerName || 'N/A'}`, 'cyan');
    log(`   Course: ${extracted.courseTitle || 'N/A'}`, 'cyan');

    return {
      success: true,
      index,
      testCase,
      verification,
      extracted,
      nameValidation,
      domainValidation: data.domainValidation,
      processingTime,
    };

  } catch (error) {
    log(`❌ EXCEPTION: ${error.message}`, 'red');
    return {
      success: false,
      index,
      testCase,
      error: error.message,
      exception: true,
    };
  }
}

/**
 * Generate summary report
 */
function generateSummary(results) {
  log(`\n\n${'='.repeat(80)}`, 'bright');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(80), 'bright');

  const total = results.length;
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success && !r.skipped).length;
  const skipped = results.filter(r => r.skipped).length;
  const verified = results.filter(r => r.verification?.status === 'VERIFIED').length;
  const reviewRequired = results.filter(r => r.verification?.status === 'REVIEW_REQUIRED').length;
  const rejected = results.filter(r => r.verification?.status === 'REJECTED' || r.verification?.status === 'FAILED').length;

  log(`\n📈 Overall Results:`, 'cyan');
  log(`   Total Tests:        ${total}`, 'cyan');
  log(`   Successful:         ${successful} (${Math.round(successful / total * 100)}%)`, 'green');
  log(`   Failed:             ${failed} (${Math.round(failed / total * 100)}%)`, failed > 0 ? 'red' : 'cyan');
  log(`   Skipped:            ${skipped} (${Math.round(skipped / total * 100)}%)`, 'yellow');

  log(`\n🎯 Verification Status:`, 'cyan');
  log(`   ✅ VERIFIED:        ${verified} (${Math.round(verified / total * 100)}%)`, 'green');
  log(`   ⚠️  REVIEW REQUIRED: ${reviewRequired} (${Math.round(reviewRequired / total * 100)}%)`, 'yellow');
  log(`   ❌ REJECTED:        ${rejected} (${Math.round(rejected / total * 100)}%)`, 'red');

  // Calculate average scores
  const verifiedResults = results.filter(r => r.verification);
  if (verifiedResults.length > 0) {
    const avgScore = verifiedResults.reduce((sum, r) => sum + (r.verification.finalScore || 0), 0) / verifiedResults.length;
    const avgNameMatch = verifiedResults.reduce((sum, r) => sum + (r.nameValidation?.confidence || 0), 0) / verifiedResults.length;
    const avgProcessingTime = results.reduce((sum, r) => sum + (r.processingTime || 0), 0) / results.length;

    log(`\n📊 Average Metrics:`, 'cyan');
    log(`   Verification Score: ${avgScore.toFixed(1)}%`, 'cyan');
    log(`   Name Match:         ${avgNameMatch.toFixed(1)}%`, 'cyan');
    log(`   Processing Time:    ${avgProcessingTime.toFixed(0)}ms`, 'cyan');
  }

  // Platform breakdown
  log(`\n🌐 Platform Distribution:`, 'cyan');
  const platformCounts = {};
  results.forEach(r => {
    if (r.extracted?.issuerName) {
      const issuer = r.extracted.issuerName;
      platformCounts[issuer] = (platformCounts[issuer] || 0) + 1;
    }
  });
  Object.entries(platformCounts).sort((a, b) => b[1] - a[1]).forEach(([platform, count]) => {
    log(`   ${platform}: ${count}`, 'cyan');
  });

  // Issues detected
  const issues = results.filter(r => !r.success || r.verification?.status !== 'VERIFIED');
  if (issues.length > 0) {
    log(`\n⚠️  Issues Detected (${issues.length}):`, 'yellow');
    issues.forEach((issue, idx) => {
      log(`   ${idx + 1}. ${issue.testCase['cerf-location']}`, 'yellow');
      log(`      Error: ${issue.error || issue.verification?.reason || 'Unknown'}`, 'yellow');
    });
  }

  // Name matching analysis
  log(`\n👤 Name Matching Analysis:`, 'cyan');
  const nameMatches = results.filter(r => r.nameValidation);
  const perfectMatches = nameMatches.filter(r => r.nameValidation.confidence === 100).length;
  const strongMatches = nameMatches.filter(r => r.nameValidation.confidence >= 80 && r.nameValidation.confidence < 100).length;
  const weakMatches = nameMatches.filter(r => r.nameValidation.confidence < 80).length;

  log(`   Perfect (100%):     ${perfectMatches}`, 'green');
  log(`   Strong (80-99%):    ${strongMatches}`, 'yellow');
  log(`   Weak (<80%):        ${weakMatches}`, weakMatches > 0 ? 'red' : 'cyan');

  log(`\n${'='.repeat(80)}`, 'bright');
}

/**
 * Save detailed results to JSON
 */
function saveResults(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    summary: {
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      verified: results.filter(r => r.verification?.status === 'VERIFIED').length,
      reviewRequired: results.filter(r => r.verification?.status === 'REVIEW_REQUIRED').length,
      rejected: results.filter(r => r.verification?.status === 'REJECTED' || r.verification?.status === 'FAILED').length,
    },
    results: results.map(r => ({
      index: r.index,
      certificate: r.testCase['cerf-location'],
      sourceUrl: r.testCase.url,
      expectedName: r.testCase.realname,
      success: r.success,
      processingTime: r.processingTime,
      verification: r.verification,
      extractedData: r.extracted,
      nameValidation: r.nameValidation,
      domainValidation: r.domainValidation,
      error: r.error,
    })),
  };

  fs.writeFileSync(CONFIG.RESULTS_OUTPUT, JSON.stringify(report, null, 2));
  log(`\n💾 Detailed results saved to: ${CONFIG.RESULTS_OUTPUT}`, 'green');
}

/**
 * Main test runner
 */
let testData;

async function runAllTests() {
  try {
    log('\n' + '='.repeat(80), 'bright');
    log('🚀 CERTIFICATE VERIFICATION TEST SUITE', 'bright');
    log('='.repeat(80), 'bright');

    // Load test data
    testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf8'));
    log(`\n📋 Loaded ${testData.testCases.length} test cases`, 'green');

    // Run tests
    const results = [];
    for (let i = 0; i < testData.testCases.length; i++) {
      const result = await testCertificate(testData.testCases[i], i);
      results.push(result);

      // Small delay between tests to avoid overwhelming the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Generate summary
    generateSummary(results);

    // Save results
    saveResults(results);

    log(`\n✅ All tests completed!`, 'green');
    log('='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Test suite failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run all tests
runAllTests();
