import { extractTextFromUrl } from '../backend/src/features/credential/ocr/ocr.service.js';
import { extractCertificateData } from '../backend/src/features/credential/llm/llm.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test actual Udemy certificate extraction
 */
async function testActualUdemyCertificate() {
  console.log('🧪 Testing ACTUAL Udemy Certificate\n');

  const certificateUrl = 'https://www.udemy.com/certificate/UC-858c158b-6121-47ab-9f2f-b5480f832d8a/';

  try {
    console.log('📥 Fetching certificate from:', certificateUrl);
    console.log('⏳ Running OCR (this may take 10-20 seconds)...\n');

    // Extract text from the certificate image
    const ocrText = await extractTextFromUrl(certificateUrl);

    console.log('📄 OCR Text Extracted:');
    console.log('='.repeat(60));
    console.log(ocrText);
    console.log('='.repeat(60) + '\n');

    // Extract structured data
    console.log('🤖 Extracting structured data with LLM...\n');
    const result = await extractCertificateData(ocrText);

    console.log('✅ Extraction successful!');
    console.log('Method:', result.method);
    console.log('\n📊 Extracted Data:');
    console.log(JSON.stringify(result.data, null, 2));

    console.log('\n🔍 Validation:');
    console.log('  - Person Name:', result.data.personName ? '✅' : '❌', result.data.personName || 'MISSING');
    console.log('  - Certificate Name:', result.data.certificateName ? '✅' : '❌', result.data.certificateName || 'MISSING');
    console.log('  - Issuer:', result.data.issuerName ? '✅' : '❌', result.data.issuerName || 'MISSING');
    console.log('  - Certificate ID:', result.data.certificateId ? '✅' : '❌', result.data.certificateId || 'MISSING');

  } catch (error) {
    console.error('❌ Test failed:');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testActualUdemyCertificate();
