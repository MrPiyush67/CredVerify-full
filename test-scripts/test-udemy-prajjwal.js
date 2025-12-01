/**
 * Test extraction for Prajjwal Maurya's Udemy certificate
 * URL: https://www.udemy.com/certificate/UC-858c158b-6121-47ab-9f2f-b5480f832d8a/
 * Expected personName: "Prajjwal Maurya"
 * Issue: Extracting "instrustors D" instead
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { processCertificateImage } from '../backend/src/features/credential/verification/verification.service.js';

dotenv.config();

async function testUdemyCertificate() {
  console.log('🧪 Testing Udemy Certificate Extraction');
  console.log('='.repeat(80));
  console.log('Certificate URL: https://www.udemy.com/certificate/UC-858c158b-6121-47ab-9f2f-b5480f832d8a/');
  console.log('Expected Name: Prajjwal Maurya');
  console.log('Issue: Getting "instrustors D" instead\n');

  try {
    // Step 1: Fetch the certificate image
    console.log('Step 1: Fetching certificate image...');
    const certificateUrl = 'https://udemy-certificate.s3.amazonaws.com/image/UC-858c158b-6121-47ab-9f2f-b5480f832d8a.jpg';

    const response = await axios.get(certificateUrl, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const base64Image = Buffer.from(response.data).toString('base64');
    console.log(`✅ Image fetched: ${(base64Image.length / 1024).toFixed(2)} KB\n`);

    // Step 2: Process the certificate
    console.log('Step 2: Processing certificate with OCR + LLM...');
    console.log('-'.repeat(80));

    const result = await processCertificateImage(
      base64Image,
      'Prajjwal Maurya', // Expected legal name
      certificateUrl
    );

    console.log('\n' + '='.repeat(80));
    console.log('📊 EXTRACTION RESULTS');
    console.log('='.repeat(80));

    console.log('\n🔍 OCR Text (first 500 chars):');
    console.log('-'.repeat(80));
    console.log(result.ocrText.substring(0, 500));
    console.log('...\n');

    console.log('📋 Extracted Data:');
    console.log('-'.repeat(80));
    console.log('✅ Person Name:', result.extractedData.personName || '❌ NOT EXTRACTED');
    console.log('   Certificate Name:', result.extractedData.certificateName || 'N/A');
    console.log('   Issuer Name:', result.extractedData.issuerName || 'N/A');
    console.log('   Certificate ID:', result.extractedData.certificateId || 'N/A');
    console.log('   Issue Date:', result.extractedData.issueDate || 'N/A');
    console.log('   Completion Date:', result.extractedData.completionDate || 'N/A');

    console.log('\n🎯 Name Match Analysis:');
    console.log('-'.repeat(80));
    console.log('   Expected Name:', 'Prajjwal Maurya');
    console.log('   Extracted Name:', result.extractedData.personName);
    console.log('   Match Confidence:', `${result.nameValidation.confidence}%`);
    console.log('   Match Result:', result.nameValidation.match ? '✅ MATCH' : '❌ NO MATCH');
    console.log('   Reason:', result.nameValidation.reason);

    console.log('\n🏆 Verification Result:');
    console.log('-'.repeat(80));
    console.log('   Status:', result.verification.status);
    console.log('   Final Score:', `${result.verification.finalScore}%`);
    console.log('   Auto-Approved:', result.verification.autoApproved ? 'Yes' : 'No');

    if (result.extractedData.personName !== 'Prajjwal Maurya' &&
      result.extractedData.personName !== 'Prajjwal Mourya') {
      console.log('\n❌ PROBLEM DETECTED:');
      console.log('   Expected: "Prajjwal Maurya" or "Prajjwal Mourya"');
      console.log('   Got:', result.extractedData.personName);
      console.log('\n🔍 Debug: Check OCR text and LLM extraction patterns');
    } else {
      console.log('\n✅ SUCCESS: Name extracted correctly!');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error('\nStack trace:', error.stack);
    }
  }
}

// Run the test
testUdemyCertificate();
