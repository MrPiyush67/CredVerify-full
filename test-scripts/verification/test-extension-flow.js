/**
 * EXTENSION-BASED CERTIFICATE VERIFICATION TEST SYSTEM
 * 
 * This script simulates the complete extension verification flow:
 * 1. Reads test.json with real certificates
 * 2. Processes each through OCR + LLM pipeline
 * 3. Performs domain validation (dual)
 * 4. Performs name matching
 * 5. Calculates verification scores
 * 6. Outputs detailed results for training analysis
 * 
 * Usage: node test-scripts/test-extension-verification.js
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
  TEST_DATA_PATH: path.join(__dirname, '../certificates-for-test/test.json'),
  CERTS_DIR: path.join(__dirname, '../certificates-for-test'),
  RESULTS_OUTPUT: path.join(__dirname, '../certificates-for-test/training-results.json'),
  AUTH_EMAIL: 'priya.sharma@example.com', // Default test user
  AUTH_PASSWORD: 'password123',
};

// Colors for console output
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
 * Authenticate and get JWT token
 */
async function authenticate() {
  try {
    log('\n🔐 Authenticating...', 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: CONFIG.AUTH_EMAIL,
        password: CONFIG.AUTH_PASSWORD,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    log(`✅ Authenticated as: ${data.data.user.name} (${data.data.user.email})`, 'green');

    return {
      token: data.data.token,
      user: data.data.user,
    };
  } catch (error) {
    log(`❌ Authentication failed: ${error.message}`, 'red');
    throw error;
  }
}

/**
 * Convert image file to base64
 */
async function imageToBase64(imagePath) {
  const fullPath = path.isAbsolute(imagePath)
    ? imagePath
    : path.join(CONFIG.CERTS_DIR, imagePath.replace('./', ''));

  const imageBuffer = fs.readFileSync(fullPath);
  return imageBuffer.toString('base64');
}

/**
 * Verify certificate through backend API (simulates extension flow)
 */
async function verifyCertificate(authToken, testCase) {
  try {
    log(`\n📋 Processing: ${testCase['cerf-location']}`, 'cyan');
    log(`   Page URL: ${testCase.url}`, 'cyan');
    log(`   User Name: ${testCase.realname}`, 'cyan');

    // Convert image to base64 (simulates extension behavior)
    const imageData = await imageToBase64(testCase['cerf-location']);

    log(`   Image size: ${imageData.length} characters (base64)`, 'cyan');

    // Call verification API (same as extension does)
    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData,
        sourceUrl: testCase.url,
        imageType: 'base64',
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      // Handle early rejection or errors
      return {
        success: false,
        error: result.error || 'Unknown error',
        details: result,
        testCase: testCase,
      };
    }

    return {
      success: true,
      data: result.data,
      testCase: testCase,
    };

  } catch (error) {
    log(`❌ Error processing certificate: ${error.message}`, 'red');
    return {
      success: false,
      error: error.message,
      testCase: testCase,
    };
  }
}

/**
 * Format and display verification result
 */
function displayResult(result, index) {
  log(`\n${'='.repeat(80)}`, 'bright');
  log(`TEST CASE #${index + 1}: ${result.testCase['cerf-location']}`, 'bright');
  log('='.repeat(80), 'bright');

  if (!result.success) {
    log(`\n❌ VERIFICATION FAILED`, 'red');
    log(`Error: ${result.error}`, 'red');

    if (result.details) {
      log('\nDetails:', 'yellow');
      console.log(JSON.stringify(result.details, null, 2));
    }
    return;
  }

  const data = result.data;
  const verification = data.verification || {};
  const extracted = data.extractedData || {};
  const nameValidation = data.nameValidation || {};
  const domainValidation = data.domainValidation || {};

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

  // Extracted Data
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
  log(`   User Legal Name:     ${nameValidation.legalName || 'N/A'}`, 'yellow');
  log(`   Certificate Name:    ${nameValidation.recipientName || 'N/A'}`, 'yellow');
  log(`   Match Confidence:    ${nameValidation.confidence || 0}%`, 'yellow');
  log(`   Match Reason:        ${nameValidation.reason || 'N/A'}`, 'yellow');

  // Domain Validation
  log(`\n🌐 DOMAIN VALIDATION:`, 'green');
  log(`   Source URL:      ${domainValidation.sourceUrl || 'N/A'}`, 'green');
  log(`   Domain:          ${domainValidation.domain || 'N/A'}`, 'green');
  log(`   Is Trusted:      ${domainValidation.isTrusted ? 'Yes ✅' : 'No ❌'}`, 'green');
  log(`   Issuer:          ${domainValidation.issuer?.name || 'N/A'}`, 'green');
  log(`   Confidence:      ${domainValidation.confidence || 0}%`, 'green');

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

  // Save Status
  log(`\n💾 DATABASE:`, 'cyan');
  log(`   Saved to DB: ${data.saved ? 'Yes ✅' : 'No ❌'}`, 'cyan');
  if (data.credential?._id) {
    log(`   Credential ID: ${data.credential._id}`, 'cyan');
  }
}

