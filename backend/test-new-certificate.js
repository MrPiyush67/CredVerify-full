import { generateCertificatePDF } from './src/core/utils/certificateGenerator.js';
import fs from 'fs/promises';
import path from 'path';

const testCertificate = async () => {
  console.log('🧪 Testing New Certificate Design with Template Background\n');
  console.log('=' .repeat(60));

  try {
    console.log('📄 Generating certificate PDF...');
    
    const testData = {
      recipientName: 'Siddharth Kumar Gupta',
      credentialName: 'WEV DEVELOPMENT BOOTCAMP',
      issueDate: '2023-08-08',
      hours: 66,
      nsqfLevel: 2,
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
    console.log('   - All fonts match the reference image');
    console.log('   - Layout matches exactly');
    console.log('\n💡 Tip: Compare with reference image to verify design');
    
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit();
  }
};

testCertificate();
