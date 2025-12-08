#!/usr/bin/env node

/**
 * CredVerify Test Runner
 * Runs all test suites in sequence
 * 
 * Usage:
 *   npm test              # Run all tests
 *   npm test auth         # Run auth tests only
 *   npm test verification # Run verification tests only
 *   npm test blockchain   # Run blockchain tests only
 *   npm test integration  # Run integration tests only
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(msg, color = 'reset') {
  console.log(`${colors[color]}${msg}${colors.reset}`);
}

async function runTest(testPath, name) {
  return new Promise((resolve, reject) => {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`Running: ${name}`, 'bright');
    log('='.repeat(60), 'cyan');

    const child = spawn('node', [testPath], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        log(`✅ ${name} - PASSED`, 'green');
        resolve();
      } else {
        log(`❌ ${name} - FAILED (exit code: ${code})`, 'red');
        reject(new Error(`Test failed: ${name}`));
      }
    });

    child.on('error', (err) => {
      log(`❌ ${name} - ERROR: ${err.message}`, 'red');
      reject(err);
    });
  });
}

async function runTestSuite() {
  const suite = process.argv[2] || 'all';

  log('\n🧪 CredVerify Test Suite', 'bright');
  log(`Mode: ${suite.toUpperCase()}`, 'cyan');
  log(`Time: ${new Date().toISOString()}\n`, 'cyan');

  const tests = {
    auth: [
      { path: 'authentication/test-auth.js', name: 'Authentication' }
    ],
    verification: [
      { path: 'verification/test-verification-scoring.js', name: 'Verification Scoring' },
      { path: 'verification/test-extension-flow.js', name: 'Extension Verification Flow' },
      { path: 'verification/test-manual-flow.js', name: 'Manual Verification Flow' },
      { path: 'verification/test-all-certificates.js', name: 'All Certificates Batch Test' },
      { path: 'verification/test-single-certificate.js', name: 'Single Certificate Test' },
      { path: 'verification/test-extension-complete-flow.js', name: 'Extension Complete Flow (Auth + Upload)' }
    ],
    blockchain: [
      { path: 'blockchain/test-ipfs.js', name: 'IPFS Upload' },
      { path: 'blockchain/test-blockchain.js', name: 'Blockchain Connection' },
      { path: 'blockchain/test-onchain.js', name: 'On-Chain Registration' },
      { path: 'blockchain/test-full-pipeline.js', name: 'Blockchain Full Pipeline' }
    ],
    integration: [
      { path: 'integration/test-end-to-end.js', name: 'End-to-End Workflow' },
      { path: 'integration/test-digilocker.js', name: 'DigiLocker OAuth' }
    ]
  };

  let testsToRun = [];

  if (suite === 'all') {
    testsToRun = [
      ...tests.auth,
      ...tests.verification,
      ...tests.blockchain,
      ...tests.integration
    ];
  } else if (tests[suite]) {
    testsToRun = tests[suite];
  } else {
    log(`❌ Unknown test suite: ${suite}`, 'red');
    log('\nAvailable suites:', 'yellow');
    log('  - all (default)', 'yellow');
    log('  - auth', 'yellow');
    log('  - verification', 'yellow');
    log('  - blockchain', 'yellow');
    log('  - integration', 'yellow');
    process.exit(1);
  }

  let passed = 0;
  let failed = 0;

  for (const test of testsToRun) {
    const testPath = path.join(__dirname, test.path);

    try {
      await runTest(testPath, test.name);
      passed++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between tests
    } catch (error) {
      failed++;
      log(`\n⚠️  Continuing with remaining tests...\n`, 'yellow');
    }
  }

  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 TEST SUMMARY', 'bright');
  log('='.repeat(60), 'cyan');
  log(`Total: ${passed + failed}`, 'cyan');
  log(`✅ Passed: ${passed}`, 'green');
  log(`❌ Failed: ${failed}`, failed > 0 ? 'red' : 'green');

  if (failed === 0) {
    log('\n🎉 ALL TESTS PASSED!', 'green');
    process.exit(0);
  } else {
    log(`\n⚠️  ${failed} test(s) failed`, 'red');
    process.exit(1);
  }
}

runTestSuite().catch(err => {
  log(`\n❌ Test runner error: ${err.message}`, 'red');
  process.exit(1);
});
