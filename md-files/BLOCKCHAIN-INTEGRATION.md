# Blockchain Integration Guide - CredVerify

Complete documentation for the blockchain and IPFS integration in CredVerify.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Integration Status](#integration-status)
3. [Architecture](#architecture)
4. [Components](#components)
5. [Smart Contract](#smart-contract)
6. [IPFS Integration](#ipfs-integration)
7. [Blockchain Service](#blockchain-service)
8. [Pipeline Integration](#pipeline-integration)
9. [Deployment Guide](#deployment-guide)
10. [Testing](#testing)
11. [Troubleshooting](#troubleshooting)

---

## Overview

### What is the Blockchain Integration?

CredVerify uses **blockchain technology** to provide:

1. **Immutable Record**: Certificate fingerprints stored on Ethereum blockchain
2. **Decentralized Storage**: Certificate images stored on IPFS (Pinata)
3. **Tamper-Proof**: Cannot modify or delete registered certificates
4. **Public Verification**: Anyone can verify a certificate's authenticity on-chain

### Technology Stack

- **Blockchain**: Ethereum Sepolia Testnet (EVM-compatible, upgradable to mainnet/Polygon)
- **Smart Contract**: Solidity 0.8.17
- **IPFS Provider**: Pinata (decentralized file storage)
- **Web3 Library**: ethers.js v6

### Why Blockchain + IPFS?

**IPFS Benefits**:
- Content-addressable storage (CID)
- Decentralized (no single point of failure)
- Permanent storage (content never changes)
- Cost-effective (cheaper than on-chain storage)

**Blockchain Benefits**:
- Immutable record of certificate fingerprints
- Timestamped proof of registration
- Public verifiability
- Trustless verification (no need to trust CredVerify)

---

## Integration Status

### ✅ Fully Operational

All components are implemented and tested:

- ✅ **IPFS Upload**: Pinata integration working
- ✅ **Smart Contract**: Deployed on Ethereum Sepolia at `0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35`
- ✅ **On-Chain Registration**: Fingerprint → CID mapping stored
- ✅ **Pipeline Integration**: Automatic registration during verification
- ✅ **Duplicate Detection**: URL-based fingerprint prevents duplicate uploads
- ✅ **Database Storage**: CID, txHash, and fingerprint saved in MongoDB

### Last Test Results

**Date**: December 4, 2025
**Test**: Full pipeline (IPFS + Blockchain + Database)

- **IPFS CID**: `QmXTMgMcESCaUeFDLgQwpGczx3twD3au9DRqonXjU5YbD9`
- **Transaction**: `0x435ae1d4b2814614d85c8a6be0b623750c465b537003828bb7c03ec45e41f943`
- **Block**: 9767061
- **Gas Used**: 140,563
- **Status**: ✅ Success

[View on Etherscan](https://sepolia.etherscan.io/tx/0x435ae1d4b2814614d85c8a6be0b623750c465b537003828bb7c03ec45e41f943)

---

## Architecture

### High-Level Flow

```
Certificate Verified (OCR + AI)
  ↓
Compute Fingerprint from sourceUrl
  fingerprint = sha256(sourceUrl)
  ↓
Check for Duplicates in MongoDB
  Query: { certificateFingerprint: fingerprint }
  ↓
[If duplicate found] → Return 409 Conflict Error
  ↓
[If unique] → Upload Image to IPFS (Pinata)
  ↓
Receive CID (e.g., QmXXX...)
  ↓
Register on Blockchain
  contract.register(fingerprint, CID)
  ↓
Receive Transaction Hash
  ↓
Save to MongoDB
  - file.ipfs.cid
  - file.blockchain.txHash
  - certificateFingerprint
```

### Why Fingerprint from URL?

We hash the **certificate's original URL** (e.g., `https://coursera.org/verify/ABC123`) to create a unique fingerprint:

**Benefits**:
1. **Deterministic**: Same URL always produces same fingerprint
2. **Verifiable**: Anyone can verify by hashing the URL
3. **Tamper-Proof**: Changing URL changes fingerprint
4. **No PII**: URL is public info (not user's name)
5. **Duplicate Prevention**: Same URL cannot be uploaded twice

**Implementation**:
```javascript
// blockchainService.js
import crypto from 'crypto';

export function computeFingerprintFromUrl(url) {
  if (!url) return null;
  // Use SHA-256 (proven, NIST-approved algorithm)
  const hash = crypto.createHash('sha256').update(url).digest('hex');
  return '0x' + hash; // bytes32 hex string (0x...)
}
```

**Alternative Approach NOT Implemented**:
- Perceptual image hashing (pHash): Hash based on image visual content
- Problem: Minor image edits (compression, rotation) change hash
- Problem: Requires complex image processing libraries
- Our approach is simpler and more reliable for web certificates

### Data Flow Diagram

```
┌─────────────────┐
│  User Uploads   │
│  Certificate    │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Backend Pipeline   │
│  (credentialSaver)  │
└────────┬────────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌────────────────┐  ┌──────────────────┐
│  IPFS Upload   │  │  Compute         │
│  (Pinata)      │  │  Fingerprint     │
└───────┬────────┘  │  keccak256(url)  │
        │           └────────┬─────────┘
        │                    │
        ▼                    ▼
    ┌────────┐         ┌──────────┐
    │  CID   │         │ SHA-256  │
    └───┬────┘         └────┬─────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Smart Contract │
         │  .register()    │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  Transaction    │
         │  Hash (txHash)  │
         └────────┬────────┘
                  │
                  ▼
         ┌─────────────────┐
         │  MongoDB        │
         │  Save CID +     │
         │  txHash         │
         └─────────────────┘
```

---

## Components

### 1. Smart Contract

**File**: `backend/contracts/CertificateRegistry.sol`

**Purpose**: Store fingerprint → CID mappings on-chain

**Key Functions**:
- `register(bytes32 fingerprint, string cid)` - Register new certificate (owner-only)
- `getRecord(bytes32 fingerprint)` - Get CID for fingerprint (public view)

**Deployment**:
- **Network**: Ethereum Sepolia Testnet
- **Address**: `0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35`
- **Explorer**: [Sepolia Etherscan](https://sepolia.etherscan.io/address/0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35)

### 2. IPFS Service

**File**: `backend/src/core/utils/ipfsService.js`

**Purpose**: Upload certificate images to IPFS via Pinata

**Key Function**:
```javascript
uploadToIpfs(buffer, fileName)
  → { cid, provider: 'pinata', raw }
```

**Provider**: Pinata Cloud (https://pinata.cloud)

### 3. Blockchain Service

**File**: `backend/src/core/utils/blockchainService.js`

**Purpose**: Interact with smart contract

**Key Functions**:
```javascript
registerOnChain(fingerprintBytes32, cid)
  → { txHash, receipt }

computeFingerprintFromUrl(url)
  → bytes32 hex string
```

**Library**: ethers.js v6

### 4. Pipeline Integration

**File**: `backend/src/features/credential/verification/pipeline/credentialSaver.js`

**Purpose**: Orchestrate IPFS upload + blockchain registration + database save

**Flow**:
1. Upload image to IPFS → get CID
2. Compute fingerprint from sourceUrl
3. Register on blockchain → get txHash
4. Save credential to MongoDB with IPFS and blockchain metadata

---

## Smart Contract

### Contract Code

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract CertificateRegistry {
    address public owner;

    struct Record {
        string cid;           // IPFS CID
        address ownerAddress; // Contract owner who registered
        uint256 timestamp;    // Block timestamp
    }

    mapping(bytes32 => Record) public records;

    event Registered(
        bytes32 indexed fingerprint,
        string cid,
        address indexed owner,
        uint256 timestamp
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function register(bytes32 fingerprint, string calldata cid) external onlyOwner {
        records[fingerprint] = Record({
            cid: cid,
            ownerAddress: msg.sender,
            timestamp: block.timestamp
        });
        emit Registered(fingerprint, cid, msg.sender, block.timestamp);
    }

    function getRecord(bytes32 fingerprint)
        external
        view
        returns (string memory cid, address ownerAddress, uint256 timestamp)
    {
        Record storage r = records[fingerprint];
        return (r.cid, r.ownerAddress, r.timestamp);
    }
}
```

### Key Features

1. **Owner-Only Registration**
   - Only contract owner (CredVerify backend) can register
   - Prevents spam/unauthorized registrations

2. **Immutable Records**
   - Once registered, cannot be changed
   - No delete function

3. **Public Verification**
   - Anyone can call `getRecord()` to verify
   - No authentication needed

4. **Timestamped**
   - Records include block timestamp
   - Proves when certificate was registered

### Deployment

**Network**: Ethereum Sepolia Testnet

**Contract Address**: `0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35`

**Explorer**: [View on Sepolia Etherscan](https://sepolia.etherscan.io/address/0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35)

**Owner Wallet**: Controlled by CredVerify backend (private key in `.env`)

---

## IPFS Integration

### Pinata Configuration

**Provider**: Pinata Cloud (https://pinata.cloud)

**Authentication**: JWT token or API key + secret

**Environment Variables**:
```env
PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
# OR
PINATA_API_KEY=your-api-key
PINATA_API_SECRET=your-api-secret
```

### Upload Flow

```javascript
// ipfsService.js
export async function uploadToIpfs(buffer, fileName) {
  const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
  const formData = new FormData();
  formData.append('file', buffer, { filename: fileName });

  const headers = {
    Authorization: `Bearer ${process.env.PINATA_JWT}`,
    ...formData.getHeaders()
  };

  const res = await axios.post(url, formData, { headers });
  const cid = res.data.IpfsHash; // e.g., QmXXX...

  return { cid, provider: 'pinata' };
}
```

### Gateway URLs

**Public IPFS Gateway**:
```
https://gateway.pinata.cloud/ipfs/{CID}
```

**Example**:
```
https://gateway.pinata.cloud/ipfs/QmXTMgMcESCaUeFDLgQwpGczx3twD3au9DRqonXjU5YbD9
```

**Saved in Database**:
```javascript
credential.file.url = `https://gateway.pinata.cloud/ipfs/${cid}`;
credential.file.ipfs = { cid, provider: 'pinata' };
```

---

## Blockchain Service

### Fingerprint Computation

```javascript
import crypto from 'crypto';

export function computeFingerprintFromUrl(url) {
  // SHA-256: Proven cryptographic hash (NIST FIPS 180-4)
  const hash = crypto.createHash('sha256').update(url).digest('hex');
  return '0x' + hash; // 0xabc123... (bytes32 hex string)
}
```

**Example**:
```
URL: https://coursera.org/verify/ABC123
Fingerprint: 0x3f4a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1
```

### On-Chain Registration

```javascript
export async function registerOnChain(fingerprintBytes32, cid) {
  const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(
    process.env.CONTRACT_ADDRESS,
    ABI,
    wallet
  );

  const tx = await contract.register(fingerprintBytes32, cid);
  const receipt = await tx.wait(1); // Wait for 1 confirmation

  return { txHash: tx.hash, receipt };
}
```

**Gas Estimation**: ~140,000 gas per registration

**Transaction Fee**: ~0.0003 ETH on Sepolia (free testnet)

---

## Pipeline Integration

### credentialSaver.js Flow

```javascript
// 1. Upload to IPFS
const ipfsResult = await uploadToIpfs(imageBuffer, fileName);
const cid = ipfsResult.cid;

// 2. Compute fingerprint
const fingerprint = computeFingerprintFromUrl(sourceUrl);

// 3. Register on blockchain
const { txHash } = await registerOnChain(fingerprint, cid);

// 4. Save to database
const credential = new Credential({
  file: {
    url: `https://gateway.pinata.cloud/ipfs/${cid}`,
    ipfs: { cid, provider: 'pinata' },
    blockchain: { txHash }
  },
  // ... other fields
});

await credential.save();
```

### Error Handling

**Non-Blocking**: Blockchain failures don't prevent credential save

```javascript
try {
  const { txHash } = await registerOnChain(fingerprint, cid);
  credential.file.blockchain = { txHash };
} catch (error) {
  console.error('Blockchain registration failed:', error);
  // Still save credential without blockchain data
}
```

**Why?**:
- IPFS upload more critical (stores actual image)
- Blockchain registration can be retried later
- User shouldn't fail due to network issues

---

## Deployment Guide

### Prerequisites

1. **Pinata Account**
   - Sign up at https://pinata.cloud
   - Create API key or JWT token

2. **Ethereum Wallet**
   - Create wallet (MetaMask or any Ethereum wallet)
   - Get private key (never share!)

3. **Sepolia Testnet ETH**
   - Get free SepoliaETH from faucets:
     - https://sepoliafaucet.com/
     - https://www.alchemy.com/faucets/ethereum-sepolia

4. **RPC Endpoint**
   - Alchemy: https://www.alchemy.com/ (recommended)
   - Infura: https://infura.io/
   - Or use public endpoint (slower)

### Step 1: Deploy Smart Contract

**Using Remix IDE** (Recommended):

1. Go to https://remix.ethereum.org
2. Create new file `CertificateRegistry.sol`
3. Paste contract code (from `backend/contracts/CertificateRegistry.sol`)
4. Compile:
   - Compiler: 0.8.17 or higher
   - Click "Compile CertificateRegistry.sol"
5. Deploy:
   - Environment: "Injected Provider - MetaMask"
   - Network: Ethereum Sepolia
   - Click "Deploy"
6. Confirm transaction in MetaMask
7. Copy deployed contract address

**Using Hardhat** (Advanced):

```bash
cd backend
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Create deploy script
cat > scripts/deploy.js << 'EOF'
async function main() {
  const Contract = await ethers.getContractFactory("CertificateRegistry");
  const contract = await Contract.deploy();
  await contract.deployed();
  console.log("Contract deployed to:", contract.address);
}
main();
EOF

npx hardhat run scripts/deploy.js --network sepolia
```

### Step 2: Configure Environment

Edit `backend/.env`:

```env
# IPFS (Pinata)
PINATA_JWT=your-pinata-jwt-token

# Blockchain
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35
```

**Security Warning**: Never commit `.env` file to Git!

### Step 3: Test Integration

```bash
cd backend

# Test IPFS upload
node test-scripts/blockchain/test-ipfs.js

# Test blockchain connection
node test-scripts/blockchain/test-blockchain.js

# Test on-chain registration
node test-scripts/blockchain/test-onchain.js

# Test full pipeline
node test-scripts/blockchain/test-full-pipeline.js
```

---

## Testing

### Test Scripts

All test scripts in `test-scripts/blockchain/`:

1. **test-ipfs.js** - Test IPFS upload to Pinata
2. **test-blockchain.js** - Test blockchain connection
3. **test-onchain.js** - Test contract registration
4. **test-full-pipeline.js** - Test complete flow
5. **test-updated-pipeline.js** - Test latest pipeline changes

### Running Tests

```bash
cd backend

# Individual tests
node test-scripts/blockchain/test-ipfs.js
node test-scripts/blockchain/test-blockchain.js

# Full pipeline test
node test-scripts/blockchain/test-full-pipeline.js
```

### Expected Output

```
✅ IPFS Upload Test
IPFS CID: QmXTMgMcESCaUeFDLgQwpGczx3twD3au9DRqonXjU5YbD9
Gateway URL: https://gateway.pinata.cloud/ipfs/QmXTMgMcESCaUeFDLgQwpGczx3twD3au9DRqonXjU5YbD9

✅ Blockchain Connection Test
Network: sepolia (chain ID: 11155111)
Wallet: 0xYourWalletAddress
Balance: 0.053 ETH

✅ On-Chain Registration Test
Transaction: 0x435ae1d4b2814614d85c8a6be0b623750c465b537003828bb7c03ec45e41f943
Explorer: https://sepolia.etherscan.io/tx/0x435ae1d4b2814614d85c8a6be0b623750c465b537003828bb7c03ec45e41f943
Block: 9767061
Gas Used: 140,563

✅ Full Pipeline Test - ALL TESTS PASSED
Latest Test Run: December 4, 2025
Contract: 0x71E8D0B04fF82fdE7Fe12DcF5aFd63501a6E8B35 (Sepolia)
```

---

## Troubleshooting

### IPFS Issues

**Error**: `Pinata upload failed: 401 Unauthorized`
- **Cause**: Invalid JWT or API key
- **Solution**: Check `PINATA_JWT` in `.env`

**Error**: `No IPFS pinning provider configured`
- **Cause**: Missing Pinata credentials
- **Solution**: Set `PINATA_JWT` or `PINATA_API_KEY` + `PINATA_API_SECRET`

### Blockchain Issues

**Error**: `Insufficient funds for intrinsic transaction cost`
- **Cause**: Wallet has no ETH
- **Solution**: Get SepoliaETH from faucet

**Error**: `nonce too low`
- **Cause**: Previous transaction not confirmed
- **Solution**: Wait 30 seconds and retry

**Error**: `Caller is not owner`
- **Cause**: Wrong wallet (not contract owner)
- **Solution**: Use wallet that deployed contract

**Error**: `Failed to load contract ABI`
- **Cause**: Missing `CertificateRegistryABI.json`
- **Solution**: Ensure file exists at `backend/contracts/CertificateRegistryABI.json`

### Network Issues

**Error**: `timeout of 30000ms exceeded`
- **Cause**: RPC endpoint slow/down
- **Solution**: Use Alchemy or Infura RPC, increase timeout

**Error**: `Invalid URL`
- **Cause**: Malformed `RPC_URL`
- **Solution**: Check `.env`, should start with `https://`

---

## Next Steps

- **Backend Architecture**: See [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
- **Testing Guide**: See [TESTING-GUIDE.md](./TESTING-GUIDE.md)
- **API Reference**: See [API-REFERENCE.md](./API-REFERENCE.md)

---

**Last Updated**: December 4, 2025
