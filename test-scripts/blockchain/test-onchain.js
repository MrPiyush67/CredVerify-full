import { config } from 'dotenv';
config({ path: '../../backend/.env' });
import { computeFingerprintFromUrl, registerOnChain } from '../../backend/src/core/utils/blockchainService.js';

async function testOnChain() {
  console.log('🔍 Testing On-Chain Registration...\n');

  try {
    // Test fingerprint computation
    const testUrl = 'https://example.com/certificate/12345';
    const fingerprint = computeFingerprintFromUrl(testUrl);
    console.log(`📝 Test URL: ${testUrl}`);
    console.log(`🔑 Fingerprint: ${fingerprint}\n`);

    // Test registration with a mock CID
    const testCid = 'QmTest123MockCIDForTesting';

    console.log('📤 Registering on blockchain...');
    console.log(`   Fingerprint: ${fingerprint}`);
    console.log(`   CID: ${testCid}`);

    const result = await registerOnChain(fingerprint, testCid);

    console.log('\n✅ On-chain registration successful!');
    console.log(`   Transaction Hash: ${result.txHash}`);
    console.log(`   Block Number: ${result.receipt.blockNumber}`);
    console.log(`   Gas Used: ${result.receipt.gasUsed.toString()}`);
    console.log('\n✅ Blockchain integration working!\n');

    // Show block explorer link
    const explorerUrl = `https://sepolia.etherscan.io/tx/${result.txHash}`;
    console.log(`🔗 View on explorer: ${explorerUrl}\n`);
  } catch (error) {
    console.error('❌ On-chain test failed:', error.message);
    if (error.info) {
      console.error('Error details:', error.info);
    }
    process.exit(1);
  }
}

testOnChain();
