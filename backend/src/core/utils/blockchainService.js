import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { ethers } from 'ethers';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ABI_PATH = path.join(__dirname, '..', '..', '..', 'contracts', 'CertificateRegistryABI.json');

function loadAbi() {
  try {
    const raw = fs.readFileSync(ABI_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to load contract ABI from ${ABI_PATH}: ${err.message}`);
  }
}

/**
 * Register fingerprint -> cid on-chain.
 * Requires env vars: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS
 */
export async function registerOnChain(fingerprintBytes32, cid) {
  const rpc = process.env.RPC_URL;
  const pk = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS;

  if (!rpc || !pk || !contractAddress) throw new Error('RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS must be set in env');

  const abi = loadAbi();
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(pk, provider);
  const contract = new ethers.Contract(contractAddress, abi, wallet);

  const tx = await contract.register(fingerprintBytes32, cid);
  // wait for one confirmation
  const receipt = await tx.wait(1);

  return { txHash: tx.hash, receipt };
}

/**
 * Compute fingerprint from URL using SHA-256 (proven, industry-standard)
 * SHA-256 has decades of cryptographic research and is NIST-approved
 * Returns bytes32 hex string compatible with Solidity
 * 
 * @param {string} url - Certificate source URL
 * @returns {string} - 0x-prefixed 32-byte hex string
 */
export function computeFingerprintFromUrl(url) {
  if (!url) return null;

  // Use SHA-256 (proven, widely trusted algorithm)
  const hash = crypto.createHash('sha256').update(url).digest('hex');

  // Return as 0x-prefixed bytes32 format for Solidity compatibility
  return '0x' + hash;
}
