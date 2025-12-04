// Test script for platform verification
// Run with: node test-platform-verification.js

import { verifyCodeforces, verifyGitHubBio, fetchLeetCodeStats } from '../backend/src/features/platform/platform.verifiers.js';

console.log('🧪 Testing Platform Verification System\n');

// Test 1: Codeforces (No verification code needed - uses API)
async function testCodeforces() {
  console.log('1️⃣ Testing Codeforces API...');
  const testHandle = 'tourist'; // Famous competitive programmer
  
  try {
    const result = await verifyCodeforces(testHandle);
    console.log('✅ Codeforces Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ Codeforces Error:', error.message);
  }
  console.log('\n---\n');
}

// Test 2: GitHub Bio Verification
async function testGitHub() {
  console.log('2️⃣ Testing GitHub Bio Verification...');
  const testHandle = 'torvalds'; // Linus Torvalds
  const fakeCode = 'TEST123';
  
  try {
    const result = await verifyGitHubBio(testHandle, fakeCode);
    console.log('GitHub Result:', JSON.stringify(result, null, 2));
    console.log('Note: This should fail since we used a fake verification code');
  } catch (error) {
    console.log('✅ Expected failure:', error.message);
  }
  console.log('\n---\n');
}

// Test 3: LeetCode Stats Fetching
async function testLeetCode() {
  console.log('3️⃣ Testing LeetCode Stats Fetching...');
  const testHandle = 'lee215'; // Popular LeetCode user with solutions
  
  try {
    const result = await fetchLeetCodeStats(testHandle);
    console.log('✅ LeetCode Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    console.log('❌ LeetCode Error:', error.message);
  }
  console.log('\n---\n');
}

// Run all tests
async function runTests() {
  await testCodeforces();
  await testGitHub();
  await testLeetCode();
  
  console.log('✅ All tests completed!\n');
  console.log('📋 Summary:');
  console.log('- Codeforces: Direct API verification (works without verification code)');
  console.log('- GitHub: Requires verification code in bio');
  console.log('- LeetCode: Requires verification code in summary + fetches stats\n');
}

runTests().catch(console.error);
