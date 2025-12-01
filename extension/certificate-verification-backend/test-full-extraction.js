import { extractCertificateData } from './src/utils/llmExtractor.js';
import dotenv from 'dotenv';

dotenv.config();

// Test with various certificate text samples
const testCertificates = [
  {
    name: 'Test 1: Simple Course Certificate',
    ocrText: `
      CERTIFICATE OF COMPLETION
      
      This is to certify that
      John Doe
      
      has successfully completed the course
      Advanced JavaScript Programming
      
      Issued by: Tech Academy
      Date: December 1, 2023
    `
  },
  {
    name: 'Test 2: Professional Certificate',
    ocrText: `
      Professional Certificate
      
      This certifies that Sarah Johnson has successfully completed
      the Data Science Bootcamp program offered by
      Data Institute on November 15, 2023.
      
      Valid until: November 15, 2025
      Certificate ID: DS-2023-12345
    `
  },
  {
    name: 'Test 3: Award Certificate',
    ocrText: `
      AWARD CERTIFICATE
      
      Presented to: Michael Chen
      For outstanding achievement in
      Web Development Excellence Program
      
      By: Innovation Academy
      Awarded on: October 20, 2023
      Certificate Number: WD-789
    `
  }
];

async function runFullTests() {
  console.log('🧪 FULL GEMINI API TEST - Certificate Data Extraction\n');
  console.log('='.repeat(80));

  for (const test of testCertificates) {
    console.log(`\n${test.name}`);
    console.log('-'.repeat(80));
    console.log('OCR Text:', test.ocrText.trim().substring(0, 100) + '...');
    console.log('\nExtracting data...');

    try {
      const result = await extractCertificateData(test.ocrText);

      console.log('\n✅ EXTRACTION SUCCESSFUL!');
      console.log(JSON.stringify(result, null, 2));

    } catch (error) {
      console.log('\n❌ EXTRACTION FAILED!');
      console.log('Error:', error.message);
    }

    console.log('\n' + '='.repeat(80));

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n🎉 All tests completed!\n');
}

runFullTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
