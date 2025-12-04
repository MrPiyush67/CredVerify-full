/**
 * Test QR extraction to see what's in the fake QR code
 */
import fs from 'fs';
import Jimp from 'jimp';
import jsQR from 'jsqr';

const filePath = '../certificates-for-test/qr-fake/unverified_QR1.jpg';

console.log('\nÌ¥ç Analyzing QR code in unverified_QR1.jpg...\n');

const imageBuffer = fs.readFileSync(filePath);
const image = await Jimp.read(imageBuffer);

console.log(`ÔøΩÔøΩ Image dimensions: ${image.bitmap.width}x${image.bitmap.height}`);

const { width, height, data } = image.bitmap;
const imageData = {
  data: new Uint8ClampedArray(data),
  width,
  height,
};

const qrCode = jsQR(imageData.data, width, height);

if (!qrCode) {
  console.log('‚ùå No QR code detected in the image\n');
} else {
  console.log('‚úÖ QR code found!');
  console.log(`Ì≥ç Location: (${qrCode.location.topLeftCorner.x}, ${qrCode.location.topLeftCorner.y})`);
  console.log(`\nÌ≥ù QR Code Content:\n   "${qrCode.data}"\n`);
  
  // Check if it's a URL
  try {
    new URL(qrCode.data);
    console.log('‚úÖ Content is a valid URL\n');
  } catch (error) {
    console.log('‚ùå Content is NOT a valid URL');
    console.log(`   Type: ${typeof qrCode.data}`);
    console.log(`   Length: ${qrCode.data.length} characters\n`);
  }
}
