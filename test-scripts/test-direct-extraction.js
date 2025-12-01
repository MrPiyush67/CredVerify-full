/**
 * Direct OCR + LLM test for Prajjwal Maurya's Udemy certificate
 * No database required - just extraction testing
 */

import axios from 'axios';
import dotenv from 'dotenv';
import Tesseract from 'tesseract.js';
import { extractCertificateData } from '../backend/src/features/credential/llm/llm.service.js';
import { postProcessCertificateData } from '../backend/src/features/credential/processing/postProcessor.service.js';

dotenv.config();

async function testDirectExtraction() {
  console.log('🧪 Direct OCR + LLM Extraction Test');
  console.log('='.repeat(80));
  console.log('Certificate: Udemy - UC-858c158b-6121-47ab-9f2f-b5480f832d8a');
  console.log('Expected Name: Prajjwal Maurya (or Prajjwal Mourya)');
  console.log('Issue: Extracting "instrustors D" instead\n');

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

    const imageBuffer = Buffer.from(response.data);
    const base64Image = imageBuffer.toString('base64');
    console.log(`✅ Image fetched: ${(imageBuffer.length / 1024).toFixed(2)} KB\n`);

    // Step 2: OCR Extraction
    console.log('Step 2: Running OCR (Tesseract)...');
    const { data: { text: ocrText } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\r   Progress: ${(m.progress * 100).toFixed(0)}%`);
          }
        }
      }
    );
    console.log('\n✅ OCR complete\n');

    console.log('📝 OCR Text Output:');
    console.log('='.repeat(80));
    console.log(ocrText);
    console.log('='.repeat(80));
    console.log(`Total characters: ${ocrText.length}\n`);

    // Step 3: LLM Extraction
    console.log('Step 3: LLM Extraction (Gemini)...');
    const rawExtracted = await extractCertificateData(ocrText);
    console.log('✅ LLM extraction complete\n');

    console.log('🔍 RAW Extracted Data (from LLM):');
    console.log('-'.repeat(80));
    console.log(JSON.stringify(rawExtracted, null, 2));

    // Step 4: Post-processing
    console.log('\nStep 4: Post-processing...');
    const cleaned = postProcessCertificateData(rawExtracted.data); // Fix: use rawExtracted.data

    console.log('\n📋 FINAL Cleaned Data:');
    console.log('='.repeat(80));
    console.log('Person Name:', cleaned.personName || '❌ NOT FOUND');
    console.log('Certificate Name:', cleaned.certificateName || 'N/A');
    console.log('Issuer Name:', cleaned.issuerName || 'N/A');
    console.log('Certificate ID:', cleaned.certificateId || 'N/A');
    console.log('Issue Date:', cleaned.issueDate || 'N/A');
    console.log('='.repeat(80));

    // Analysis
    console.log('\n🎯 ANALYSIS:');
    console.log('-'.repeat(80));

    if (cleaned.personName === 'Prajjwal Maurya' || cleaned.personName === 'Prajjwal Mourya') {
      console.log('✅ SUCCESS: Name extracted correctly!');
      console.log('   Extracted:', cleaned.personName);
    } else {
      console.log('❌ PROBLEM: Wrong name extracted');
      console.log('   Expected: "Prajjwal Maurya" or "Prajjwal Mourya"');
      console.log('   Got:', cleaned.personName);

      console.log('\n🔍 Debugging OCR text for "Prajjwal":');
      const prajjwalMatches = ocrText.match(/prajjwal|prajwal|praijwal/gi);
      console.log('   Found in OCR:', prajjwalMatches || 'NOT FOUND');

      console.log('\n🔍 Debugging OCR text for "Maurya"/"Mourya":');
      const mauryaMatches = ocrText.match(/maurya|mourya|morya/gi);
      console.log('   Found in OCR:', mauryaMatches || 'NOT FOUND');

      console.log('\n🔍 Debugging for "instructors" (wrong extraction):');
      const instructorMatches = ocrText.match(/instructor[s]?|instrustors/gi);
      console.log('   Found in OCR:', instructorMatches || 'NOT FOUND');
    }

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response?.data) {
      console.error('API Error:', error.response.data);
    }
    console.error('\nStack trace:', error.stack);
  }
}

// Run the test
testDirectExtraction();
