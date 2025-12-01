import nodemailer from 'nodemailer';

// Test email configuration
const testEmailService = async () => {
  console.log('🧪 Testing Email Service...\n');
  
  const EMAIL_USER = 'piyushtest10067@gmail.com';
  const EMAIL_PASSWORD = 'jnkcxylzphcjiuvt';
  
  console.log('📧 Email User:', EMAIL_USER);
  console.log('🔑 Password Length:', EMAIL_PASSWORD.length, 'characters');
  console.log('🔑 Password:', EMAIL_PASSWORD.substring(0, 4) + '****\n');

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 60000,
    greetingTimeout: 30000,
    socketTimeout: 30000,
    debug: true, // Enable debug logs
    logger: true,
  });

  try {
    console.log('🔍 Step 1: Verifying transporter connection...');
    await transporter.verify();
    console.log('✅ Connection verified successfully!\n');

    console.log('📨 Step 2: Sending test email...');
    const info = await transporter.sendMail({
      from: `"CredVerify Test" <${EMAIL_USER}>`,
      to: EMAIL_USER, // Send to yourself for testing
      subject: 'Test Email - CredVerify System',
      html: `
        <h1>Email Test Successful!</h1>
        <p>This is a test email from the CredVerify backend system.</p>
        <p>Time: ${new Date().toLocaleString()}</p>
      `,
    });

    console.log('✅ Email sent successfully!');
    console.log('📬 Message ID:', info.messageId);
    console.log('📮 Response:', info.response);
    console.log('\n✨ Email service is working correctly!');
    
  } catch (error) {
    console.error('\n❌ Email test failed!');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    console.error('Full Error:', error);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔴 AUTHENTICATION ERROR:');
      console.error('   - Check if 2-Step Verification is enabled on Gmail account');
      console.error('   - Verify the App Password is correct (16 characters)');
      console.error('   - Make sure you\'re using an App Password, not regular password');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.error('\n🔴 CONNECTION ERROR:');
      console.error('   - Check your internet connection');
      console.error('   - Port 465/587 might be blocked by firewall');
      console.error('   - Try different network (mobile hotspot)');
    }
  } finally {
    process.exit();
  }
};

testEmailService();
