import { extractTextFromImage } from './src/utils/ocrProcessor.js';
import { extractCertificateData } from './src/utils/llmExtractor.js';
import sharp from 'sharp';
import dotenv from 'dotenv';

dotenv.config();

// Create a realistic test certificate image
const createTestCertificate = async () => {
  const svg = `
    <svg width="1000" height="700" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f9f9f9"/>
      <rect x="30" y="30" width="940" height="640" fill="white" stroke="#333" stroke-width="3"/>
      
      <!-- Header -->
      <text x="500" y="100" font-family="Georgia" font-size="48" text-anchor="middle" font-weight="bold" fill="#2c3e50">
        CERTIFICATE OF ACHIEVEMENT
      </text>
      
      <!-- Decorative line -->
      <line x1="200" y1="130" x2="800" y2="130" stroke="#e74c3c" stroke-width="2"/>
      
      <!-- Body text -->
      <text x="500" y="200" font-family="Arial" font-size="22" text-anchor="middle" fill="#34495e">
        This is to certify that
      </text>
      
      <text x="500" y="260" font-family="Georgia" font-size="40" text-anchor="middle" font-weight="bold" fill="#2c3e50">
        Sarah Johnson
      </text>
      
      <text x="500" y="320" font-family="Arial" font-size="22" text-anchor="middle" fill="#34495e">
        has successfully completed the intensive program
      </text>
      
      <text x="500" y="380" font-family="Georgia" font-size="36" text-anchor="middle" font-weight="bold" fill="#e74c3c">
        Data Science and Machine Learning
      </text>
      
      <text x="500" y="430" font-family="Arial" font-size="20" text-anchor="middle" fill="#34495e">
        with distinction, demonstrating exceptional proficiency
      </text>
      
      <!-- Footer -->
      <text x="250" y="550" font-family="Arial" font-size="18" text-anchor="middle" fill="#34495e">
        Issued by:
      </text>
      <text x="250" y="580" font-family="Georgia" font-size="20" text-anchor="middle" font-weight="bold" fill="#2c3e50">
        Global Tech Institute
      </text>
      
      <text x="750" y="550" font-family="Arial" font-size="18" text-anchor="middle" fill="#34495e">
        Date:
      </text>
      <text x="750" y="580" font-family="Georgia" font-size="20" text-anchor="middle" font-weight="bold" fill="#2c3e50">
        November 28, 2023
      </text>
      
      <text x="500" y="630" font-family="Arial" font-size="16" text-anchor="middle" fill="#7f8c8d">
        Certificate ID: ML-DS-2023-89456
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return buffer;
};

async function testFullPipeline() {
  console.log('🧪 FULL PIPELINE TEST: OCR + GEMINI API\n');
  console.log('='.repeat(80));

  try {
    // Step 1: Create test certificate
    console.log('\n📄 Step 1: Creating test certificate image...');
    const testImage = await createTestCertificate();
    console.log('✅ Test certificate created (1000x700 PNG)');

    // Step 2: Extract text using OCR
    console.log('\n🔍 Step 2: Extracting text with Tesseract.js (Optimized Config)...');
    const { text: ocrText, confidence } = await extractTextFromImage(testImage);

    console.log('✅ OCR extraction complete');
    console.log(`   Confidence: ${confidence.toFixed(2)}%`);
    console.log(`   Text length: ${ocrText.length} characters`);
    console.log('\n--- OCR Text Output ---');
    console.log(ocrText);
    console.log('--- End OCR Text ---');

    // Step 3: Extract structured data using Gemini
    console.log('\n🤖 Step 3: Extracting structured data with Gemini API...');
    const structuredData = await extractCertificateData(ocrText);

    console.log('✅ Gemini extraction complete');
    console.log('\n📊 FINAL STRUCTURED DATA:');
    console.log(JSON.stringify(structuredData, null, 2));

    // Step 4: Validate results
    console.log('\n✅ Step 4: Validating extracted data...');
    const validations = {
      'Person Name': structuredData.personName === 'Sarah Johnson',
      'Course/Program': structuredData.courseName?.includes('Data Science') ||
        structuredData.programName?.includes('Data Science'),
      'Company/Issuer': structuredData.companyName === 'Global Tech Institute' ||
        structuredData.issuerName === 'Global Tech Institute',
      'Date Present': structuredData.issueDate?.includes('November') ||
        structuredData.issueDate?.includes('2023'),
      'Certificate ID': structuredData.certificateId === 'ML-DS-2023-89456',
    };

    console.log('\nValidation Results:');
    Object.entries(validations).forEach(([key, value]) => {
      console.log(`  ${value ? '✅' : '❌'} ${key}`);
    });

    const passedCount = Object.values(validations).filter(Boolean).length;
    const totalCount = Object.keys(validations).length;
    const accuracy = (passedCount / totalCount * 100).toFixed(0);

    console.log(`\n🎯 Accuracy: ${passedCount}/${totalCount} (${accuracy}%)`);

    if (accuracy >= 80) {
      console.log('\n' + '🎉'.repeat(40));
      console.log('✅ PIPELINE TEST PASSED!');
      console.log('Your Tesseract.js and Gemini API setup is working perfectly!');
      console.log('🎉'.repeat(40));
    } else {
      console.log('\n⚠️ Pipeline test completed but accuracy is below 80%');
    }

  } catch (error) {
    console.log('\n❌ PIPELINE TEST FAILED!');
    console.log('Error:', error.message);
    console.log('\nStack:', error.stack);
  }
}

testFullPipeline().catch(console.error);
