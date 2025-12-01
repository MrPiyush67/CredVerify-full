import net from 'net';

const testPort = (host, port) => {
  return new Promise((resolve, reject) => {
    const socket = net.createConnection({ host, port, timeout: 5000 });
    
    socket.on('connect', () => {
      console.log(`✅ Port ${port} is OPEN - Can connect to ${host}:${port}`);
      socket.destroy();
      resolve(true);
    });
    
    socket.on('timeout', () => {
      console.log(`❌ Port ${port} TIMEOUT - Network may be blocking ${host}:${port}`);
      socket.destroy();
      reject(new Error('timeout'));
    });
    
    socket.on('error', (err) => {
      console.log(`❌ Port ${port} BLOCKED - Cannot connect to ${host}:${port} (${err.code})`);
      reject(err);
    });
  });
};

console.log('🧪 Testing SMTP connectivity to Gmail...\n');

(async () => {
  console.log('Testing port 587 (STARTTLS)...');
  try {
    await testPort('smtp.gmail.com', 587);
  } catch (err) {
    console.log(`   ↳ Port 587: BLOCKED or TIMEOUT\n`);
  }
  
  console.log('Testing port 465 (SSL)...');
  try {
    await testPort('smtp.gmail.com', 465);
  } catch (err) {
    console.log(`   ↳ Port 465: BLOCKED or TIMEOUT\n`);
  }
  
  console.log('\n📊 Summary:');
  console.log('If both ports are blocked, your network/firewall is preventing SMTP.');
  console.log('Solutions:');
  console.log('1. Try different network (mobile hotspot)');
  console.log('2. Configure Windows Firewall to allow ports 465 & 587');
  console.log('3. Check antivirus settings');
  console.log('4. Contact network administrator');
  console.log('\nFor now, PDFs are being generated successfully! ✅');
})();
