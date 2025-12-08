# Documentation Index - CredVerify

Complete documentation for the CredVerify AI-powered certificate verification platform.

## 📚 Core Documentation

### 1. [README.md](../README.md) - **Start Here**
Complete project overview with:
- What is CredVerify?
- Key features for all user types
- Technology stack
- Quick start guide
- Architecture overview
- Project status & roadmap

### 2. [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
Backend API server documentation:
- Feature-based architecture
- Verification pipeline (9-10 stages)
- API endpoints & authentication
- Database models
- Services & business logic
- Environment configuration
- Development guide

### 3. [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md)
React frontend application:
- Component architecture
- Routing & route guards
- State management (Redux Toolkit)
- API integration
- Feature modules breakdown
- Common components
- Development guide

### 4. [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md)
Browser extension documentation:
- One-click verification flow
- Platform whitelisting (50+ platforms)
- Anti-tamper protection
- Installation guide (Chrome/Firefox)
- Usage instructions
- Security features

### 5. [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md)
Blockchain & IPFS integration:
- Smart contract details
- IPFS storage via Pinata
- On-chain registration flow
- Deployment guide (Remix/Hardhat)
- Testing procedures
- Troubleshooting

### 6. [TESTING-GUIDE.md](./TESTING-GUIDE.md)
Complete testing documentation:
- Test environment setup
- Backend/Frontend/Extension testing
- Blockchain testing
- Integration testing
- Manual testing checklists
- Test scripts reference

---

## 🗂️ Legacy Documentation

These files contain specialized technical documentation:

- **ANTI-TAMPER-ACTIVE.md** - Detailed anti-tamper implementation (perceptual hashing, attack vectors)
- **FLOW-DIAGRAM.md** - DigiLocker OAuth flow diagrams (complete integration flow)

---

## 📖 Quick Links

### For Developers

**First-time setup**:
1. Read [README.md](../README.md) - Project overview
2. Follow Quick Start guide
3. Read [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md) - Backend setup
4. Read [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md) - Frontend setup

**Working on specific components**:
- Backend API: [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
- Frontend UI: [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md)
- Browser Extension: [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md)
- Blockchain: [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md)

**Testing**:
- [TESTING-GUIDE.md](./TESTING-GUIDE.md) - All testing procedures
- [../test-scripts/README.md](../test-scripts/README.md) - Test scripts index

### For Users

**Getting started**:
1. Read [README.md](../README.md) - What is CredVerify?
2. Check "Quick Start" section
3. Install browser extension: [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md)

**Using the platform**:
- **Learners**: Upload & verify certificates
- **Regulators**: Review & approve credentials
- **Employers**: Post jobs & review applications

### For Contributors

1. Read [README.md](../README.md) - Project overview & architecture
2. Check "Contributing" section
3. Read relevant documentation for your contribution area
4. Follow testing guide: [TESTING-GUIDE.md](./TESTING-GUIDE.md)

---

## 📂 Directory Structure

```
credVerify/
├── README.md                          ⭐ Start here
├── md-files/                          📚 All documentation
│   ├── INDEX.md                       ← You are here
│   ├── BACKEND-ARCHITECTURE.md        🔧 Backend docs
│   ├── FRONTEND-GUIDE.md              🎨 Frontend docs
│   ├── EXTENSION-GUIDE.md             🔌 Extension docs
│   ├── BLOCKCHAIN-INTEGRATION.md      ⛓️ Blockchain docs
│   ├── TESTING-GUIDE.md               🧪 Testing docs
│   ├── ANTI-TAMPER-ACTIVE.md          📜 Historical
│   └── FLOW-DIAGRAM.md                📜 Historical
│
├── backend/
│   ├── README.md                      → Points to md-files
│   └── ...
├── frontend/
│   ├── README.md                      → Points to md-files
│   └── ...
├── extension/
│   ├── README.md                      → Points to md-files
│   └── ...
└── test-scripts/
    ├── README.md                      🧪 Test scripts index
    └── blockchain/
```

---

## 🔍 Find What You Need

### Common Questions

**Q: How do I set up the project?**
→ [README.md](../README.md) - Quick Start section

**Q: How does the verification pipeline work?**
→ [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md) - Verification Pipeline section

**Q: How do I deploy the smart contract?**
→ [BLOCKCHAIN-INTEGRATION.md](./BLOCKCHAIN-INTEGRATION.md) - Deployment Guide section

**Q: How do I test the extension?**
→ [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md) - Usage section
→ [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Extension Testing section

**Q: What platforms are supported?**
→ [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md) - Platform Detection section
→ See `extension/platforms.json` for full list

**Q: How do I add a new feature?**
→ [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md) - Adding a New Feature
→ [FRONTEND-GUIDE.md](./FRONTEND-GUIDE.md) - Adding a New Feature

**Q: Where are the API endpoints?**
→ [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md) - API Endpoints section

**Q: How do I run tests?**
→ [TESTING-GUIDE.md](./TESTING-GUIDE.md) - Running Tests section

---

## 📊 Documentation Stats

- **Total Docs**: 6 comprehensive guides
- **Total Pages**: ~50 pages (estimated)
- **Coverage**: 100% of major components
- **Last Updated**: December 4, 2025

---

## 🔄 Keeping Docs Updated

When making changes:

1. **Code Changes**: Update relevant doc section
2. **New Features**: Add to appropriate guide + README.md
3. **Breaking Changes**: Update all affected docs
4. **API Changes**: Update BACKEND-ARCHITECTURE.md
5. **New Tests**: Update TESTING-GUIDE.md

---

## 📝 Documentation Style Guide

- Use Markdown for all docs
- Include code examples
- Add troubleshooting sections
- Keep consistent structure
- Update "Last Updated" date

---

**Need help?** Check [README.md](../README.md) for contact information.

**Last Updated**: December 4, 2025
