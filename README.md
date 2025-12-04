# CredVerify - Blockchain-Based Credential Verification Platform

A comprehensive platform for verifying, storing, and managing digital credentials with blockchain-backed authenticity and IPFS-based decentralized storage.

## 🌟 Overview

CredVerify is a full-stack credential verification system that combines:
- **AI-powered verification**: Automated certificate validation using OCR and LLM
- **Blockchain immutability**: On-chain fingerprint registration for tamper-proof records
- **Decentralized storage**: IPFS-based certificate storage via Pinata
- **Browser extension**: One-click verification from certificate pages
- **Multi-platform support**: 50+ education & certification platforms

## 🏗️ Architecture

```
CredVerify/
├── backend/              # Node.js + Express API server
│   ├── src/
│   │   ├── features/    # Feature-based modules
│   │   ├── core/        # Shared infrastructure
│   │   └── contracts/   # Smart contracts & ABIs
│   └── ...
├── frontend/            # React + Vite SPA
│   ├── src/
│   │   ├── features/    # Feature modules
│   │   ├── common/      # Shared components
│   │   └── services/    # API clients
│   └── ...
├── extension/           # Chrome/Firefox extension
│   ├── js/              # Background & content scripts
│   ├── html/            # Popup & login UI
│   └── manifest.json    # Extension config
├── mock-digilocker/     # DigiLocker mock server
├── test-scripts/        # Integration tests
└── md-files/            # Documentation
```

## 🚀 Key Features

### For Credential Holders (Credentialists)
- ✅ Upload certificates (PDF, image, QR code, or credential ID)
- ✅ One-click verification via browser extension
- ✅ AI-powered automatic data extraction
- ✅ Blockchain-backed authenticity proof
- ✅ DigiLocker integration for government documents
- ✅ Profile building with verified credentials
- ✅ Job application system

### For Verifiers (Validants)
- ✅ Automated verification pipeline (85%+ confidence = auto-approved)
- ✅ Manual review dashboard for edge cases
- ✅ Platform-specific validation rules
- ✅ Bulk credential processing
- ✅ Verification statistics and analytics

### For Recruiters (Curators)
- ✅ Post job listings with credential requirements
- ✅ Browse verified candidate profiles
- ✅ Filter by skills, credentials, and experience
- ✅ Applicant tracking system
- ✅ Real-time chat with candidates

### Blockchain & Decentralization
- ✅ IPFS storage for certificates (Pinata provider)
- ✅ Smart contract on Ethereum Sepolia (Polygon-compatible)
- ✅ Fingerprint-based on-chain registration
- ✅ Immutable verification records
- ✅ Decentralized certificate retrieval

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (HTTP-only cookies)
- **File Storage**: IPFS (Pinata)
- **Blockchain**: ethers.js (Ethereum/Polygon)
- **AI/ML**: Google Gemini API (LLM), Tesseract.js (OCR)
- **Web Scraping**: Puppeteer

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **State**: Redux Toolkit
- **UI Components**: Custom + Radix UI primitives
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

### Browser Extension
- **Target**: Chrome/Firefox (Manifest V3)
- **Language**: Vanilla JavaScript
- **Storage**: chrome.storage API
- **Messaging**: chrome.runtime messaging

### Blockchain
- **Network**: Ethereum Sepolia Testnet (EVM-compatible)
- **Library**: ethers.js v6
- **Storage**: IPFS via Pinata API
- **Contract**: Solidity 0.8.17

## 📋 Prerequisites

