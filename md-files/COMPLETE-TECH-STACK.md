# 🚀 CredVerify - Complete Technical Stack & Architecture

> **Prepared for SIH Hackathon** - Last Updated: December 7, 2025

## 📋 Table of Contents
- [Overview](#overview)
- [Backend Architecture](#backend-architecture)
- [Frontend Architecture](#frontend-architecture)
- [Browser Extension Architecture](#browser-extension-architecture)
- [Mock DigiLocker Service](#mock-digilocker-service)
- [Blockchain Integration](#blockchain-integration)
- [Development & Testing](#development--testing)

---

## 🎯 Overview

**CredVerify** is an AI-powered certificate verification platform that combines OCR, blockchain, and machine learning to verify the authenticity of digital credentials. The system includes a web application, browser extension, and DigiLocker integration.

### Core Features
- ✅ AI-powered certificate verification with OCR
- ✅ Blockchain-based immutable certificate storage (Ethereum)
- ✅ Browser extension for automatic certificate extraction
- ✅ DigiLocker integration for government document verification
- ✅ Multi-role platform (User, Credentialist, Validant, Curator)
- ✅ Real-time notifications and chat system
- ✅ Job board and credential marketplace

---

## 🔧 Backend Architecture

### **Core Framework & Server**
```
Framework: Express.js v4.19.2
Runtime: Node.js (ES Modules)
Server: HTTP Server with Socket.IO
Database: MongoDB v8.4.0 (Mongoose ODM)
Port: 5000
Host: 0.0.0.0
```

### **Complete Technology Stack**

#### **1. Core Dependencies**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express.js** | ^4.19.2 | Web application framework |
| **Mongoose** | ^8.4.0 | MongoDB ODM |
| **Socket.IO** | ^4.8.1 | Real-time bidirectional communication |
| **Dotenv** | ^16.4.5 | Environment variable management |

#### **2. Security & Authentication**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **jsonwebtoken** | ^9.0.2 | JWT token generation & verification |
| **bcryptjs** | ^2.4.3 | Password hashing |
| **helmet** | ^7.1.0 | HTTP security headers |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **express-mongo-sanitize** | ^2.2.0 | NoSQL injection prevention |
| **cookie-parser** | ^1.4.6 | Cookie parsing middleware |

#### **3. AI & Machine Learning**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **@google/generative-ai** | ^0.21.0 | Google Gemini AI for LLM interpretation |
| **Tesseract.js** | ^5.1.1 | OCR text extraction from certificates |
| **string-similarity** | ^4.0.4 | Name matching algorithm |

#### **4. Image Processing & OCR**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **sharp** | ^0.34.5 | ⭐ **High-performance image processing** |
| **jimp** | ^1.6.0 | JavaScript image manipulation |
| **jsqr** | ^1.4.0 | QR code detection & extraction |

**Sharp Usage Details:**
- **Location:** `backend/src/features/credential/services/ocr.service.js`
- **Functions:**
  1. **SVG to PNG Conversion:** Converts SVG certificates to 2000px width PNG for OCR processing
  2. **Image Preprocessing:** 
     - Upscale to 2000px for better OCR accuracy
     - Convert to grayscale
     - Sharpen edges for text clarity
     - Normalize contrast
- **Why Sharp?** Extremely fast native image processing (10-20x faster than alternatives)

#### **5. Web Scraping & Automation**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **puppeteer** | ^24.32.0 | Headless browser automation |
| **puppeteer-extra** | ^3.3.6 | Puppeteer plugin framework |
| **puppeteer-extra-plugin-stealth** | ^2.11.2 | Anti-detection for scraping |
| **axios** | ^1.13.2 | HTTP client for API requests |
| **cheerio** | ^1.1.2 | HTML parsing & manipulation |

#### **6. Blockchain Integration**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **ethers** | ^6.8.0 | Ethereum blockchain interaction |
| **form-data** | ^4.0.0 | Multipart form data (IPFS uploads) |

#### **7. Storage & File Management**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **imagekit** | ^5.2.0 | Cloud image storage & CDN |
| **multer** | ^2.0.2 | Multipart/form-data file uploads |
| **IPFS (Pinata API)** | - | Decentralized certificate storage |

#### **8. Utilities**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **qrcode** | ^1.5.4 | QR code generation |
| **nodemailer** | ^7.0.11 | Email notifications |

### **Backend Architecture Layers**

```
┌─────────────────────────────────────────────────────────────┐
│                       Express App (app.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Security Layer                                              │
│  ├─ Helmet (HTTP headers)                                    │
│  ├─ CORS (Cross-origin)                                      │
│  ├─ Mongo Sanitize (NoSQL injection)                         │
│  └─ JWT Authentication                                       │
├─────────────────────────────────────────────────────────────┤
│  API Routes (/api)                                           │
│  ├─ /users          - User management                        │
│  ├─ /credentials    - Certificate verification               │
│  ├─ /credentialist  - Credential issuer role                 │
│  ├─ /validant       - Validator role                         │
│  ├─ /curator        - Curator role                           │
│  ├─ /jobs           - Job postings                           │
│  ├─ /chat           - Real-time chat                         │
│  ├─ /notifications  - User notifications                     │
│  ├─ /dashboard      - Analytics                              │
│  ├─ /platform       - Platform verifiers                     │
│  └─ /digilocker     - DigiLocker OAuth integration           │
├─────────────────────────────────────────────────────────────┤
│  Verification Pipeline (8 Stages)                            │
│  ├─ 01. Input Normalizer      - Standardize input           │
│  ├─ 02. Domain Validator      - Verify source URL           │
│  ├─ 03. Certificate Extractor - Image extraction            │
│  ├─ 04. OCR Extractor         - Text extraction with Sharp  │
│  ├─ 05. LLM Interpreter       - AI data extraction          │
│  ├─ 06. Name Matcher          - Fuzzy name matching         │
│  ├─ 07. Score Calculator      - Confidence scoring          │
│  └─ 08. Credential Saver      - Save to DB + Blockchain     │
├─────────────────────────────────────────────────────────────┤
│  Services Layer                                              │
│  ├─ OCR Service (Sharp + Tesseract)                         │
│  ├─ LLM Service (Google Gemini)                             │
│  ├─ Blockchain Service (Ethers.js)                          │
│  ├─ IPFS Service (Pinata)                                   │
│  ├─ ImageKit Service (Cloud storage)                        │
│  ├─ Email Service (Nodemailer)                              │
│  └─ Platform Verifiers (Coursera, Udemy, etc.)              │
├─────────────────────────────────────────────────────────────┤
│  Database Models (MongoDB)                                   │
│  ├─ User                                                     │
│  ├─ Credential                                               │
│  ├─ Job                                                      │
│  ├─ Chat                                                     │
│  ├─ Notification                                             │
│  ├─ Platform                                                 │
│  └─ Settings (Credentialist, Validant, Curator)             │
├─────────────────────────────────────────────────────────────┤
│  Socket.IO (Real-time)                                       │
│  ├─ Chat messages                                            │
│  ├─ Notifications                                            │
│  └─ Verification status updates                             │
└─────────────────────────────────────────────────────────────┘
```

### **Environment Variables**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/microcredentials
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# Google Gemini AI
GEMINI_API_KEY=your-gemini-key

# Blockchain
ETHEREUM_RPC_URL=https://rpc.ankr.com/eth_sepolia
CONTRACT_ADDRESS=0x...
PRIVATE_KEY=0x...

# IPFS (Pinata)
PINATA_API_KEY=your-pinata-key
PINATA_SECRET_KEY=your-pinata-secret

# ImageKit
IMAGEKIT_PUBLIC_KEY=your-imagekit-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private
IMAGEKIT_URL_ENDPOINT=your-imagekit-url

# DigiLocker
DIGILOCKER_CLIENT_ID=your-client-id
DIGILOCKER_CLIENT_SECRET=your-client-secret
DIGILOCKER_REDIRECT_URI=http://localhost:5000/api/digilocker/callback
```

---

## 💻 Frontend Architecture

### **Core Framework**
```
Framework: React 19.1.1
Build Tool: Vite 7.1.7
State Management: Redux Toolkit 2.9.1
Routing: React Router DOM 7.9.4
Styling: Tailwind CSS 4.1.14
```

### **Complete Technology Stack**

#### **1. Core React Ecosystem**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | ^19.1.1 | UI library |
| **React DOM** | ^19.1.1 | React rendering |
| **React Router DOM** | ^7.9.4 | Client-side routing |
| **@reduxjs/toolkit** | ^2.9.1 | State management |
| **react-redux** | ^9.2.0 | React-Redux bindings |
| **redux-persist** | ^6.0.0 | Persist Redux state |

#### **2. Build & Development Tools**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Vite** | ^7.1.7 | Fast build tool & dev server |
| **@vitejs/plugin-react** | ^5.0.4 | React fast refresh |
| **ESLint** | ^9.36.0 | Code linting |
| **@tailwindcss/vite** | ^4.1.14 | Tailwind CSS Vite plugin |
| **@tailwindcss/postcss** | ^4.1.14 | PostCSS plugin |

#### **3. UI Components & Styling**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Tailwind CSS** | ^4.1.14 | Utility-first CSS framework |
| **tailwind-merge** | ^3.3.1 | Merge Tailwind classes |
| **Framer Motion** | ^12.23.25 | Animation library |
| **Lucide React** | ^0.545.0 | Icon library |
| **@radix-ui/react-dropdown-menu** | ^2.1.16 | Accessible dropdown menus |

#### **4. Real-time & Communication**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **socket.io-client** | ^4.8.1 | Real-time WebSocket client |
| **axios** | ^1.12.2 | HTTP client |
| **react-hot-toast** | ^2.6.0 | Toast notifications |

#### **5. Charts & Visualization**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Recharts** | ^3.2.1 | Chart library for analytics |

#### **6. Document Generation**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **jspdf** | ^3.0.4 | PDF generation |
| **html2canvas** | ^1.4.1 | HTML to canvas conversion |

#### **7. QR Code Scanning**
| Technology | Version | Purpose |
|-----------|---------|---------|
| **@zxing/browser** | ^0.1.5 | QR code scanning in browser |

### **Frontend Architecture Structure**

```
frontend/
├── src/
│   ├── main.jsx                    # Entry point
│   ├── app/
│   │   ├── App.jsx                 # Root component
│   │   ├── routes.jsx              # Route configuration
│   │   └── store.js                # Redux store setup
│   ├── common/
│   │   ├── components/             # Shared components
│   │   │   ├── ErrorBoundary.jsx
│   │   │   ├── Loader.jsx
│   │   │   └── ...
│   │   └── ui/                     # UI primitives
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       ├── Input.jsx
│   │       ├── Badge.jsx
│   │       └── ...
│   ├── features/
│   │   ├── auth/                   # Authentication
│   │   ├── dashboard/              # Dashboard & analytics
│   │   ├── verification/           # Certificate verification
│   │   ├── credentials/            # Credential management
│   │   ├── jobs/                   # Job board
│   │   ├── chat/                   # Real-time chat
│   │   ├── notifications/          # Notification center
│   │   └── settings/               # User settings
│   ├── services/
│   │   ├── api.js                  # API service
│   │   ├── auth.service.js
│   │   ├── credential.service.js
│   │   ├── socket.service.js
│   │   └── ...
│   ├── utils/
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── constants.js
│   └── styles/
│       └── index.css               # Global styles + Tailwind
├── public/
│   ├── landing/                    # Landing page assets
│   ├── auth/                       # Auth page assets
│   └── manifest.json               # PWA manifest
├── vite.config.js                  # Vite configuration
├── package.json
└── vercel.json                     # Vercel deployment config
```

### **State Management Architecture**

```javascript
Redux Store Structure:
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean
  },
  credentials: {
    list: Credential[],
    selected: Credential | null,
    loading: boolean
  },
  notifications: {
    list: Notification[],
    unreadCount: number
  },
  chat: {
    conversations: Conversation[],
    messages: Message[],
    activeChat: string | null
  }
}
```

### **Frontend Build Configuration**

```javascript
// vite.config.js
export default {
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}
```

---

## 🔌 Browser Extension Architecture

### **Extension Technology Stack**

#### **1. Manifest V3 Configuration**
```json
{
  "manifest_version": 3,
  "name": "CredVerify Certificate Extractor",
  "version": "2.1",
  "permissions": ["scripting", "activeTab", "storage", "tabs"],
  "host_permissions": ["https://*/*"]
}
```

#### **2. Core Components**
| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Background Script** | Service Worker | API communication, domain validation |
| **Popup UI** | Vanilla JavaScript + CSS | User interface |
| **Content Scripts** | JavaScript | Page DOM manipulation |
| **Config** | JSON | Backend URL configuration |

#### **3. Extension Features**
- ✅ Whitelisted domain detection (Coursera, Udemy, LinkedIn Learning, etc.)
- ✅ Automatic certificate image detection (min 400x200px)
- ✅ Anti-tamper protection with image hashing
- ✅ OCR text extraction preview
- ✅ Direct upload to CredVerify backend
- ✅ JWT-based authentication

### **Extension Architecture**

```
extension/
├── manifest.json              # Extension manifest
├── config.js                  # Backend API configuration
├── platforms.json             # Whitelisted platforms list
├── js/
│   ├── background.js          # Service worker (API proxy)
│   ├── popup.js               # Main popup logic
│   └── login.js               # Authentication flow
├── html/
│   ├── popup.html             # Main popup UI
│   └── login.html             # Login page
├── css/
│   ├── popup.css              # Popup styles
│   └── tokens.css             # Design tokens
└── icons/                     # Extension icons
```

### **Extension Flow**

```
┌──────────────────────────────────────────────────────────────┐
│  1. User opens extension on certificate page                 │
│     ↓                                                         │
│  2. Background checks if domain is whitelisted               │
│     ↓                                                         │
│  3. Content script scans page for certificate images         │
│     (images >= 400x200px rendered size)                      │
│     ↓                                                         │
│  4. User selects certificate from list                       │
│     ↓                                                         │
│  5. Anti-tamper: Calculate baseline image hash               │
│     ↓                                                         │
│  6. On verify click:                                         │
│     - Re-fetch image and compare hash                        │
│     - If hash matches, proceed                               │
│     - Convert to base64                                      │
│     ↓                                                         │
│  7. Send to backend via background script:                   │
│     POST /api/credentials/extension/verify                   │
│     Headers: Authorization: Bearer <JWT>                     │
│     Body: { imageData, sourceUrl, imageType }                │
│     ↓                                                         │
│  8. Display verification results in popup                    │
└──────────────────────────────────────────────────────────────┘
```

### **Supported Platforms**
- Coursera
- Udemy
- edX
- LinkedIn Learning
- Udacity
- Khan Academy
- Codecademy
- FreeCodeCamp
- Great Learning
- Simplilearn
- UpGrad
- NPTEL
- Swayam

---

## 🏦 Mock DigiLocker Service

### **Technology Stack**
```
Framework: Express.js
Template Engine: JavaScript template strings
OAuth: OAuth 2.0 implementation
Port: 3002
```

### **Components**
| Component | Purpose |
|-----------|---------|
| **OAuth Server** | OAuth 2.0 authorization & token endpoints |
| **User Store** | Mock user database |
| **Document Store** | Mock document storage |
| **Templates** | HTML templates for login, consent, document selection |

### **API Endpoints**
```
GET  /public/oauth2/1/authorize      - Authorization page
POST /public/oauth2/1/token          - Token exchange
GET  /public/oauth2/1/user_info      - User information
GET  /public/oauth2/1/files          - List documents
POST /public/oauth2/1/files/download - Download document
```

---

## ⛓️ Blockchain Integration

### **Technology**
- **Library:** ethers.js v6.8.0
- **Network:** Ethereum Sepolia Testnet
- **Smart Contract:** Solidity-based Certificate Registry
- **Storage:** IPFS (Pinata) for certificate metadata

### **Smart Contract Features**
```solidity
contract CertificateRegistry {
    function registerCertificate(string ipfsHash) returns (uint256 tokenId)
    function verifyCertificate(uint256 tokenId) returns (bool, string)
    function getCertificate(uint256 tokenId) returns (CertificateData)
}
```

### **Blockchain Verification Flow**
```
Certificate → IPFS Upload → Smart Contract Registration → On-chain Verification
```

---

## 🧪 Development & Testing

### **Test Scripts Technology**
```
Framework: Node.js
Test Runner: Custom test scripts
Libraries: axios, form-data
```

### **Test Categories**
```
test-scripts/
├── authentication/           # Auth flow tests
├── blockchain/              # Blockchain integration tests
├── integration/             # End-to-end tests
├── platforms/               # Platform verifier tests
└── verification/            # Certificate verification tests
```

### **Testing Tools**
- Manual testing scripts for each component
- Integration tests for DigiLocker
- Blockchain pipeline tests
- End-to-end verification flows

---

## 🚀 Deployment Architecture

### **Backend Deployment**
- Platform: Any Node.js hosting (Render, Railway, Heroku)
- Database: MongoDB Atlas
- Storage: ImageKit CDN, IPFS (Pinata)
- Blockchain: Ethereum Sepolia Testnet

### **Frontend Deployment**
- Platform: Vercel
- CDN: Vercel Edge Network
- Build: Vite production build

### **Extension Distribution**
- Chrome Web Store
- Firefox Add-ons
- Edge Add-ons

---

## 📊 System Performance Metrics

### **Image Processing (Sharp)**
- SVG to PNG conversion: ~100-200ms
- Image preprocessing: ~50-100ms
- 10-20x faster than pure JavaScript alternatives

### **OCR Processing (Tesseract)**
- Average extraction time: 2-5 seconds
- Accuracy: 85-95% depending on image quality

### **LLM Interpretation (Gemini)**
- Response time: 1-3 seconds
- Structured data extraction with high accuracy

### **Overall Verification Time**
- Extension flow: 5-10 seconds
- Manual upload flow: 8-15 seconds
- Blockchain confirmation: 15-30 seconds

---

## 🔐 Security Features

1. **JWT Authentication** - 7-day token expiry
2. **Password Hashing** - bcrypt with salt rounds
3. **HTTP Security** - Helmet middleware
4. **NoSQL Injection Prevention** - Mongo sanitization
5. **CORS Protection** - Whitelisted origins
6. **Anti-tamper Protection** - Image hash verification in extension
7. **Role-based Access Control** - User, Credentialist, Validant, Curator

---

## 📝 Notes for SIH Presentation

### **Key Differentiators:**
1. ✅ **AI-Powered:** Google Gemini + Tesseract OCR
2. ✅ **Blockchain:** Immutable certificate storage
3. ✅ **Browser Extension:** Automatic certificate detection
4. ✅ **DigiLocker Integration:** Government document verification
5. ✅ **Multi-role Platform:** Ecosystem for issuers, validators, curators

### **Tech Highlights:**
- Modern stack (React 19, Vite 7, Tailwind 4)
- High-performance image processing (Sharp)
- Real-time communication (Socket.IO)
- Decentralized storage (IPFS)
- Smart contracts (Solidity)

### **Scalability:**
- Microservices-ready architecture
- Horizontal scaling with load balancers
- MongoDB sharding support
- CDN for static assets
- Caching strategies (Redis-ready)

---

**🎉 End of Technical Documentation**
