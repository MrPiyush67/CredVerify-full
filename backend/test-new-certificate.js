import { generateCertificatePDF } from './src/core/utils/certificateGenerator.js';
import fs from 'fs/promises';
import path from 'path';
import mongoose from 'mongoose';

const testCertificate = async () => {
  console.log('🧪 Testing New Certificate Design with Template Background\n');
  console.log('=' .repeat(60));

  try {
    console.log('📄 Generating certificate PDF...');
    
    // Generate a dummy certificate ID for testing
    const dummyCertificateId = new mongoose.Types.ObjectId().toString();
    console.log(`🆔 Certificate ID: ${dummyCertificateId}`);
    console.log(`🔗 Verification URL: https://credverify.vercel.app/verify/${dummyCertificateId}\n`);
    
    const testData = {
      recipientName: 'Siddharth Kumar Gupta',
      credentialName: 'WEV DEVELOPMENT BOOTCAMP',
      issueDate: '2023-08-08',
      hours: 66,
      nsqfLevel: 2,
      instructorName: 'Dr. Kavita Rao',
      certificateId: dummyCertificateId,
    };

    const pdfBuffer = await generateCertificatePDF(testData);
    
    console.log(`✅ PDF generated successfully!`);
    console.log(`   Size: ${(pdfBuffer.length / 1024).toFixed(2)} KB`);

    // Save to test file
    const outputPath = path.join(process.cwd(), 'certificates', 'TEST_Certificate_WithTemplate.pdf');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, pdfBuffer);

    console.log(`✅ PDF saved to: ${outputPath}`);
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SUCCESS! Certificate with template background created!');
    console.log('\n📂 Open the PDF to verify:');
    console.log('   - Template background image is visible');
    console.log('   - Text is positioned correctly over background');
    console.log('   - QR code is in bottom right');
    console.log('   - QR code points to verification URL with certificate ID');
    console.log('   - Certificate URL displays with unique ID');
    console.log('   - All fonts match the reference image');
    console.log('   - Layout matches exactly');
    console.log('\n💡 Tip: Scan the QR code to test verification URL');
    console.log(`   (URL: https://credverify.vercel.app/verify/${dummyCertificateId})`);
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
};

testCertificate();
