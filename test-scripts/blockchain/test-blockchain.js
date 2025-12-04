import { config } from 'dotenv';
config({ path: '../../backend/.env' });
import { ethers } from 'ethers';

async function testBlockchain() {
  console.log('🔍 Testing Blockchain Connection...\n');

  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpcUrl || !privateKey || !contractAddress) {
    console.error('❌ Missing env vars: RPC_URL, PRIVATE_KEY, or CONTRACT_ADDRESS');
    process.exit(1);
  }

  try {
    // Connect to provider
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log(`✅ Connected to RPC: ${rpcUrl}`);
    console.log(`✅ Wallet address: ${wallet.address}`);

    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Balance: ${ethers.formatEther(balance)} ETH`);

    if (balance === 0n) {
      console.warn('⚠️  Warning: Wallet has 0 balance. Get testnet tokens from faucet.');
    }

    // Check network
    const network = await provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

    console.log(`📜 Contract address: ${contractAddress}`);

    // Try to check if contract exists
    const code = await provider.getCode(contractAddress);
    if (code === '0x') {
      console.error('❌ No contract found at this address. Did you deploy it?');
      process.exit(1);
    }

    console.log('✅ Contract exists at the address');
    console.log('\n✅ All blockchain checks passed!\n');
  } catch (error) {
    console.error('❌ Blockchain test failed:', error.message);
    process.exit(1);
  }
}

testBlockchain();
