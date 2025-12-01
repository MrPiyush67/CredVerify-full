import { extractCertificateData } from '../backend/src/features/credential/llm/llm.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test Udemy certificate extraction
 */
async function testUdemyCertificate() {
  console.log('🧪 Testing Udemy Certificate Extraction\n');

  // Simulated OCR text from Udemy certificate
  const ocrText = `
Certificate of Completion
Prajjwal Mourya
has successfully completed
Design Thinking in 3 Steps
An online non-credit course authorized by Udemy
Udemy
Completion Date: December 1, 2024
Certificate ID: UC-858c158b-6121-47ab-9f2f-b5480f832d8a
Verify at: https://www.udemy.com/certificate/UC-858c158b-6121-47ab-9f2f-b5480f832d8a/
`.trim();

  console.log('📄 OCR Text:');
  console.log(ocrText);
  console.log('\n' + '='.repeat(60) + '\n');

  try {
    const result = await extractCertificateData(ocrText);

    console.log('✅ Extraction successful!');
    console.log('Method:', result.method);
    console.log('\n📊 Extracted Data:');
    console.log(JSON.stringify(result.data, null, 2));

    // Validate critical fields
    console.log('\n🔍 Validation:');
    console.log('  - Person Name:', result.data.personName ? '✅' : '❌', result.data.personName || 'MISSING');
    console.log('  - Certificate Name:', result.data.certificateName ? '✅' : '❌', result.data.certificateName || 'MISSING');
    console.log('  - Issuer:', result.data.issuerName ? '✅' : '❌', result.data.issuerName || 'MISSING');
    console.log('  - Certificate ID:', result.data.certificateId ? '✅' : '❌', result.data.certificateId || 'MISSING');

  } catch (error) {
    console.error('❌ Extraction failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testUdemyCertificate();
