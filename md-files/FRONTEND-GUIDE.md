# Frontend Guide - CredVerify

Complete documentation for the CredVerify React frontend application.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [Core Concepts](#core-concepts)
5. [Routing](#routing)
6. [State Management](#state-management)
7. [API Integration](#api-integration)
8. [Feature Modules](#feature-modules)
9. [Common Components](#common-components)
10. [Styling System](#styling-system)
11. [Development Guide](#development-guide)

---

## Overview

### Technology Stack
- **Framework**: React 18.3
- **Build Tool**: Vite 6.0
- **State Management**: Redux Toolkit 2.5
- **Routing**: React Router 7.0
- **HTTP Client**: Axios 1.7
- **Real-time**: Socket.IO Client
- **UI Libraries**: Custom components (no framework like MUI/Ant Design)
- **Styling**: Custom CSS with CSS variables

### Key Features
- ✅ Role-based routing (Learner/Regulator/Employer)
- ✅ Protected routes with authentication guards
- ✅ Redux Toolkit for global state
- ✅ Lazy-loaded route components
- ✅ Real-time notifications via Socket.IO
- ✅ JWT authentication via HTTP-only cookies
- ✅ Responsive design
- ✅ File uploads (certificates, images)
- ✅ DigiLocker OAuth integration

---

## Architecture

### Feature-Based Structure

The frontend follows a **feature-based architecture** where each domain is self-contained:

```
src/
├── app/                    # App configuration & store
├── features/               # Feature modules (domains)
│   ├── auth/               # Authentication
│   ├── credentials/        # Credential management
│   ├── verification/       # Manual verification (Regulator)
│   ├── jobs/               # Job postings (Employer)
│   ├── chat/               # Messaging
│   ├── notifications/      # Notifications
│   ├── profile/            # User profiles
│   ├── settings/           # Settings pages
│   ├── dashboard/          # Analytics
│   ├── home/               # Homepage
│   ├── landing/            # Landing page
│   └── platforms/          # Platform registry
├── common/                 # Shared resources
│   ├── components/         # Reusable UI components
│   ├── layouts/            # Layout components
│   └── ui/                 # Base UI primitives
├── services/               # API clients
├── styles/                 # Global CSS
└── utils/                  # Helper functions
```

### Component Hierarchy

```
App.jsx
  ↓
AppRoutes (routes.jsx)
  ↓
Route Guards (PublicRoute / ProtectedRoute)
  ↓
Feature Pages (LoginPage, CredentialsPage, etc.)
  ↓
Feature Components + Common Components
```

---

## Project Structure

```
frontend/
├── public/
│   ├── manifest.json               # PWA manifest
│   ├── auth/                       # Auth page assets
│   ├── credantial-template/        # Certificate templates
│   └── landing/                    # Landing page assets
│
├── src/
│   ├── main.jsx                    # Entry point
│   │
│   ├── app/
│   │   ├── App.jsx                 # Root component
│   │   ├── routes.jsx              # Route definitions
│   │   └── store.js                # Redux store configuration
│   │
│   ├── features/
│   │   ├── auth/
│   │   │   ├── pages/
│   │   │   │   ├── LoginPage.jsx
│   │   │   │   └── SignupPage.jsx
│   │   │   ├── redux/
│   │   │   │   └── authSlice.js    # Auth state
│   │   │   └── api/
│   │   │       └── authApi.js      # Auth API calls
│   │   │
│   │   ├── credentials/
│   │   │   ├── pages/
│   │   │   │   ├── CredentialsPage.jsx         # List credentials
│   │   │   │   ├── AddCredentialsPage.jsx      # Upload credential
│   │   │   │   └── UploadMethodsGuidePage.jsx  # How to verify
│   │   │   ├── components/
│   │   │   │   ├── CredentialCard.jsx
│   │   │   │   ├── UploadCredentialForm.jsx
│   │   │   │   ├── DigiLockerButton.jsx
│   │   │   │   └── ExtensionPrompt.jsx
│   │   │   ├── redux/
│   │   │   │   └── credentialsSlice.js
│   │   │   └── api/
│   │   │       └── credentialsApi.js
│   │   │
│   │   ├── verification/
│   │   │   ├── pages/
│   │   │   │   ├── RequestsPage.jsx            # Regulator review queue
│   │   │   │   └── IssueCredentialsPage.jsx    # Manual credential issuance
│   │   │   └── components/
│   │   │       ├── VerificationQueue.jsx
│   │   │       └── ReviewCard.jsx
│   │   │
│   │   ├── jobs/
│   │   │   ├── pages/
│   │   │   │   ├── JobsPage.jsx                # Job listings
│   │   │   │   └── PostJobPage.jsx             # Create/edit job
│   │   │   ├── components/
│   │   │   │   ├── JobCard.jsx
│   │   │   │   └── JobForm.jsx
│   │   │   └── redux/
│   │   │       └── jobsSlice.js
│   │   │
│   │   ├── chat/
│   │   │   ├── pages/
│   │   │   │   └── ChatPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── ChatList.jsx
│   │   │   │   ├── ChatWindow.jsx
│   │   │   │   └── MessageInput.jsx
│   │   │   └── redux/
│   │   │       └── chatSlice.js
│   │   │
│   │   ├── notifications/
│   │   │   ├── pages/
│   │   │   │   └── NotificationsPage.jsx
│   │   │   ├── components/
│   │   │   │   └── NotificationList.jsx
│   │   │   └── redux/
│   │   │       └── notificationsSlice.js
│   │   │
│   │   ├── profile/
│   │   │   ├── pages/
│   │   │   │   └── ProfilePage.jsx
│   │   │   ├── components/
│   │   │   │   ├── ProfileHeader.jsx
│   │   │   │   ├── CredentialsList.jsx
│   │   │   │   └── EditProfileForm.jsx
│   │   │   └── redux/
│   │   │       └── profileSlice.js
│   │   │
│   │   ├── settings/
│   │   │   └── pages/
│   │   │       └── SettingsPage.jsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── pages/
│   │   │   │   └── DashboardPage.jsx
│   │   │   ├── components/
│   │   │   │   ├── StatsCard.jsx
│   │   │   │   └── ActivityChart.jsx
│   │   │   └── redux/
│   │   │       └── dashboardSlice.js
│   │   │
│   │   ├── home/
│   │   │   ├── pages/
│   │   │   │   └── HomePage.jsx
│   │   │   └── redux/
│   │   │       └── homeSlice.js
│   │   │
│   │   ├── landing/
│   │   │   └── pages/
│   │   │       └── LandingPage.jsx
│   │   │
│   │   └── platforms/
│   │       ├── components/
│   │       │   └── PlatformCard.jsx
│   │       └── redux/
│   │           └── platformsSlice.js
│   │
│   ├── common/
│   │   ├── components/
│   │   │   ├── ProtectedRoute.jsx      # Route guard
│   │   │   ├── PublicRoute.jsx         # Public route wrapper
│   │   │   ├── Navbar.jsx              # Top navigation
│   │   │   ├── Sidebar.jsx             # Side navigation
│   │   │   ├── Footer.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── ErrorBoundary.jsx
│   │   │   └── ...
│   │   ├── layouts/
│   │   │   ├── MainLayout.jsx
│   │   │   └── SettingsLayout.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Input.jsx
│   │       ├── Card.jsx
│   │       ├── Modal.jsx
│   │       └── ...
│   │
│   ├── services/
│   │   ├── axiosClient.js          # Axios instance with interceptors
│   │   ├── endpoints.js            # API endpoint definitions
│   │   └── socketService.js        # Socket.IO client wrapper
│   │
│   ├── styles/
│   │   └── index.css               # Global styles + CSS variables
│   │
│   └── utils/
│       ├── dateUtils.js            # Date formatting
│       ├── env.js                  # Environment variables
│       ├── helpers.js              # General utilities
│       └── ...
│
├── index.html                      # HTML entry point
├── vite.config.js                  # Vite configuration
├── eslint.config.js                # ESLint rules
├── package.json
└── vercel.json                     # Vercel deployment config
```

---

## Core Concepts

### 1. Authentication Flow

#### Login
1. User submits credentials via `LoginPage.jsx`
2. `authApi.login()` sends POST to `/api/auth/login`
3. Backend sets HTTP-only cookie with JWT
4. Frontend receives user data, dispatches `authSlice/setUser`
5. User state persisted to localStorage
6. Redirect to `/home` (or saved redirect path)

#### Signup
1. User submits registration form via `SignupPage.jsx`
2. `authApi.signup()` sends POST to `/api/auth/signup`
3. Backend creates user + role-specific profile
4. Auto-login (same as login flow)

#### Logout
1. User clicks logout
2. `authApi.logout()` sends POST to `/api/auth/logout`
3. Backend clears cookie
4. Frontend dispatches `authSlice/logout`, clears localStorage
5. Redirect to `/login`

#### Token Refresh
- JWT stored in HTTP-only cookie (not accessible to JS)
- Cookie sent automatically on every request
- No manual refresh needed (cookie handles it)
- 401 response triggers logout via axios interceptor

### 2. Role-Based Access

#### Roles
```javascript
ROLES = {
  CREDENTIALIST: 'learner',  // Certificate holders
  VALIDANT: 'regulator',            // Verifiers
  CURATOR: 'employer'               // Recruiters
}
```

#### Protected Routes
```jsx
// Learner-only
<Route element={<ProtectedRoute requiredRole="learner" />}>
  <Route path="/credentials" element={<CredentialsPage />} />
</Route>

// Regulator-only
<Route element={<ProtectedRoute requiredRole="regulator" />}>
  <Route path="/requests" element={<RequestsPage />} />
</Route>

// Employer-only
<Route element={<ProtectedRoute requiredRole="employer" />}>
  <Route path="/jobs" element={<JobsPage />} />
</Route>
```

#### Route Guards
```jsx
// ProtectedRoute.jsx
export default function ProtectedRoute({ requiredRole }) {
  const { user } = useSelector(state => state.auth);
  
  if (!user) return <Navigate to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" />;
  }
  
  return <Outlet />;
}
```

### 3. State Management (Redux Toolkit)

#### Store Structure
```javascript
{
  auth: {
    user: { id, email, name, role },
    loading: false,
    error: null
  },
  credentials: {
    items: [...],
    loading: false,
    error: null
  },
  jobs: { ... },
  chat: { ... },
  notifications: { ... },
  profile: { ... },
  settings: { ... },
  dashboard: { ... },
  platforms: { ... }
}
```

#### Example Slice (credentialsSlice.js)
```javascript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import credentialsApi from '../api/credentialsApi';

export const fetchCredentials = createAsyncThunk(
  'credentials/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await credentialsApi.getAll();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

const credentialsSlice = createSlice({
  name: 'credentials',
  initialState: { items: [], loading: false, error: null },
  reducers: {
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredentials.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCredentials.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCredentials.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = credentialsSlice.actions;
export default credentialsSlice.reducer;
```

#### Usage in Components
```jsx
import { useDispatch, useSelector } from 'react-redux';
import { fetchCredentials } from '@features/credentials/redux/credentialsSlice';

function CredentialsPage() {
  const dispatch = useDispatch();
  const { items, loading } = useSelector(state => state.credentials);
  
  useEffect(() => {
    dispatch(fetchCredentials());
  }, [dispatch]);
  
  if (loading) return <Loader />;
  return <div>{items.map(cred => <CredentialCard key={cred._id} {...cred} />)}</div>;
}
```

---

## Routing

### Route Configuration

See `src/app/routes.jsx`:

```jsx
export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* Protected routes (any role) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/home" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
      </Route>

      {/* Learner-only */}
      <Route element={<ProtectedRoute requiredRole="learner" />}>
        <Route path="/credentials" element={<CredentialsPage />} />
        <Route path="/credentials/add" element={<AddCredentialsPage />} />
        <Route path="/credentials/upload-guide" element={<UploadMethodsGuidePage />} />
      </Route>

      {/* Regulator-only */}
      <Route element={<ProtectedRoute requiredRole="regulator" />}>
        <Route path="/requests" element={<RequestsPage />} />
      </Route>

      {/* Employer-only */}
      <Route element={<ProtectedRoute requiredRole="employer" />}>
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/post-job" element={<PostJobPage />} />
        <Route path="/post-job/:id" element={<PostJobPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<div>404 page not found</div>} />
    </Routes>
  );
}
```

### Lazy Loading

All page components are lazy-loaded for performance:

```jsx
const CredentialsPage = lazy(() => import('@features/credentials/pages/CredentialsPage.jsx'));
```

Wrapped in `<Suspense>` in `App.jsx`:

```jsx
<Suspense fallback={<Loader />}>
  <AppRoutes />
</Suspense>
```

---

## API Integration

### Axios Client (`services/axiosClient.js`)

```javascript
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env?.VITE_API_URL || 'http://localhost:5000/api/',
  withCredentials: true,  // Send cookies with requests
  headers: { 'Content-Type': 'application/json' },
});

// Response interceptor for 401 handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Dispatch custom event for logout
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      // Save redirect path
      sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

### API Modules

Each feature has an API module (e.g., `features/credentials/api/credentialsApi.js`):

```javascript
import axiosClient from '@services/axiosClient';

export default {
  getAll: () => axiosClient.get('/credentials'),
  getById: (id) => axiosClient.get(`/credentials/${id}`),
  create: (data) => axiosClient.post('/credentials', data),
  update: (id, data) => axiosClient.put(`/credentials/${id}`, data),
  delete: (id) => axiosClient.delete(`/credentials/${id}`),
  verify: (data) => axiosClient.post('/credentials/verify', data),
};
```

### File Uploads

```javascript
// Upload credential with image
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'My Certificate');
formData.append('issuer', 'Coursera');

const response = await axiosClient.post('/credentials', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
```

---

## Feature Modules

### 1. Authentication (`features/auth/`)

**Pages:**
- `LoginPage.jsx` - Email/password login form
- `SignupPage.jsx` - Registration with role selection

**State:**
- `authSlice.js` - User data, loading, error

**API:**
- `authApi.js` - login(), signup(), logout(), getProfile()

### 2. Credentials (`features/credentials/`)

**Pages:**
- `CredentialsPage.jsx` - List all credentials with filters
- `AddCredentialsPage.jsx` - Upload/verify certificates (3 methods: extension, manual URL, QR code)
- `UploadMethodsGuidePage.jsx` - Instructions for verification methods

**Components:**
- `CredentialCard.jsx` - Display single credential
- `UploadCredentialForm.jsx` - Manual upload form
- `DigiLockerButton.jsx` - DigiLocker OAuth trigger
- `ExtensionPrompt.jsx` - Prompt to install browser extension

**State:**
- `credentialsSlice.js` - Credentials list, filters, pagination

**API:**
- `credentialsApi.js` - CRUD operations, verify(), verifyManual()

### 3. Verification (`features/verification/`)

**Pages:**
- `RequestsPage.jsx` - Regulator's review queue (pending credentials)
- `IssueCredentialsPage.jsx` - Manual credential issuance (admin/regulator)

**Components:**
- `VerificationQueue.jsx` - List of pending reviews
- `ReviewCard.jsx` - Single credential review UI

### 4. Jobs (`features/jobs/`)

**Pages:**
- `JobsPage.jsx` - Browse/search jobs (all users)
- `PostJobPage.jsx` - Create/edit job posting (employer only)

**Components:**
- `JobCard.jsx` - Job listing card
- `JobForm.jsx` - Job creation form

**State:**
- `jobsSlice.js` - Jobs list, filters, applications

### 5. Chat (`features/chat/`)

**Pages:**
- `ChatPage.jsx` - Real-time messaging interface

**Components:**
- `ChatList.jsx` - Conversations list
- `ChatWindow.jsx` - Message thread
- `MessageInput.jsx` - Send message input

**State:**
- `chatSlice.js` - Conversations, messages, Socket.IO state

**Real-time:**
- Uses `socketService.js` for Socket.IO connection

### 6. Notifications (`features/notifications/`)

**Pages:**
- `NotificationsPage.jsx` - Notification center

**Components:**
- `NotificationList.jsx` - List of notifications

**State:**
- `notificationsSlice.js` - Notifications list, unread count

**Real-time:**
- Receives push notifications via Socket.IO

### 7. Profile (`features/profile/`)

**Pages:**
- `ProfilePage.jsx` - User profile view/edit

**Components:**
- `ProfileHeader.jsx` - Avatar, name, bio
- `CredentialsList.jsx` - Public credentials showcase
- `EditProfileForm.jsx` - Edit profile fields

**State:**
- `profileSlice.js` - Profile data

### 8. Dashboard (`features/dashboard/`)

**Pages:**
- `DashboardPage.jsx` - Analytics & stats

**Components:**
- `StatsCard.jsx` - Metric display cards
- `ActivityChart.jsx` - Charts/graphs

**State:**
- `dashboardSlice.js` - Dashboard data

### 9. Platforms (`features/platforms/`)

**Components:**
- `PlatformCard.jsx` - Supported platform info

**State:**
- `platformsSlice.js` - List of supported platforms (from backend)

---

## Common Components

### Route Guards

**`ProtectedRoute.jsx`**
```jsx
export default function ProtectedRoute({ requiredRole }) {
  const { user } = useSelector(state => state.auth);
  
  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/home" replace />;
  }
  
  return <Outlet />;
}
```

**`PublicRoute.jsx`**
```jsx
export default function PublicRoute() {
  const { user } = useSelector(state => state.auth);
  
  if (user) return <Navigate to="/home" replace />;
  return <Outlet />;
}
```

### UI Components (`common/ui/`)

- **Button.jsx** - Reusable button with variants
- **Input.jsx** - Form input with validation
- **Card.jsx** - Container component
- **Modal.jsx** - Modal/dialog
- **Loader.jsx** - Loading spinner

### Layout Components

- **Navbar.jsx** - Top navigation bar
- **Sidebar.jsx** - Side menu (role-based links)
- **Footer.jsx** - Footer component
- **MainLayout.jsx** - Common page layout wrapper

---

## Styling System

### CSS Variables

Defined in `src/styles/index.css`:

```css
:root {
  /* Colors */
  --primary-color: #3b82f6;
  --secondary-color: #8b5cf6;
  --success-color: #10b981;
  --error-color: #ef4444;
  --warning-color: #f59e0b;
  
  /* Backgrounds */
  --bg-primary: #ffffff;
  --bg-secondary: #f3f4f6;
  --bg-dark: #1f2937;
  
  /* Text */
  --text-primary: #111827;
  --text-secondary: #6b7280;
  --text-muted: #9ca3af;
  
  /* Spacing */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  
  /* Borders */
  --border-radius: 0.5rem;
  --border-color: #e5e7eb;
}
```

### Component Styling

Each component has a scoped CSS file (e.g., `CredentialCard.css`):

```css
.credential-card {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
}
```

---

## Development Guide

### Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Environment Variables

```env
VITE_API_URL=http://localhost:5000/api/
VITE_SOCKET_URL=http://localhost:5000
VITE_APP_NAME=CredVerify
```

### Scripts

- `npm run dev` - Start development server (port 5173)
- `npm run build` - Production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding a New Feature

1. **Create feature directory**:
   ```
   src/features/myFeature/
   ├── pages/
   │   └── MyFeaturePage.jsx
   ├── components/
   │   └── MyComponent.jsx
   ├── redux/
   │   └── myFeatureSlice.js
   └── api/
       └── myFeatureApi.js
   ```

2. **Define API module** (`api/myFeatureApi.js`)
3. **Create Redux slice** (`redux/myFeatureSlice.js`)
4. **Register slice** in `app/store.js`
5. **Create page component** (`pages/MyFeaturePage.jsx`)
6. **Add route** in `app/routes.jsx`
7. **Update navigation** (Navbar/Sidebar if needed)

### Best Practices

- ✅ Use functional components + hooks (no class components)
- ✅ Keep components small and focused
- ✅ Extract reusable logic to custom hooks
- ✅ Use Redux for global state, local state for UI-only data
- ✅ Lazy-load page components
- ✅ Handle loading and error states
- ✅ Use CSS variables for theming
- ✅ Validate forms before submission
- ✅ Show user-friendly error messages

### Testing

Currently no automated tests. Recommended setup:

- **Unit tests**: Vitest + React Testing Library
- **E2E tests**: Playwright or Cypress

---

## Next Steps

- **Backend API**: See [BACKEND-ARCHITECTURE.md](./BACKEND-ARCHITECTURE.md)
- **Browser Extension**: See [EXTENSION-GUIDE.md](./EXTENSION-GUIDE.md)
- **Deployment**: See [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

---

**Last Updated**: December 4, 2025
