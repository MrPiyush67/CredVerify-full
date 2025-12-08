/**
 * End-to-End Integration Test
 * Tests complete user workflow from signup to credential verification
 */

const BACKEND_URL = 'http://localhost:8003';
const FRONTEND_URL = 'http://localhost:5173';

// Test configuration
const testUser = {
  email: `test-${Date.now()}@credverify.test`,
  password: 'Test@123456',
  name: 'Test User',
  role: 'learner'
};

const testCertificate = {
  sourceUrl: 'https://www.coursera.org/account/accomplishments/verify/ABC123TEST',
  expectedName: 'Test User',
  expectedCourse: 'Machine Learning'
};

console.log('🧪 End-to-End Integration Test\n');
console.log('='.repeat(60));

async function runE2ETest() {
  let authToken = null;
  let userId = null;
  let credentialId = null;

  try {
    // ===== STEP 1: User Signup =====
    console.log('\n📝 Step 1: User Signup');
    const signupRes = await fetch(`${BACKEND_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(testUser)
    });

    if (!signupRes.ok) {
      const error = await signupRes.text();
      throw new Error(`Signup failed: ${error}`);
    }

    const signupData = await signupRes.json();
    if (!signupData.success) {
      throw new Error(`Signup unsuccessful: ${JSON.stringify(signupData)}`);
    }

    authToken = signupData.data.token;
    userId = signupData.data.user._id;
    console.log(`✅ User created: ${testUser.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Token: ${authToken.substring(0, 20)}...`);

    // ===== STEP 2: Login =====
    console.log('\n📝 Step 2: User Login');
    const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });

    if (!loginRes.ok) {
      throw new Error('Login failed');
    }

    const loginData = await loginRes.json();
    console.log('✅ Login successful');
    console.log(`   Welcome: ${loginData.data.user.name}`);

    // ===== STEP 3: Create Manual Credential (Draft) =====
    console.log('\n📝 Step 3: Create Draft Credential');
    const createCredRes = await fetch(`${BACKEND_URL}/api/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      credentials: 'include',
      body: JSON.stringify({
        title: testCertificate.expectedCourse,
        issuer: 'Coursera',
        sourceUrl: testCertificate.sourceUrl,
        type: 'certificate'
      })
    });

    if (!createCredRes.ok) {
      const error = await createCredRes.text();
      throw new Error(`Create credential failed: ${error}`);
    }

    const createCredData = await createCredRes.json();
    credentialId = createCredData.data._id;
    console.log('✅ Draft credential created');
    console.log(`   Credential ID: ${credentialId}`);

    // ===== STEP 4: Request Verification =====
    console.log('\n📝 Step 4: Request Manual Verification');
    console.log('   (This would normally trigger Regulator review)');
    // In real scenario, this would be picked up by a Regulator
    console.log('⚠️  Manual verification requires Regulator approval');

    // ===== STEP 5: Fetch User's Credentials =====
    console.log('\n📝 Step 5: Fetch User Credentials');
    const fetchRes = await fetch(`${BACKEND_URL}/api/credentials`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      credentials: 'include'
    });

    if (!fetchRes.ok) {
      throw new Error('Fetch credentials failed');
    }

    const fetchData = await fetchRes.json();
    console.log('✅ Credentials fetched');
    console.log(`   Total credentials: ${fetchData.data.length}`);

    // ===== STEP 6: Get User Profile =====
    console.log('\n📝 Step 6: Get User Profile');
    const profileRes = await fetch(`${BACKEND_URL}/api/user/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`
      },
      credentials: 'include'
    });

    if (!profileRes.ok) {
      throw new Error('Get profile failed');
    }

    const profileData = await profileRes.json();
    console.log('✅ Profile fetched');
    console.log(`   Name: ${profileData.data.name}`);
    console.log(`   Email: ${profileData.data.email}`);
    console.log(`   Role: ${profileData.data.role}`);

    // ===== STEP 7: Logout =====
    console.log('\n📝 Step 7: User Logout');
    const logoutRes = await fetch(`${BACKEND_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });

    if (!logoutRes.ok) {
      throw new Error('Logout failed');
    }

    console.log('✅ Logout successful');

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    console.log('✅ END-TO-END TEST COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✅ User signup');
    console.log('   ✅ User login');
    console.log('   ✅ Create credential');
    console.log('   ✅ Fetch credentials');
    console.log('   ✅ Get profile');
    console.log('   ✅ User logout');
    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

runE2ETest();