/**
 * Generate training analysis report
 */
function generateTrainingReport(results) {
  const report = {
    timestamp: new Date().toISOString(),
    totalTests: results.length,
    summary: {
      successful: 0,
      failed: 0,
      verified: 0,
      reviewRequired: 0,
      rejected: 0,
    },
    issues: {
      ocrFailures: [],
      llmFailures: [],
      nameMismatches: [],
      domainFailures: [],
      lowConfidence: [],
    },
    detailedResults: results,
  };

  results.forEach((result, index) => {
    if (result.success) {
      report.summary.successful++;
      const status = result.data.verification?.status;

      if (status === 'VERIFIED') report.summary.verified++;
      else if (status === 'REVIEW_REQUIRED') report.summary.reviewRequired++;
      else report.summary.rejected++;

      // Identify training issues
      const nameConf = result.data.nameValidation?.confidence || 0;
      const domainConf = result.data.domainValidation?.confidence || 0;
      const finalScore = result.data.verification?.finalScore || 0;

      if (nameConf < 70) {
        report.issues.nameMismatches.push({
          testCase: index + 1,
          file: result.testCase['cerf-location'],
          expected: result.testCase.realname,
          extracted: result.data.extractedData?.recipientName,
          confidence: nameConf,
        });
      }

      if (!result.data.domainValidation?.isTrusted) {
        report.issues.domainFailures.push({
          testCase: index + 1,
          file: result.testCase['cerf-location'],
          domain: result.data.domainValidation?.domain,
          reason: result.data.domainValidation?.reason,
        });
      }

      if (finalScore < 65) {
        report.issues.lowConfidence.push({
          testCase: index + 1,
          file: result.testCase['cerf-location'],
          score: finalScore,
          nameConf,
          domainConf,
        });
      }

    } else {
      report.summary.failed++;

      if (result.error?.includes('OCR')) {
        report.issues.ocrFailures.push({
          testCase: index + 1,
          file: result.testCase['cerf-location'],
          error: result.error,
        });
      } else if (result.error?.includes('LLM')) {
        report.issues.llmFailures.push({
          testCase: index + 1,
          file: result.testCase['cerf-location'],
          error: result.error,
        });
      }
    }
  });

  return report;
}

/**
 * Main test execution
 */
async function runTests() {
  log('\n🚀 EXTENSION VERIFICATION TEST SYSTEM', 'bright');
  log('=====================================\n', 'bright');

  try {
    // Step 1: Load test data
    log('📂 Loading test data...', 'cyan');
    const testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf8'));
    const testCases = testData.testCases || [];

    log(`✅ Loaded ${testCases.length} test cases`, 'green');

    // Step 2: Authenticate
    const auth = await authenticate();

    // Step 3: Process each certificate
    log(`\n🔬 Processing ${testCases.length} certificates...\n`, 'bright');

    const results = [];
    for (let i = 0; i < testCases.length; i++) {
      const result = await verifyCertificate(auth.token, testCases[i]);
      results.push(result);
      displayResult(result, i);

      // Small delay between tests
      if (i < testCases.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Step 4: Generate training report
    log('\n\n📊 GENERATING TRAINING ANALYSIS REPORT...', 'bright');
    const report = generateTrainingReport(results);

    // Save to file
    fs.writeFileSync(CONFIG.RESULTS_OUTPUT, JSON.stringify(report, null, 2));
    log(`✅ Report saved to: ${CONFIG.RESULTS_OUTPUT}`, 'green');

    // Display summary
    log('\n📈 SUMMARY:', 'bright');
    log(`   Total Tests:        ${report.totalTests}`, 'cyan');
    log(`   Successful:         ${report.summary.successful} ✅`, 'green');
    log(`   Failed:             ${report.summary.failed} ❌`, 'red');
    log(`   Verified:           ${report.summary.verified} 🎉`, 'green');
    log(`   Review Required:    ${report.summary.reviewRequired} ⚠️`, 'yellow');
    log(`   Rejected:           ${report.summary.rejected} 🚫`, 'red');

    log('\n🔍 TRAINING ISSUES IDENTIFIED:', 'bright');
    log(`   OCR Failures:       ${report.issues.ocrFailures.length}`, 'red');
    log(`   LLM Failures:       ${report.issues.llmFailures.length}`, 'red');
    log(`   Name Mismatches:    ${report.issues.nameMismatches.length}`, 'yellow');
    log(`   Domain Failures:    ${report.issues.domainFailures.length}`, 'yellow');
    log(`   Low Confidence:     ${report.issues.lowConfidence.length}`, 'yellow');

    log('\n✅ TEST RUN COMPLETE!', 'green');

  } catch (error) {
    log(`\n❌ Test execution failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests
runTests();
