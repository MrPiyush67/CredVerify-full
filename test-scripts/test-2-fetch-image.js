/**
 * TEST 2: Fetch Certificate Image
 * 
 * This script:
 * 1. Fetches the Coursera certificate page
 * 2. Extracts the certificate image URL
 * 3. Downloads the image
 * 4. Converts to base64
 * 5. Saves for verification test
 */

// Certificate image URL from Coursera
const CERTIFICATE_IMAGE_URL = 'https://s3.amazonaws.com/coursera_assets/meta_images/generated/CERTIFICATE_LANDING_PAGE/CERTIFICATE_LANDING_PAGE~OUD4PJJPOHVH/CERTIFICATE_LANDING_PAGE~OUD4PJJPOHVH.jpeg';

// Full page URL
const CERTIFICATE_PAGE_URL = 'https://www.coursera.org/account/accomplishments/verify/OUD4PJJPOHVH';

async function testFetchImage() {
  console.log('🧪 TEST 2: Fetch Certificate Image\n');
  console.log('=' .repeat(60));

  try {
    let imageUrl = CERTIFICATE_IMAGE_URL;

    // If image URL not provided, try to extract from page
    if (imageUrl === 'PASTE_IMAGE_URL_HERE') {
      console.log('\n⚠️  Direct image URL not provided');
      console.log('📝 Please provide the direct certificate image URL');
      console.log('\nSteps to get image URL:');
      console.log('1. Go to:', CERTIFICATE_PAGE_URL);
      console.log('2. Right-click on the certificate image');
      console.log('3. Select "Copy Image Address"');
      console.log('4. Paste it in test-2-fetch-image.js');
      console.log('\nOr run this in browser console:');
      console.log('  document.querySelector(\'img[src*="certificate"]\')?.src');
      return;
    }

    console.log('\n📝 Step 1: Fetching certificate image...');
    console.log('Image URL:', imageUrl);

    const response = await fetch(imageUrl);
    console.log('Response Status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('✅ Image fetched successfully');
    console.log('  - Size:', Math.round(blob.size / 1024), 'KB');
    console.log('  - Type:', blob.type);

    // Step 2: Convert to base64
    console.log('\n📝 Step 2: Converting to base64...');
    
    const arrayBuffer = await blob.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    console.log('✅ Conversion complete');
    console.log('  - Base64 length:', base64.length, 'characters');
    console.log('  - First 100 chars:', base64.substring(0, 100) + '...');

    // Step 3: Save for next test
    console.log('\n📝 Step 3: Saving test data...');
    
    const fs = await import('fs');
    
    // Load existing test data
    let testData = {};
    try {
      const existingData = fs.readFileSync('./test-data.json', 'utf8');
      testData = JSON.parse(existingData);
    } catch (error) {
      console.log('⚠️  No existing test-data.json found, creating new one');
    }

    // Add image data
    testData.certificate = {
      pageUrl: CERTIFICATE_PAGE_URL,
      imageUrl: imageUrl,
      base64: base64,
      size: blob.size,
      type: blob.type,
      timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
      './test-data.json',
      JSON.stringify(testData, null, 2)
    );

    console.log('✅ Test data updated: ./test-data.json');

    // Also save raw image for inspection
    fs.writeFileSync(
      './test-certificate.jpg',
      Buffer.from(arrayBuffer)
    );
    console.log('✅ Raw image saved: ./test-certificate.jpg');

    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST 2 PASSED - Image Fetched & Converted!');
    console.log('='.repeat(60));

    console.log('\n📝 Next Steps:');
    console.log('Run: node test-3-verify-api.js');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nError details:', error);
  }
}

// Run test
testFetchImage();
