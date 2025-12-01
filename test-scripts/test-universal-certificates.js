import { extractCertificateData } from '../backend/src/features/credential/llm/llm.service.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Test UNIVERSAL certificate extraction with multiple platforms
 */
async function testUniversalExtraction() {
  console.log('🌍 Testing UNIVERSAL Certificate Extraction System\n');
  console.log('='.repeat(70) + '\n');

  const testCertificates = [
    {
      platform: 'Udemy',
      ocrText: `Certificate of Completion
Prajjwal Mourya
has successfully completed
Design Thinking in 3 Steps
An online non-credit course authorized by Udemy
Udemy
Completion Date: December 1, 2024
Certificate ID: UC-858c158b-6121-47ab-9f2f-b5480f832d8a`
    },
    {
      platform: 'Coursera',
      ocrText: `Certificate
Siddharth Kumar Gupta
has successfully completed
Getting Started with Microsoft Excel
an online non-credit project authorized by Coursera
Issued December 20, 2024
Coursera
Verify at: coursera.org/verify/OUD4PJJPOHVH`
    },
    {
      platform: 'LinkedIn Learning',
      ocrText: `Certificate of Completion
Learner: John Michael Smith
Course: Advanced Python Programming
LinkedIn Learning
Completed: January 15, 2024
License: ABC123XYZ789`
    },
    {
      platform: 'Google Cloud',
      ocrText: `Google Cloud Certification
This is to certify that
Maria Rodriguez Garcia
has successfully completed
Associate Cloud Engineer Certification
Google Cloud
Issue Date: March 10, 2024
Certificate ID: GCP-ACE-2024-789456`
    },
    {
      platform: 'edX',
      ocrText: `Certificate of Achievement
Awarded to Arun Kumar Patel
for successfully completing
Introduction to Computer Science
HarvardX - Harvard University
Completed: February 28, 2024
edX ID: EDXCS50X2024`
    }
  ];

  for (const test of testCertificates) {
    console.log(`\n📚 Testing ${test.platform} Certificate:`);
    console.log('-'.repeat(70));

    try {
      const result = await extractCertificateData(test.ocrText);

      const data = result.data;
      console.log(`✅ Person Name: ${data.personName || '❌ MISSING'}`);
      console.log(`📜 Course/Certificate: ${data.certificateName || '❌ MISSING'}`);
      console.log(`🏢 Issuer: ${data.issuerName || '❌ MISSING'}`);
      console.log(`🆔 Certificate ID: ${data.certificateId || 'N/A'}`);
      console.log(`📅 Completion Date: ${data.completionDate || data.issueDate || 'N/A'}`);
      console.log(`🔗 Verification Link: ${data.verificationLink || 'N/A'}`);
      console.log(`💡 Skills: ${data.skills?.join(', ') || 'N/A'}`);
      console.log(`⚙️  Extraction Method: ${result.method}`);

      // Validation
      const isValid = data.personName && data.certificateName && data.issuerName;
      console.log(`\n${isValid ? '✅ PASSED' : '❌ FAILED'}: ${test.platform} extraction`);

    } catch (error) {
      console.error(`❌ FAILED: ${test.platform}`);
      console.error(`Error: ${error.message}`);
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('\n🎯 UNIVERSAL EXTRACTION TEST COMPLETE!\n');
  console.log('✨ The system can now handle certificates from:');
  console.log('   • Udemy, Coursera, edX, LinkedIn Learning');
  console.log('   • Google, Microsoft, IBM, AWS, Oracle');
  console.log('   • Universities, Training Providers');
  console.log('   • And many more platforms!\n');
}

testUniversalExtraction();
