import { ethers } from 'ethers';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';

// Load contract ABI and bytecode (you'll need to compile the contract first)
const abiPath = path.join(process.cwd(), 'contracts', 'CertificateRegistryABI.json');
const bytecodePath = path.join(process.cwd(), 'contracts', 'CertificateRegistryBytecode.json'); // You'll create this

async function deploy() {
  // Get from env
  const rpcUrl = process.env.RPC_URL;
  const privateKey = process.env.PRIVATE_KEY;

  if (!rpcUrl || !privateKey) {
    throw new Error('Set RPC_URL and PRIVATE_KEY in .env');
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  // Load ABI
  const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8'));

  // Load bytecode (you need to compile the contract and save bytecode)
  // For now, placeholder - you'll replace with actual bytecode
  const bytecode = '0x' + fs.readFileSync(bytecodePath, 'utf8').trim(); // Assuming you save it as hex

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);

  console.log('Deploying contract...');
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log('Contract deployed at:', address);

  // Update .env with the address
  const envPath = path.join(process.cwd(), '.env');
  let envContent = fs.readFileSync(envPath, 'utf8');
  envContent = envContent.replace(/CONTRACT_ADDRESS=.*/, `CONTRACT_ADDRESS=${address}`);
  fs.writeFileSync(envPath, envContent);

  console.log('Updated .env with CONTRACT_ADDRESS');
}

deploy().catch(console.error);