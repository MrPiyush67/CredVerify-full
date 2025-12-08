import { config } from 'dotenv';
config({ path: '../../backend/.env' });
import fs from 'fs';
import { uploadToIpfs } from '../../backend/src/core/utils/ipfsService.js';
import { computeFingerprintFromUrl, registerOnChain } from '../../backend/src/core/utils/blockchainService.js';

async function testFullPipeline() {
  console.log('🔍 Testing Full IPFS + Blockchain Pipeline...\n');

  try {
    // Step 1: Create test certificate data
    const testCertificate = {
      holder: 'John Doe',
      course: 'Blockchain Development',
      issuer: 'Example University',
      date: new Date().toISOString(),
      url: 'https://example.com/certificate/ABC123'
    };

    const certificateBuffer = Buffer.from(JSON.stringify(testCertificate, null, 2));

    console.log('📝 Test Certificate Data:');
    console.log(JSON.stringify(testCertificate, null, 2));
    console.log('\n');

    // Step 2: Upload to IPFS
    console.log('📤 Step 1: Uploading to IPFS...');
    const ipfsResult = await uploadToIpfs(certificateBuffer, 'test-certificate.json');
    console.log(`✅ IPFS CID: ${ipfsResult.cid}`);
    console.log(`   Provider: ${ipfsResult.provider}`);
    console.log(`   Gateway: https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}\n`);

    // Step 3: Compute fingerprint from certificate URL
    console.log('🔑 Step 2: Computing fingerprint...');
    const fingerprint = computeFingerprintFromUrl(testCertificate.url);
    console.log(`   URL: ${testCertificate.url}`);
    console.log(`   Fingerprint: ${fingerprint}\n`);

    // Step 4: Register on blockchain
    console.log('⛓️  Step 3: Registering on blockchain...');
    const chainResult = await registerOnChain(fingerprint, ipfsResult.cid);
    console.log(`✅ Transaction Hash: ${chainResult.txHash}`);
    console.log(`   Block Number: ${chainResult.receipt.blockNumber}`);
    console.log(`   Gas Used: ${chainResult.receipt.gasUsed.toString()}`);
    console.log(`   Explorer: https://sepolia.etherscan.io/tx/${chainResult.txHash}\n`);

    // Summary
    console.log('✅ FULL PIPELINE TEST SUCCESSFUL!\n');
    console.log('📊 Summary:');
    console.log(`   • IPFS CID: ${ipfsResult.cid}`);
    console.log(`   • Fingerprint: ${fingerprint}`);
    console.log(`   • TX Hash: ${chainResult.txHash}`);
    console.log(`   • Block: ${chainResult.receipt.blockNumber}`);
    console.log('\n🎉 Blockchain integration is fully operational!\n');

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      certificate: testCertificate,
      ipfs: {
        cid: ipfsResult.cid,
        provider: ipfsResult.provider,
        gateway: `https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}`
      },
      blockchain: {
        fingerprint,
        txHash: chainResult.txHash,
        blockNumber: chainResult.receipt.blockNumber.toString(),
        gasUsed: chainResult.receipt.gasUsed.toString(),
        explorer: `https://sepolia.etherscan.io/tx/${chainResult.txHash}`
      }
    };

    fs.writeFileSync('test-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Test results saved to test-results.json\n');

  } catch (error) {
    console.error('❌ Pipeline test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testFullPipeline();
