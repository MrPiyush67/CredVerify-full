import fs from 'fs';
import path from 'path';
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

export function computeFingerprintFromUrl(url) {
  if (!url) return null;
  const bytes = ethers.toUtf8Bytes(url);
  const hash = ethers.keccak256(bytes);
  return hash; // bytes32 hex string
}
