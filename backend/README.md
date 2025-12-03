# MicroCredentials Backend API

A modern, feature-based backend architecture for the MicroCredentials platform using Node.js, Express, and MongoDB.

## 🏗️ Architecture

### Feature-Based Structure
Each domain (user, credentialist, validant, curator, credential, chat) is encapsulated in its own feature module with:
- **Model**: Mongoose    schema
- **Service**: Business logic layer
- **Controller**: HTTP request handlers
- **Routes**: Express route definitions

### Base + Profile System
- **Base User Model**: Handles authentication (email, password, role)
- **Role-Specific Profiles**: Separate collections for each role's unique data
  - CredentialistProfile (education, achievements, experience)
  - ValidantProfile (institution, verification authority)
  - CuratorProfile (company info, job management)

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (v5+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd backend-new
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
src/
├── core/                     # Shared infrastructure
│   ├── config/              # Database, environment config
│   ├── constants/           # Roles, messages
│   ├── middleware/          # Auth, error handling, role guards
│   └── utils/               # Helper functions
│
├── features/                # Domain modules
│   ├── user/               # Base authentication
│   ├── credentialist/      # Credentialist profiles
│   ├── validant/           # Verification logic
│   ├── curator/            # Job management
│   ├── credential/         # Certificate uploads
│   └── chat/               # Messaging system
│
├── app.js                  # Express app setup
└── server.js               # Server entry point
```

## 🔐 Roles

- **Credentialist**: Upload and manage credentials, apply to jobs
- **Validant**: Verify credentials, review submissions
- **Curator**: Post jobs, manage applicants, explore credentialists

## 📡 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/user/me` - Get current user profile
- `PATCH /api/user/me` - Update user profile

### Credentialist
- `GET /api/credentialist/profile` - Get own profile
- `PATCH /api/credentialist/profile` - Update profile
- `POST /api/credentialist/education` - Add education
- `POST /api/credentialist/achievements` - Add achievement
- `POST /api/credentialist/experience` - Add experience

### Validant
- `GET /api/validant/profile` - Get profile
- `PATCH /api/validant/profile` - Update profile
- `GET /api/validant/credentials/pending` - Get pending credentials
- `POST /api/validant/credentials/:id/verify` - Verify credential
- `POST /api/validant/credentials/:id/reject` - Reject credential
- `GET /api/validant/stats` - Get verification statistics

### Curator
- `GET /api/curator/profile` - Get profile
- `PATCH /api/curator/profile` - Update profile
- `POST /api/curator/jobs` - Create job
- `GET /api/curator/jobs` - Get my jobs
- `GET /api/curator/jobs/:id` - Get job by ID
- `PATCH /api/curator/jobs/:id` - Update job
- `DELETE /api/curator/jobs/:id` - Delete job
- `GET /api/curator/jobs/:id/applicants` - Get job applicants
- `PATCH /api/curator/jobs/:jobId/applicants/:applicantId` - Update applicant status

### Credentials
- `POST /api/credentials` - Upload credential
- `GET /api/credentials` - Get my credentials
- `GET /api/credentials/:id` - Get credential by ID
- `PATCH /api/credentials/:id` - Update credential
- `DELETE /api/credentials/:id` - Delete credential
- `POST /api/credentials/:id/request-verification` - Request verification
- `GET /api/credentials/verified` - Get verified credentials
- `GET /api/credentials/stats` - Get credential stats

### Digilocker Integration
- `GET /api/digilocker/auth` - Start Digilocker OAuth flow (requires auth)
- `GET /api/digilocker/callback` - OAuth callback handler
- `GET /api/digilocker/files` - Fetch user's Digilocker files (requires auth)
- `POST /api/digilocker/import` - Import selected files to credentials (requires auth)

### Chat
- `POST /api/chat/conversations` - Start conversation
- `GET /api/chat/conversations` - Get my conversations
- `GET /api/chat/conversations/:id/messages` - Get messages
- `POST /api/chat/conversations/:id/messages` - Send message
- `PATCH /api/chat/messages/:id/read` - Mark as read
- `GET /api/chat/unread-count` - Get unread count

### Jobs (Public)
- `GET /api/jobs` - Get all active jobs
- `POST /api/jobs/:id/apply` - Apply to job

## 🛡️ Security Features

- JWT-based authentication
- HTTP-only cookies
- Helmet.js security headers
- MongoDB sanitization
- Role-based access control (RBAC)
- Input validation

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `dotenv` - Environment variables

### Security
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT tokens
- `helmet` - Security headers
- `express-mongo-sanitize` - NoSQL injection prevention
- `cookie-parser` - Cookie handling
- `cors` - Cross-origin resource sharing

## 🚧 Development

```bash
# Install dependencies
npm install

# Run in development mode with hot reload
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 Environment Variables

See `.env.example` for all required environment variables.

### Digilocker Sandbox Setup

To enable Digilocker integration:

1. Register for sandbox access at https://sandbox.digilocker.gov.in/
2. Create a new application and get your `CLIENT_ID` and `CLIENT_SECRET`
3. Set the redirect URI to `http://localhost:5000/api/digilocker/callback` (or your production URL)
4. Add these variables to your `.env` file:
   ```
   DIGILOCKER_CLIENT_ID=your_sandbox_client_id
   DIGILOCKER_CLIENT_SECRET=your_sandbox_client_secret
   DIGILOCKER_REDIRECT_URI=http://localhost:5000/api/digilocker/callback
   FRONTEND_URL=http://localhost:5173
   ```

**Note**: The integration uses Digilocker **Sandbox** environment for testing. For production, you'll need to update the URLs in `src/core/config/env.js` to use the production Digilocker endpoints.

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

MIT

## 👥 Team

MicroCredentials Platform Team

---

**Built with ❤️ using feature-based architecture and clean code principles**
