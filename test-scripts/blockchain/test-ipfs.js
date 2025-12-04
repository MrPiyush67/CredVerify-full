import { config } from 'dotenv';
config({ path: '../../backend/.env' });
import fs from 'fs';
import { uploadToIpfs } from '../../backend/src/core/utils/ipfsService.js';

async function testIPFS() {
  console.log('🔍 Testing IPFS Upload (Pinata)...\n');

  try {
    // Create a small test file buffer
    const testData = `Test certificate upload at ${new Date().toISOString()}`;
    const buffer = Buffer.from(testData);

    console.log('📤 Uploading test data to IPFS...');
    const result = await uploadToIpfs(buffer, 'test-certificate.txt');

    console.log('✅ IPFS Upload successful!');
    console.log(`   CID: ${result.cid}`);
    console.log(`   Provider: ${result.provider}`);
    console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${result.cid}`);
    console.log('\n✅ IPFS integration working!\n');
  } catch (error) {
    console.error('❌ IPFS test failed:', error.message);
    process.exit(1);
  }
}

testIPFS();
