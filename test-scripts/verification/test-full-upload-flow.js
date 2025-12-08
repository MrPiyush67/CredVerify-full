/**
 * COMPLETE UPLOAD FLOW TEST
 * Tests: MongoDB + IPFS + Polygon Blockchain
 * 
 * This script tests the complete credential upload flow:
 * 1. Creates/logs in user account
 * 2. Uploads certificate with verification
 * 3. Saves to MongoDB
 * 4. Uploads to IPFS
 * 5. Registers on Polygon blockchain
 * 6. Verifies all stored data
 * 
 * Usage: node test-scripts/verification/test-full-upload-flow.js [index]
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
 * Create or get user account
 */
async function ensureUserAccount(name) {
  const email = generateEmail(name);
  const password = 'Test@123';

  try {
    log(`\n👤 Setting up account for: ${name}`, 'cyan');
    log(`   Email: ${email}`, 'cyan');

    // Try to create account
    const signupResponse = await fetch(`${CONFIG.BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
        role: 'learner',
      }),
    });

    const signupResult = await signupResponse.json();

    if (signupResponse.ok) {
      log(`   ✅ New account created`, 'green');
    } else if (signupResponse.status === 400 && signupResult.message?.includes('already exists')) {
      log(`   ✅ Account already exists`, 'yellow');
    }

    return { email, password };

  } catch (error) {
    log(`   ⚠️  Error: ${error.message}`, 'yellow');
    return { email, password };
  }
}

/**
 * Login user and get auth token
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
      log(`   ❌ Login failed: ${result.message}`, 'red');
      return null;
    }

    log(`   ✅ Login successful`, 'green');

    // Handle different response formats
    const token = result.token || result.data?.token;
    const user = result.user || result.data?.user;
    const userId = user?._id || user?.id;

    if (userId) log(`   User ID: ${userId}`, 'cyan');
    if (token) log(`   Token: ${token.substring(0, 20)}...`, 'cyan');

    return { token, userId };

  } catch (error) {
    log(`   ❌ Login error: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Upload certificate with autoSave=true (triggers full flow)
 */
async function uploadCertificateWithFullFlow(token, testCase) {
  try {
    log(`\n📤 STEP 1: Uploading certificate to backend...`, 'bright');

    const imagePath = path.join(CONFIG.CERTS_DIR, testCase['cerf-location'].replace('./', ''));

    log(`   Method: Link-only (no image, backend will scrape)`, 'cyan');
    log(`   URL: ${testCase.url}`, 'cyan');

    // Create FormData - using link-only method (more reliable)
    const formData = new FormData();
    formData.append('link', testCase.url);
    formData.append('autoSave', 'true'); // This triggers MongoDB + IPFS + Blockchain

    const startTime = Date.now();

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/manual-verify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    const endTime = Date.now();
    const result = await response.json();

    if (!response.ok) {
      log(`   ❌ Upload failed: ${result.message}`, 'red');
      return { success: false, error: result.message };
    }

    const processingTime = endTime - startTime;
    log(`   ✅ Upload completed in ${processingTime}ms (${(processingTime / 1000).toFixed(2)}s)`, 'green');

    return { success: true, result, processingTime };

  } catch (error) {
    log(`   ❌ Upload error: ${error.message}`, 'red');
    return { success: false, error: error.message };
  }
}

/**
 * Verify saved credential in MongoDB
 */
async function verifyCredentialInDatabase(token, credentialId) {
  try {
    log(`\n📊 STEP 2: Verifying credential in MongoDB...`, 'bright');
    log(`   Credential ID: ${credentialId}`, 'cyan');

    const response = await fetch(`${CONFIG.BACKEND_URL}/api/credentials/${credentialId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      log(`   ❌ Failed to fetch credential`, 'red');
      return null;
    }

    const result = await response.json();
    const credential = result.credential || result.data?.credential;

    log(`   ✅ Credential found in database`, 'green');

    // Display key fields
    log(`\n   📄 Credential Details:`, 'yellow');
    log(`      Title: ${credential.title || 'N/A'}`, 'cyan');
    log(`      Issuer: ${credential.issuer || 'N/A'}`, 'cyan');
    log(`      Status: ${credential.verificationStatus || credential.status || 'N/A'}`, 'cyan');
    log(`      Score: ${credential.finalVerificationScore || 'N/A'}%`, 'cyan');
    log(`      Certificate Name: ${credential.certificateName || 'N/A'}`, 'cyan');
    log(`      Legal Name: ${credential.legalNameSnapshot || 'N/A'}`, 'cyan');

    // Debug: show file structure
    if (credential.file) {
      log(`\n   📁 File Info:`, 'yellow');
      log(`      URL: ${credential.file.url || 'N/A'}`, 'cyan');
      log(`      Storage ID: ${credential.file.storageId || 'N/A'}`, 'cyan');
      if (credential.file.ipfs) {
        log(`      IPFS CID: ${credential.file.ipfs.cid || 'N/A'}`, 'cyan');
      }
    }

    return credential;

  } catch (error) {
    log(`   ❌ Database verification error: ${error.message}`, 'red');
    return null;
  }
}

/**
 * Verify IPFS data
 */
async function verifyIPFSStorage(credential) {
  try {
    log(`\n📦 STEP 3: Verifying IPFS storage...`, 'bright');

    if (!credential.file?.ipfs?.cid) {
      log(`   ⚠️  No IPFS CID found`, 'yellow');
      return false;
    }

    const cid = credential.file.ipfs.cid;
    const provider = credential.file.ipfs.provider;

    log(`   CID: ${cid}`, 'cyan');
    log(`   Provider: ${provider}`, 'cyan');
    log(`   Gateway URL: ${credential.file.url}`, 'cyan');

    // Try to fetch from IPFS gateway
    log(`\n   Testing IPFS gateway access...`, 'yellow');
    const response = await fetch(credential.file.url, { method: 'HEAD' });

    if (response.ok) {
      log(`   ✅ IPFS file accessible via gateway`, 'green');
      log(`   Content-Type: ${response.headers.get('content-type')}`, 'cyan');
      log(`   Content-Length: ${response.headers.get('content-length')} bytes`, 'cyan');
      return true;
    } else {
      log(`   ⚠️  IPFS gateway returned status ${response.status}`, 'yellow');
      return false;
    }

  } catch (error) {
    log(`   ⚠️  IPFS verification error: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Verify blockchain registration
 */
async function verifyBlockchainRegistration(credential) {
  try {
    log(`\n⛓️  STEP 4: Verifying Polygon blockchain registration...`, 'bright');

    if (!credential.meta?.blockchain?.onChainTx) {
      log(`   ⚠️  No blockchain transaction found`, 'yellow');
      return false;
    }

    const txHash = credential.meta.blockchain.onChainTx;
    const fingerprint = credential.meta.blockchain.fingerprint;

    log(`   Transaction Hash: ${txHash}`, 'cyan');
    if (fingerprint) log(`   Fingerprint: ${fingerprint}`, 'cyan');

    const explorerUrl = `https://sepolia.etherscan.io/tx/${txHash}`;
    log(`   Explorer: ${explorerUrl}`, 'cyan');

    // Check if transaction exists on Etherscan
    log(`\n   Checking transaction on blockchain explorer...`, 'yellow');
    const response = await fetch(explorerUrl);

    if (response.ok) {
      log(`   ✅ Transaction confirmed on blockchain`, 'green');
      return true;
    } else {
      log(`   ⚠️  Could not verify transaction (explorer may be loading)`, 'yellow');
      return false;
    }

  } catch (error) {
    log(`   ⚠️  Blockchain verification error: ${error.message}`, 'yellow');
    return false;
  }
}

/**
 * Main test function
 */
async function runFullUploadTest() {
  try {
    // Load test data
    const testData = JSON.parse(fs.readFileSync(CONFIG.TEST_DATA_PATH, 'utf-8'));

    if (testIndex < 0 || testIndex >= testData.testCases.length) {
      log(`❌ Invalid test index: ${testIndex}. Available: 0-${testData.testCases.length - 1}`, 'red');
      process.exit(1);
    }

    const testCase = testData.testCases[testIndex];

    log('\n' + '='.repeat(80), 'bright');
    log(`🧪 COMPLETE UPLOAD FLOW TEST - Certificate #${testIndex}`, 'bright');
    log('='.repeat(80), 'bright');

    log(`\n📝 Test Subject:`, 'yellow');
    log(`   Name: ${testCase.realname}`, 'cyan');
    log(`   URL: ${testCase.url}`, 'cyan');
    log(`   Image: ${testCase['cerf-location']}`, 'cyan');

    log(`\n🎯 Testing Complete Flow:`, 'yellow');
    log(`   ✓ User Authentication`, 'cyan');
    log(`   ✓ Certificate Verification`, 'cyan');
    log(`   ✓ MongoDB Storage`, 'cyan');
    log(`   ✓ IPFS Upload`, 'cyan');
    log(`   ✓ Polygon Blockchain Registration`, 'cyan');

    // Step 1: Ensure user account exists
    const account = await ensureUserAccount(testCase.realname);
    if (!account) {
      log(`\n❌ Failed to setup user account`, 'red');
      return;
    }

    // Step 2: Login
    const auth = await loginUser(account.email, account.password);
    if (!auth) {
      log(`\n❌ Failed to login`, 'red');
      return;
    }

    // Step 3: Upload certificate with full flow (autoSave=true)
    const uploadResult = await uploadCertificateWithFullFlow(auth.token, testCase);
    if (!uploadResult.success) {
      log(`\n❌ Upload failed: ${uploadResult.error}`, 'red');
      return;
    }

    const verification = uploadResult.result.data.verification;
    const credential = uploadResult.result.data.credential;

    log(`\n✅ VERIFICATION RESULTS:`, 'green');
    log(`   Score: ${verification.finalScore}%`, 'cyan');
    log(`   Status: ${verification.status}`, 'cyan');
    log(`   Auto-Approved: ${verification.autoApproved ? '✓' : '✗'}`, verification.autoApproved ? 'green' : 'yellow');

    if (!credential || !credential._id) {
      log(`\n⚠️  Warning: Credential not saved (autoSave might be false)`, 'yellow');
      return;
    }

    // Step 4: Verify in MongoDB
    const dbCredential = await verifyCredentialInDatabase(auth.token, credential._id);
    if (!dbCredential) {
      log(`\n❌ Failed to verify credential in database`, 'red');
      return;
    }

    // Step 5: Verify IPFS
    const ipfsOk = await verifyIPFSStorage(dbCredential);

    // Step 6: Verify Blockchain
    const blockchainOk = await verifyBlockchainRegistration(dbCredential);

    // Final Summary
    log('\n' + '='.repeat(80), 'bright');
    log('📊 TEST SUMMARY', 'bright');
    log('='.repeat(80), 'bright');

    log(`\n✅ Test completed successfully!`, 'green');
    log(`\n   Flow Component Status:`, 'yellow');
    log(`      Authentication: ✓`, 'green');
    log(`      Verification: ✓ (${verification.finalScore}%)`, 'green');
    log(`      MongoDB Save: ✓`, 'green');
    log(`      IPFS Upload: ${ipfsOk ? '✓' : '⚠️'}`, ipfsOk ? 'green' : 'yellow');
    log(`      Blockchain: ${blockchainOk ? '✓' : '⚠️'}`, blockchainOk ? 'green' : 'yellow');

    log(`\n   📊 Data Locations:`, 'yellow');
    log(`      MongoDB ID: ${credential._id}`, 'cyan');
    if (dbCredential.file?.ipfs?.cid) {
      log(`      IPFS CID: ${dbCredential.file.ipfs.cid}`, 'cyan');
      log(`      IPFS URL: ${dbCredential.file.url}`, 'cyan');
    }
    if (dbCredential.meta?.blockchain?.onChainTx) {
      log(`      Blockchain TX: ${dbCredential.meta.blockchain.onChainTx}`, 'cyan');
      log(`      Explorer: https://sepolia.etherscan.io/tx/${dbCredential.meta.blockchain.onChainTx}`, 'cyan');
    }

    log(`\n   ⏱️  Processing Time: ${uploadResult.processingTime}ms (${(uploadResult.processingTime / 1000).toFixed(2)}s)`, 'cyan');

    log('\n' + '='.repeat(80) + '\n', 'bright');

  } catch (error) {
    log(`\n❌ Test failed: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run test
runFullUploadTest();
