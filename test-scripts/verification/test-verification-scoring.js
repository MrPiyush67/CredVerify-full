/**
 * Test the new weighted verification system
 * Run: node test-verification-system.js
 */

import {
  calculateFinalVerificationScore,
  determineVerificationStatus,
} from '../backend/src/features/credential/verification/verification.service.js';

console.log('🧪 Testing Weighted Verification System\n');
console.log('='.repeat(60));

// Test scenarios based on ChatGPT recommendations
const testCases = [
  {
    name: 'Scenario 1: Perfect Match (Should VERIFY)',
    nameConfidence: 95,
    domainConfidence: 100,
    metadataValid: true,
    expectedStatus: 'VERIFIED',
  },
  {
    name: 'Scenario 2: High Confidence (Should VERIFY)',
    nameConfidence: 87,
    domainConfidence: 90,
    metadataValid: true,
    expectedStatus: 'VERIFIED',
  },
  {
    name: 'Scenario 3: Borderline Auto-Verify (Should VERIFY)',
    nameConfidence: 85,
    domainConfidence: 70,
    metadataValid: true,
    expectedStatus: 'VERIFIED',
  },
  {
    name: 'Scenario 4: Moderate Confidence (Should REVIEW_REQUIRED)',
    nameConfidence: 75,
    domainConfidence: 65,
    metadataValid: true,
    expectedStatus: 'REVIEW_REQUIRED',
  },
  {
    name: 'Scenario 5: Name OK, Domain Low (Should REVIEW_REQUIRED)',
    nameConfidence: 80,
    domainConfidence: 55,
    metadataValid: true,
    expectedStatus: 'REVIEW_REQUIRED',
  },
  {
    name: 'Scenario 6: Low Name Match (Should REJECT)',
    nameConfidence: 55,
    domainConfidence: 100,
    metadataValid: true,
    expectedStatus: 'REJECTED',
  },
  {
    name: 'Scenario 7: Low Overall Score (Should REJECT)',
    nameConfidence: 60,
    domainConfidence: 50,
    metadataValid: false,
    expectedStatus: 'REJECTED',
  },
  {
    name: 'Scenario 8: Missing Metadata (Should REVIEW_REQUIRED)',
    nameConfidence: 88,
    domainConfidence: 95,
    metadataValid: false,
    expectedStatus: 'REVIEW_REQUIRED',
  },
  {
    name: 'Scenario 9: Real Example - Coursera Certificate',
    nameConfidence: 92,
    domainConfidence: 100, // Whitelisted
    metadataValid: true,
    expectedStatus: 'VERIFIED',
  },
  {
    name: 'Scenario 10: Real Example - Unstop (BUIRINC) Certificate',
    nameConfidence: 78,
    domainConfidence: 60, // Fuzzy match unstop.com ↔ BUIRINC
    metadataValid: true,
    expectedStatus: 'REVIEW_REQUIRED',
  },
];

let passedTests = 0;
let failedTests = 0;

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log('-'.repeat(60));

  // Calculate scores
  const scoreResult = calculateFinalVerificationScore(
    testCase.nameConfidence,
    testCase.domainConfidence,
    testCase.metadataValid
  );

  // Determine status
  const decision = determineVerificationStatus(
    scoreResult.finalScore,
    testCase.nameConfidence,
    testCase.domainConfidence,
    testCase.metadataValid
  );

  // Display results
  console.log(`Input:`);
  console.log(`  - Name Confidence: ${testCase.nameConfidence}%`);
  console.log(`  - Domain Confidence: ${testCase.domainConfidence}%`);
  console.log(`  - Metadata Valid: ${testCase.metadataValid}`);
  console.log();
  console.log(`Calculated Scores:`);
  console.log(`  - Name Score: ${scoreResult.breakdown.name}% × 60% = ${Math.round(scoreResult.breakdown.name * 0.6)}%`);
  console.log(`  - Domain Score: ${scoreResult.breakdown.domain}% × 30% = ${Math.round(scoreResult.breakdown.domain * 0.3)}%`);
  console.log(`  - Metadata Score: ${scoreResult.breakdown.metadata}% × 10% = ${Math.round(scoreResult.breakdown.metadata * 0.1)}%`);
  console.log(`  - Final Score: ${scoreResult.finalScore}%`);
  console.log();
  console.log(`Decision:`);
  console.log(`  - Status: ${decision.status}`);
  console.log(`  - Auto-Approved: ${decision.autoApproved}`);
  console.log(`  - Requires Review: ${decision.requiresReview}`);
  console.log(`  - Reason: ${decision.reason}`);
  console.log();
  console.log(`Recommendations:`);
  decision.recommendations.forEach((rec) => console.log(`  ${rec}`));

  // Verify expected result
  const passed = decision.status === testCase.expectedStatus;
  if (passed) {
    console.log(`\n✅ PASS: Got expected status '${testCase.expectedStatus}'`);
    passedTests++;
  } else {
    console.log(`\n❌ FAIL: Expected '${testCase.expectedStatus}', got '${decision.status}'`);
    failedTests++;
  }
});

console.log('\n' + '='.repeat(60));
console.log(`\n📊 Test Results Summary:`);
console.log(`  ✅ Passed: ${passedTests}/${testCases.length}`);
console.log(`  ❌ Failed: ${failedTests}/${testCases.length}`);
console.log(`  Success Rate: ${Math.round((passedTests / testCases.length) * 100)}%`);

if (failedTests === 0) {
  console.log(`\n🎉 All tests passed! The weighted verification system is working correctly.`);
} else {
  console.log(`\n⚠️ Some tests failed. Please review the thresholds and logic.`);
}

console.log('\n' + '='.repeat(60));
