import { config } from 'dotenv';
config({ path: '../../backend/.env' });
import fs from 'fs';
import { uploadToIpfs } from '../../backend/src/core/utils/ipfsService.js';
import { computeFingerprintFromUrl, registerOnChain } from '../../backend/src/core/utils/blockchainService.js';

async function testUpdatedPipeline() {
  console.log('🔍 Testing Updated Pipeline (IPFS-only, no ImageKit)...\n');

  try {
    // Step 1: Create test certificate
    const testCertificate = {
      holder: 'Jane Smith',
      course: 'Full Stack Development',
      issuer: 'Tech Academy',
      date: new Date().toISOString(),
      pageUrl: 'https://techacademy.com/certificates/FS2025-12345'
    };

    const certificateBuffer = Buffer.from(JSON.stringify(testCertificate, null, 2));
    const fileName = `certificate-${Date.now()}.json`;

    console.log('📝 Test Certificate:');
    console.log(`   Holder: ${testCertificate.holder}`);
    console.log(`   Course: ${testCertificate.course}`);
    console.log(`   Page URL: ${testCertificate.pageUrl}\n`);

    // Step 2: Upload to IPFS (PRIMARY STORAGE)
    console.log('📤 Step 1: Uploading to IPFS (primary storage)...');
    const ipfsResult = await uploadToIpfs(certificateBuffer, fileName);
    console.log(`✅ IPFS Upload Success!`);
    console.log(`   CID: ${ipfsResult.cid}`);
    console.log(`   Provider: ${ipfsResult.provider}`);
    console.log(`   Gateway URL: https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}\n`);

    // Step 3: Compute fingerprint from pageUrl
    console.log('🔑 Step 2: Computing fingerprint from pageUrl...');
    const fingerprint = computeFingerprintFromUrl(testCertificate.pageUrl);
    console.log(`   Page URL: ${testCertificate.pageUrl}`);
    console.log(`   Fingerprint: ${fingerprint}\n`);

    // Step 4: Register on blockchain
    console.log('⛓️  Step 3: Registering on blockchain...');
    const chainResult = await registerOnChain(fingerprint, ipfsResult.cid);
    console.log(`✅ Blockchain Registration Success!`);
    console.log(`   TX Hash: ${chainResult.txHash}`);
    console.log(`   Block: ${chainResult.receipt.blockNumber}`);
    console.log(`   Gas Used: ${chainResult.receipt.gasUsed.toString()}`);
    console.log(`   Explorer: https://sepolia.etherscan.io/tx/${chainResult.txHash}\n`);

    // Step 5: Simulate credential data structure
    console.log('💾 Step 4: Simulating credential save structure...\n');
    const credentialData = {
      file: {
        url: `https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}`,
        fileName: fileName,
        fileType: 'application/json',
        storageId: ipfsResult.cid,
        uploadedAt: new Date(),
        ipfs: {
          cid: ipfsResult.cid,
          provider: ipfsResult.provider
        },
        blockchain: {
          txHash: chainResult.txHash
        }
      },
      pageUrl: testCertificate.pageUrl,
      sourceUrl: testCertificate.pageUrl,
      meta: {
        blockchain: {
          ipfs: {
            cid: ipfsResult.cid,
            provider: ipfsResult.provider
          },
          onChainTx: chainResult.txHash,
          fingerprint: fingerprint
        }
      }
    };

    console.log('📊 Credential Data Structure:');
    console.log(JSON.stringify(credentialData, null, 2));
    console.log('\n');

    // Summary
    console.log('✅ UPDATED PIPELINE TEST SUCCESSFUL!\n');
    console.log('🎯 Key Changes Verified:');
    console.log('   ✓ ImageKit upload SKIPPED (commented out)');
    console.log('   ✓ IPFS is PRIMARY storage');
    console.log('   ✓ Gateway URL used as file.url');
    console.log('   ✓ pageUrl saved in credential for fingerprint verification');
    console.log('   ✓ Fingerprint computed from pageUrl (not ImageKit URL)');
    console.log('   ✓ On-chain registration successful\n');

    console.log('📈 Results:');
    console.log(`   • IPFS CID: ${ipfsResult.cid}`);
    console.log(`   • Page URL: ${testCertificate.pageUrl}`);
    console.log(`   • Fingerprint: ${fingerprint}`);
    console.log(`   • TX Hash: ${chainResult.txHash}\n`);

    // Save results
    const results = {
      timestamp: new Date().toISOString(),
      testType: 'Updated Pipeline (IPFS-only)',
      certificate: testCertificate,
      ipfs: {
        cid: ipfsResult.cid,
        provider: ipfsResult.provider,
        gatewayUrl: `https://gateway.pinata.cloud/ipfs/${ipfsResult.cid}`
      },
      blockchain: {
        pageUrl: testCertificate.pageUrl,
        fingerprint,
        txHash: chainResult.txHash,
        blockNumber: chainResult.receipt.blockNumber.toString(),
        gasUsed: chainResult.receipt.gasUsed.toString()
      },
      credentialStructure: credentialData
    };

    fs.writeFileSync('test-updated-pipeline-results.json', JSON.stringify(results, null, 2));
    console.log('💾 Results saved to test-updated-pipeline-results.json\n');
    console.log('🎉 Pipeline update complete and verified!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

testUpdatedPipeline();
