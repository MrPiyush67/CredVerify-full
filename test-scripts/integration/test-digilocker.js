/**
 * DigiLocker Integration Test
 * Tests DigiLocker OAuth flow with mock server
 * 
 * Prerequisites:
 * - Mock DigiLocker server running on port 3002
 * - Backend server running on port 5000
 */

const BACKEND_URL = 'http://localhost:5000';
const DIGILOCKER_URL = 'http://localhost:3002';

console.log('🧪 DigiLocker OAuth Integration Test\n');
console.log('='.repeat(60));

async function testDigiLockerFlow() {
  try {
    // ===== STEP 1: Check Mock DigiLocker Server =====
    console.log('\n📝 Step 1: Verify Mock DigiLocker Server');

    try {
      const healthRes = await fetch(`${DIGILOCKER_URL}/`);
      if (!healthRes.ok) {
        throw new Error('DigiLocker server not responding');
      }
      console.log('✅ Mock DigiLocker server is running');
    } catch (error) {
      console.error('❌ Mock DigiLocker server not running!');
      console.error('   Start it with: cd mock-digilocker && npm start');
      process.exit(1);
    }

    // ===== STEP 2: Test OAuth Authorization Endpoint =====
    console.log('\n📝 Step 2: Test OAuth Authorization Endpoint');

    const authUrl = new URL(`${DIGILOCKER_URL}/authorize`);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('client_id', 'mock-client-id');
    authUrl.searchParams.set('redirect_uri', `${BACKEND_URL}/api/digilocker/callback`);
    authUrl.searchParams.set('state', 'test-state-123');

    console.log('   Authorization URL:', authUrl.toString());
    console.log('✅ OAuth URL constructed');

    // ===== STEP 3: Simulate User Login =====
    console.log('\n📝 Step 3: Simulate DigiLocker Login');

    const loginRes = await fetch(`${DIGILOCKER_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser@digilocker.mock',
        password: 'Test@123'
      })
    });

    if (!loginRes.ok) {
      throw new Error('DigiLocker login failed');
    }

    const loginData = await loginRes.json();
    console.log('✅ DigiLocker login successful');
    console.log(`   User: ${loginData.user.name}`);

    // ===== STEP 4: Test Document Listing =====
    console.log('\n📝 Step 4: Test Document Listing');

    const docsRes = await fetch(`${DIGILOCKER_URL}/api/documents`, {
      headers: {
        'Authorization': `Bearer mock-access-token`
      }
    });

    if (!docsRes.ok) {
      throw new Error('Document listing failed');
    }

    const docsData = await docsRes.json();
    console.log('✅ Documents fetched');
    console.log(`   Total documents: ${docsData.documents?.length || 0}`);

    if (docsData.documents && docsData.documents.length > 0) {
      console.log('   Sample documents:');
      docsData.documents.slice(0, 3).forEach(doc => {
        console.log(`   - ${doc.name} (${doc.type})`);
      });
    }

    // ===== STEP 5: Test Token Exchange =====
    console.log('\n📝 Step 5: Test Token Exchange');

    const tokenRes = await fetch(`${DIGILOCKER_URL}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        code: 'MOCK_CODE_test123',
        client_id: 'mock-client-id',
        client_secret: 'mock-client-secret',
        redirect_uri: `${BACKEND_URL}/api/digilocker/callback`
      })
    });

    if (!tokenRes.ok) {
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenRes.json();
    console.log('✅ Token exchange successful');
    console.log(`   Access token: ${tokenData.access_token?.substring(0, 20)}...`);
    console.log(`   Token type: ${tokenData.token_type}`);

    // ===== SUMMARY =====
    console.log('\n' + '='.repeat(60));
    console.log('✅ DIGILOCKER INTEGRATION TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('\n📊 Test Summary:');
    console.log('   ✅ Mock server health check');
    console.log('   ✅ OAuth URL construction');
    console.log('   ✅ User login');
    console.log('   ✅ Document listing');
    console.log('   ✅ Token exchange');
    console.log('\n🎉 All DigiLocker integration tests passed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Test full OAuth flow in browser');
    console.log('   2. Test document selection UI');
    console.log('   3. Test credential import to CredVerify');

  } catch (error) {
    console.error('\n❌ TEST FAILED');
    console.error('Error:', error.message);
    console.error('\nTroubleshooting:');
    console.error('   - Ensure mock-digilocker server is running');
    console.error('   - Check backend server is running');
    console.error('   - Verify environment variables are set');
    process.exit(1);
  }
}

testDigiLockerFlow();
