import nodemailer from 'nodemailer';

const EMAIL_USER = 'piyushtest10067@gmail.com';
const EMAIL_PASSWORD = 'jnkcxylzphcjiuvt';

console.log('🧪 COMPREHENSIVE EMAIL TEST\n');
console.log('=' .repeat(60));

// Test 1: Verify connection
const testConnection = async () => {
  console.log('\n📡 TEST 1: Connection Verification');
  console.log('-'.repeat(60));
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ PASSED: Connection to Gmail verified');
    return true;
  } catch (error) {
    console.log('❌ FAILED: Connection verification failed');
    console.log('   Error:', error.message);
    return false;
  }
};

// Test 2: Send simple email
const testSimpleEmail = async () => {
  console.log('\n📧 TEST 2: Simple Email (No Attachment)');
  console.log('-'.repeat(60));
  
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
  });

  try {
    const info = await transporter.sendMail({
      from: `"CredVerify Test" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Test Email - Simple',
      html: '<h1>Test Successful!</h1><p>Simple email works.</p>',
    });
    
    console.log('✅ PASSED: Simple email sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return true;
  } catch (error) {
    console.log('❌ FAILED: Simple email failed');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    return false;
  }
};

// Test 3: Send email with PDF attachment
const testEmailWithAttachment = async () => {
  console.log('\n📎 TEST 3: Email with PDF Attachment');
  console.log('-'.repeat(60));
  
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
  });

  // Create a small test PDF buffer
  const testPDF = Buffer.from('%PDF-1.4\nTest PDF content');

  try {
    const info = await transporter.sendMail({
      from: `"CredVerify Test" <${EMAIL_USER}>`,
      to: EMAIL_USER,
      subject: 'Test Email - With Attachment',
      html: '<h1>Test with Attachment!</h1><p>Email includes PDF.</p>',
      attachments: [
        {
          filename: 'test-certificate.pdf',
          content: testPDF,
          contentType: 'application/pdf',
        },
      ],
    });
    
    console.log('✅ PASSED: Email with attachment sent successfully');
    console.log('   Message ID:', info.messageId);
    console.log('   Response:', info.response);
    return true;
  } catch (error) {
    console.log('❌ FAILED: Email with attachment failed');
    console.log('   Error Code:', error.code);
    console.log('   Error Message:', error.message);
    return false;
  }
};

// Run all tests
const runAllTests = async () => {
  const results = {
    connection: false,
    simple: false,
    attachment: false,
  };

  results.connection = await testConnection();
  
  if (results.connection) {
    results.simple = await testSimpleEmail();
    
    if (results.simple) {
      // Wait a bit to avoid rate limiting
      console.log('\n⏳ Waiting 3 seconds to avoid rate limits...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      results.attachment = await testEmailWithAttachment();
    }
  }

  // Final summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 FINAL TEST RESULTS');
  console.log('='.repeat(60));
  console.log('Connection Test:     ', results.connection ? '✅ PASS' : '❌ FAIL');
  console.log('Simple Email Test:   ', results.simple ? '✅ PASS' : '❌ FAIL');
  console.log('Attachment Test:     ', results.attachment ? '✅ PASS' : '❌ FAIL');
  console.log('='.repeat(60));

  if (results.connection && results.simple && results.attachment) {
    console.log('\n🎉 ALL TESTS PASSED! Email service is working perfectly!');
    console.log('   Check inbox: ' + EMAIL_USER);
  } else if (results.connection && results.simple && !results.attachment) {
    console.log('\n⚠️  Email works but attachments fail!');
    console.log('   Possible causes:');
    console.log('   - PDF buffer too large');
    console.log('   - Encoding issue');
    console.log('   - Gmail attachment limits');
  } else if (results.connection && !results.simple) {
    console.log('\n⚠️  Connection works but sending fails!');
    console.log('   Possible causes:');
    console.log('   - Rate limiting');
    console.log('   - Recipient validation');
    console.log('   - Temporary Gmail block');
  } else {
    console.log('\n❌ CONNECTION FAILED - Check credentials and network');
  }
  
  console.log('\n');
};

runAllTests().catch(error => {
  console.error('\n💥 Unexpected error:', error);
  process.exit(1);
});
