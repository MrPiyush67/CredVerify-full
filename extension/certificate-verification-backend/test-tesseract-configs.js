import Tesseract from 'tesseract.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

console.log('Current Tesseract.js version:', Tesseract.version || 'Unknown');

// Different PSM (Page Segmentation Mode) configurations
const PSM_MODES = {
  '3': 'Fully automatic page segmentation (default)',
  '4': 'Assume a single column of text of variable sizes',
  '6': 'Assume a single uniform block of text',
  '7': 'Treat the image as a single text line',
  '11': 'Sparse text. Find as much text as possible',
  '13': 'Raw line. Treat as single text line, bypassing hacks',
};

// Different OEM (OCR Engine Mode) configurations
const OEM_MODES = {
  '0': 'Legacy engine only',
  '1': 'Neural nets LSTM engine only',
  '2': 'Legacy + LSTM engines',
  '3': 'Default, based on what is available',
};

// Test configurations
const testConfigs = [
  {
    name: 'Default Configuration',
    config: {},
  },
  {
    name: 'Best for Certificates (PSM 6, OEM 1)',
    config: {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    },
  },
  {
    name: 'Single Column Text (PSM 4, OEM 1)',
    config: {
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_COLUMN,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    },
  },
  {
    name: 'Sparse Text Detection (PSM 11, OEM 1)',
    config: {
      tessedit_pageseg_mode: Tesseract.PSM.SPARSE_TEXT,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    },
  },
  {
    name: 'Auto with LSTM (PSM 3, OEM 1)',
    config: {
      tessedit_pageseg_mode: Tesseract.PSM.AUTO,
      tessedit_ocr_engine_mode: Tesseract.OEM.LSTM_ONLY,
    },
  },
];

// Sample certificate text to create test image
const createTestImage = async () => {
  const svg = `
    <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="400" y="80" font-family="Arial" font-size="40" text-anchor="middle" font-weight="bold">
        CERTIFICATE OF COMPLETION
      </text>
      <text x="400" y="150" font-family="Arial" font-size="20" text-anchor="middle">
        This is to certify that
      </text>
      <text x="400" y="200" font-family="Arial" font-size="32" text-anchor="middle" font-weight="bold">
        John Doe
      </text>
      <text x="400" y="250" font-family="Arial" font-size="20" text-anchor="middle">
        has successfully completed the course
      </text>
      <text x="400" y="300" font-family="Arial" font-size="28" text-anchor="middle" font-weight="bold">
        Advanced JavaScript Programming
      </text>
      <text x="400" y="380" font-family="Arial" font-size="18" text-anchor="middle">
        Issued by: Tech Academy
      </text>
      <text x="400" y="420" font-family="Arial" font-size="18" text-anchor="middle">
        Date: December 1, 2023
      </text>
      <text x="400" y="460" font-family="Arial" font-size="16" text-anchor="middle">
        Certificate ID: CERT-2023-12345
      </text>
    </svg>
  `;

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer();

  return buffer;
};

async function testConfiguration(imageBuffer, config, configName) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing: ${configName}`);
  console.log('='.repeat(80));
  console.log('Config:', JSON.stringify(config, null, 2));

  try {
    const startTime = Date.now();

    const { data: { text, confidence, lines, words } } = await Tesseract.recognize(
      imageBuffer,
      'eng',
      {
        ...config,
        logger: (m) => {
          if (m.status === 'recognizing text') {
            process.stdout.write(`\rProgress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`\n\n✅ SUCCESS`);
    console.log(`Duration: ${duration}ms`);
    console.log(`Confidence: ${confidence.toFixed(2)}%`);
    console.log(`Text length: ${text.length} characters`);
    console.log(`Lines detected: ${lines.length}`);
    console.log(`Words detected: ${words.length}`);

    console.log('\n--- Extracted Text ---');
    console.log(text);
    console.log('--- End Text ---\n');

    // Analyze text quality
    const hasPersonName = text.includes('John Doe');
    const hasCourseName = text.includes('JavaScript') || text.includes('Programming');
    const hasIssuer = text.includes('Tech Academy');
    const hasDate = text.includes('December') || text.includes('2023');
    const hasCertId = text.includes('CERT-2023-12345');

    const qualityScore = [hasPersonName, hasCourseName, hasIssuer, hasDate, hasCertId].filter(Boolean).length;

    console.log('Quality Analysis:');
    console.log(`  Person Name: ${hasPersonName ? '✅' : '❌'}`);
    console.log(`  Course Name: ${hasCourseName ? '✅' : '❌'}`);
    console.log(`  Issuer: ${hasIssuer ? '✅' : '❌'}`);
    console.log(`  Date: ${hasDate ? '✅' : '❌'}`);
    console.log(`  Cert ID: ${hasCertId ? '✅' : '❌'}`);
    console.log(`  Quality Score: ${qualityScore}/5 (${(qualityScore / 5 * 100).toFixed(0)}%)`);

    return {
      configName,
      confidence,
      duration,
      textLength: text.length,
      qualityScore,
      text,
      success: true,
    };

  } catch (error) {
    console.log(`\n❌ FAILED: ${error.message}`);
    return {
      configName,
      success: false,
      error: error.message,
    };
  }
}

async function runTests() {
  console.log('🔍 TESSERACT.JS CONFIGURATION TESTING\n');
  console.log('Testing different configurations to find the best one for certificate OCR\n');

  // Create test image
  console.log('Creating test certificate image...');
  const testImage = await createTestImage();
  console.log('✅ Test image created\n');

  const results = [];

  for (const { name, config } of testConfigs) {
    const result = await testConfiguration(testImage, config, name);
    results.push(result);

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY - RANKED BY QUALITY');
  console.log('='.repeat(80));

  const successfulResults = results.filter(r => r.success);
  successfulResults.sort((a, b) => {
    if (b.qualityScore !== a.qualityScore) return b.qualityScore - a.qualityScore;
    return b.confidence - a.confidence;
  });

  successfulResults.forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.configName}`);
    console.log(`   Quality: ${r.qualityScore}/5 (${(r.qualityScore / 5 * 100).toFixed(0)}%)`);
    console.log(`   Confidence: ${r.confidence.toFixed(2)}%`);
    console.log(`   Speed: ${r.duration}ms`);
  });

  if (successfulResults.length > 0) {
    const best = successfulResults[0];
    console.log('\n' + '🎉'.repeat(40));
    console.log(`\n✅ RECOMMENDED CONFIGURATION: ${best.configName}`);
    console.log(`   Quality Score: ${best.qualityScore}/5`);
    console.log(`   Confidence: ${best.confidence.toFixed(2)}%\n`);
    console.log('🎉'.repeat(40));
  }
}

runTests().catch(console.error);
