import { uploadCredentialFile } from '../backend/src/core/utils/imagekitService.js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Test ImageKit upload functionality
 */
async function testImageKitUpload() {
  try {
    console.log('🧪 Testing ImageKit upload functionality...\n');

    // Read test certificate image
    const imagePath = path.join(process.cwd(), 'test-certificate.jpg');
    if (!fs.existsSync(imagePath)) {
      console.error('❌ Test image not found at:', imagePath);
      console.log('Please run test-2-fetch-image.js first to download the test image.');
      return;
    }

    const imageBuffer = fs.readFileSync(imagePath);
    console.log(`📁 Read test image: ${imageBuffer.length} bytes`);

    // Upload to ImageKit
    console.log('📤 Uploading to ImageKit...');
    const uploadResult = await uploadCredentialFile(imageBuffer, {
      fileName: `test-certificate-${Date.now()}.jpg`,
      userName: 'Test User',
      issuer: 'Coursera',
      tags: ['test', 'certificate'],
    });

    console.log('\n✅ ImageKit upload successful!');
    console.log('📊 Upload Details:');
    console.log('  - File ID:', uploadResult.fileId);
    console.log('  - File Name:', uploadResult.fileName);
    console.log('  - URL:', uploadResult.url);
    console.log('  - Size:', uploadResult.size, 'bytes');
    console.log('  - File Type:', uploadResult.fileType);

    console.log('\n🔗 Image URL:', uploadResult.url);
    console.log('You can view the uploaded image at the URL above.');

  } catch (error) {
    console.error('\n❌ ImageKit upload test failed:');
    console.error('Error:', error.message);
    if (error.stack) {
      console.error('Stack:', error.stack);
    }
  }
}

// Run the test
testImageKitUpload();