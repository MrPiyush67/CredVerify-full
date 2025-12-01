/**
 * Test script to verify the extension -> backend flow
 * This simulates what the extension sends to the backend
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = 'http://127.0.0.1:5000';

// You need to replace this with a valid auth token from a logged-in user
const AUTH_TOKEN = 'your_auth_token_here';

async function testExtensionFlow() {
  console.log('🧪 Testing Extension -> Backend Flow\n');

  try {
    // Step 1: Login and get token (you can skip this if you already have a token)
    console.log('Step 1: Login to get auth token');
    console.log('Please login via the extension or frontend first to get a token');
    console.log('Then update AUTH_TOKEN in this script\n');

    // Step 2: Create a sample base64 image (you can replace this with actual certificate)
    console.log('Step 2: Preparing test image data');
    
    // Create a simple test base64 image (1x1 red pixel PNG)
    const testBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    
    console.log('✓ Test image prepared (base64)\n');

    // Step 3: Send verification request (matching extension format)
    console.log('Step 3: Sending verification request to backend');
    
    const requestBody = {
      imageData: testBase64,
      sourceUrl: 'https://coursera.org/verify/test123',
      imageType: 'base64'
    };

    console.log('Request body:', {
      imageData: `${testBase64.substring(0, 50)}... (${testBase64.length} chars)`,
      sourceUrl: requestBody.sourceUrl,
      imageType: requestBody.imageType
    });
    console.log('');

    const response = await fetch(`${BACKEND_URL}/api/credentials/verify-certificate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status, response.statusText);

    const result = await response.json();
    
    if (!response.ok) {
      console.error('\n❌ Request failed:');
      console.error('Status:', response.status);
      console.error('Error:', result);
      
      if (response.status === 401) {
        console.error('\n💡 Tip: Update AUTH_TOKEN with a valid token from logged-in user');
      }
      
      return;
    }

    console.log('\n✅ Request successful!\n');
    console.log('Response structure:');
    console.log(JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Tip: Make sure backend server is running on port 5000');
      console.error('Run: cd backend && npm run dev');
    }
  }
}

// Run test
testExtensionFlow();
