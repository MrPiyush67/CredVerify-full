import { extractCertificateData } from '../backend/src/features/credential/llm/llm.service.js';
import { postProcessCertificateData, validateExtractedData } from '../backend/src/features/credential/processing/postProcessor.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test validation with missing certificateName
 */
async function testMissingCertificateName() {
  console.log('🧪 Testing Validation with Missing certificateName\n');

  const testCases = [
    {
      name: 'Has personName + certificateName + issuerName',
      ocrText: `Certificate of Completion
Prajjwal Mourya
has successfully completed
Design Thinking in 3 Steps
Udemy`,
      shouldPass: true,
    },
    {
      name: 'Has personName + issuerName (NO certificateName)',
      ocrText: `Certificate
Prajjwal Mourya
Issued by: Udemy
Date: December 1, 2024`,
      shouldPass: true, // Should pass with warning
    },
    {
      name: 'Has personName only (NO certificateName, NO issuerName)',
      ocrText: `Certificate
Prajjwal Mourya
December 1, 2024`,
      shouldPass: false, // Should fail
    },
    {
      name: 'Has certificateName + issuerName (NO personName)',
      ocrText: `Certificate of Completion
Design Thinking Course
Issued by Udemy`,
      shouldPass: false, // Should fail - personName is critical
    },
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Test: ${testCase.name}`);
    console.log('-'.repeat(70));

    try {
      const result = await extractCertificateData(testCase.ocrText);
      const cleaned = postProcessCertificateData(result.data);
      const validation = validateExtractedData(cleaned);

      console.log('Extracted:');
      console.log(`  - personName: ${cleaned.personName || '❌ MISSING'}`);
      console.log(`  - certificateName: ${cleaned.certificateName || '❌ MISSING'}`);
      console.log(`  - issuerName: ${cleaned.issuerName || '❌ MISSING'}`);
      console.log(`\nValidation:`);
      console.log(`  - isValid: ${validation.isValid}`);
      console.log(`  - missingFields: ${validation.missingFields.join(', ') || 'none'}`);
      console.log(`  - warnings: ${validation.warnings?.join(', ') || 'none'}`);

      const passed = validation.isValid === testCase.shouldPass;
      console.log(`\n${passed ? '✅ PASS' : '❌ FAIL'}: ${testCase.shouldPass ? 'Should pass' : 'Should fail'} - ${validation.isValid ? 'Passed' : 'Failed'}`);

    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n✅ Validation is now more flexible!');
  console.log('   - personName: REQUIRED (critical)');
  console.log('   - certificateName OR issuerName: At least one required');
  console.log('   - Missing optional fields show as warnings, not errors\n');
}

testMissingCertificateName();
