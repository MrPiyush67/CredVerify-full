/**
 * TEST 1: Authentication Test
 * 
 * This script:
 * 1. Logs in with provided credentials
 * 2. Gets auth token
 * 3. Retrieves user profile (including legal name)
 * 4. Saves token for other tests
 */

const BACKEND_URL = 'http://127.0.0.1:5000';
const USER_EMAIL = 'susi20091998@gmail.com';
const USER_PASSWORD = '@Piyush9152';

async function testAuthentication() {
  console.log('🧪 TEST 1: Authentication\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Login
    console.log('\n📝 Step 1: Logging in...');
    console.log('Email:', USER_EMAIL);
    console.log('Password:', '********');

    const loginResponse = await fetch(`${BACKEND_URL}/api/users/extension-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: USER_EMAIL,
        password: USER_PASSWORD,
      }),
    });

    console.log('Response Status:', loginResponse.status, loginResponse.statusText);

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('\n❌ Login failed!');
      console.error('Response:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    
    if (!loginData.success || !loginData.data.token) {
      console.error('\n❌ Login response invalid!');
      console.error('Response:', JSON.stringify(loginData, null, 2));
      return;
    }

    console.log('\n✅ Login successful!');
    
    const token = loginData.data.token;
    const user = loginData.data.user;

    console.log('\n📋 User Information:');
    console.log('  - ID:', user._id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    
    console.log('\n🔑 Auth Token:');
    console.log(token);
    console.log('\n  Token length:', token.length, 'characters');

    // Step 2: Test token by fetching profile
    console.log('\n📝 Step 2: Testing token validity...');
    
    const profileResponse = await fetch(`${BACKEND_URL}/api/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    console.log('Response Status:', profileResponse.status, profileResponse.statusText);

    if (!profileResponse.ok) {
      console.error('\n⚠️ Token test failed!');
      const errorText = await profileResponse.text();
      console.error('Response:', errorText);
      return;
    }

    const profileData = await profileResponse.json();
    console.log('\n✅ Token is valid!');
    console.log('\n📋 Profile Data:');
    console.log(JSON.stringify(profileData, null, 2));

    // Step 3: Save results for next tests
    console.log('\n💾 Saving test data...');
    
    const fs = await import('fs');
    const testData = {
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      './test-data.json',
      JSON.stringify(testData, null, 2)
    );

    console.log('✅ Test data saved to: ./test-data.json');

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST 1 PASSED - Authentication Working!');
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('1. Copy the auth token above');
    console.log('2. Get certificate image URL from:');
    console.log('   https://www.coursera.org/account/accomplishments/verify/OUD4PJJPOHVH');
    console.log('3. Run: node test-2-fetch-image.js');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Backend server is not running!');
      console.error('Start it with: cd backend && npm run dev');
    } else {
      console.error('\nError details:', error);
    }
  }
}

// Run test
testAuthentication();