- **Node.js**: v16+ ([Download](https://nodejs.org/))
- **MongoDB**: v5+ ([Download](https://www.mongodb.com/try/download/community))
- **Git**: ([Download](https://git-scm.com/downloads))
- **Chrome/Firefox**: For extension testing

### Optional (for blockchain features)
- **MetaMask**: For contract deployment
- **Alchemy/Infura**: RPC provider (free tier)
- **Pinata**: IPFS pinning service (free tier)

## 🚀 Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/MrPiyush67/CredVerify-full.git
cd CredVerify-full
```

### 2. Backend Setup
```bash
cd backend
npm install

# Create .env file (copy from .env.example)
cp .env.example .env
# Edit .env with your configuration

# Start MongoDB (if local)
mongod

# Run backend
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start frontend
npm run dev
# App runs on http://localhost:5173
```

### 4. Extension Setup (Optional)
```bash
# No build needed - load directly in Chrome
# Chrome -> Extensions -> Load Unpacked -> Select /extension folder
```

### 5. Test the Platform
1. Open http://localhost:5173
2. Sign up as Credentialist
3. Upload a certificate (or use extension)
4. View verification results

## 🔧 Configuration

### Backend Environment Variables
```env
# Server
PORT=5000

# Database
MONGO_URI=mongodb://localhost:27017/credverify

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# IPFS (Pinata)
PINATA_JWT=your-pinata-jwt

# Blockchain (Sepolia)
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=your-deployer-wallet-private-key
CONTRACT_ADDRESS=deployed-contract-address

# AI
GEMINI_API_KEY=your-gemini-api-key

# Frontend URL
CLIENT_URL=http://localhost:5173
```

### Frontend Environment
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## 📚 Documentation Index

Detailed documentation is available in the `/md-files` directory:

1. **[Backend Architecture](./md-files/BACKEND-ARCHITECTURE.md)** - API structure, features, verification pipeline
2. **[Frontend Guide](./md-files/FRONTEND-GUIDE.md)** - React app, components, state management
3. **[Browser Extension](./md-files/EXTENSION-GUIDE.md)** - Extension architecture, verification flow
4. **[Blockchain Integration](./md-files/BLOCKCHAIN-INTEGRATION.md)** - Smart contracts, IPFS, on-chain verification
5. **[Testing Guide](./md-files/TESTING-GUIDE.md)** - Test scripts, development workflow
6. **[API Reference](./md-files/API-REFERENCE.md)** - Complete API endpoint documentation

## 🎯 Core Workflows

### Certificate Verification Flow
```
1. User uploads certificate
   ↓
2. AI extracts data (OCR + LLM)
   ↓
3. Domain validation (trusted platforms)
   ↓
4. Name matching (fuzzy algorithm)
   ↓
5. Score calculation (weighted)
   ↓
6. Upload to IPFS (Pinata)
   ↓
7. Register on blockchain (fingerprint → CID)
   ↓
8. Save to MongoDB (metadata + blockchain refs)
   ↓
9. Auto-approve if score ≥85% OR manual review
```

### Browser Extension Flow
```
1. User navigates to certificate page
   ↓
2. Extension detects platform
   ↓
3. One-click "Verify" button
   ↓
4. Screenshot + URL sent to backend
   ↓
5. Backend runs verification pipeline
   ↓
6. Results displayed in extension popup
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Integration Tests
```bash
cd test-scripts/blockchain
npm install
node test-full-pipeline.js
```

### Extension Testing
1. Load unpacked extension in Chrome
2. Navigate to supported platform (e.g., Coursera certificate)
3. Click extension icon → "Verify Certificate"

## 🔐 Security

- **JWT Authentication**: HTTP-only cookies, 7-day expiration
- **Role-Based Access Control**: Credentialist, Validant, Curator roles
- **Input Sanitization**: MongoDB injection prevention
- **Blockchain Security**: Owner-only contract registration
- **API Rate Limiting**: Express rate limiter (planned)

## 🌐 Supported Platforms

**50+ platforms including:**
- MOOCs: Coursera, edX, Udemy, Udacity
- Coding: LeetCode, HackerRank, Codeforces
- Government: NPTEL, SWAYAM, DigiLocker
- Professional: LinkedIn Learning, Google Certifications
- Universities: Various Indian institutions

## 📊 Project Status

- ✅ Backend API (fully functional)
- ✅ Frontend SPA (core features complete)
- ✅ Browser Extension (v1.0 functional)
- ✅ Blockchain Integration (testnet deployed)
- ✅ IPFS Storage (Pinata integrated)
- ✅ AI Verification (OCR + LLM working)
- 🚧 DigiLocker (mock server ready, integration in progress)
- 🚧 Mobile app (planned)

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) file

## 👥 Team

**MicroCredentials Team**
- Lead Developer: [@MrPiyush67](https://github.com/MrPiyush67)

## 🐛 Known Issues & Roadmap

### Current Limitations
- Extension only supports Chromium browsers (Firefox planned)
- Blockchain on testnet only (mainnet deployment pending)
- Some platforms require manual review

### Roadmap
- [ ] Polygon mainnet deployment
- [ ] Mobile application (React Native)
- [ ] API rate limiting
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Credential sharing/embedding
- [ ] PDF certificate generation

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MrPiyush67/CredVerify-full/issues)
- **Documentation**: `/md-files` directory
- **Email**: [propiyushyt2005@gmail.com](mailto:propiyushyt2005@gmail.com)

---

**Built with  using modern web technologies and blockchain**
