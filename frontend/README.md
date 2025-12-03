# React + Vite

### 1. Folder Structure Created ✅
```
src-new/
├── app/
│   ├── App.jsx ✅
│   ├── store.js ✅
│   ├── hooks.js ✅
│   ├── rootReducer.js ✅ (template copied)
│   └── routes.jsx ✅ (template copied)
├── services/
│   ├── axiosClient.js ✅
│   └── endpoints.js ✅ (template copied)
├── features/
│   ├── auth/
│   │   ├── pages/ ✅ (LoginPage.jsx, SignupPage.jsx)
│   │   ├── redux/ ✅ (authSlice.js)
│   │   └── api/ ✅ (authApi.js template)
│   ├── home/
│   │   ├── pages/ ✅ (HomePage.jsx, LandingPage.jsx)
│   │   └── components/ ✅
│   ├── credentials/
│   │   ├── pages/ ✅ (CredentialsPage.jsx)
│   │   ├── components/ ✅
│   │   └── redux/ ✅ (dashboardSlice.js)
│   ├── profile/
│   │   ├── pages/ ✅ (UserProfilePage, EmployerProfilePage, AdminProfilePage)
│   │   ├── redux/ ✅ (profileSlice.js)
│   │   └── components/ ✅ (user/, employer/, admin/)
│   ├── jobs/
│   │   ├── pages/ ✅ (JobsListPage.jsx, PostJobPage.jsx + components)
│   │   └── redux/ ✅ (jobsSlice.js)
│   ├── chat/
│   │   ├── pages/ ✅ (ChatPage.jsx)
│   │   └── redux/ ✅ (chatSlice.js)
│   ├── settings/
│   │   └── pages/ ✅ (UserSettingsPage, EmployerSettingsPage, AdminSettingsPage)
│   └── notifications/
│       └── redux/ ✅ (notificationsSlice.js)
├── common/
│   ├── components/ ✅ (All UI components, charts, route guards)
│   ├── layouts/ ✅ (Sidebar.jsx, SettingsLayout.jsx)
│   └── hooks/ ✅ (index.js)
├── styles/
│   └── index.css ✅
└── utils/
    ├── helpers.js ✅
    ├── logger.js ✅
    ├── theme.js ✅
    ├── constants.js ✅
    ├── sanitize.js ✅
    └── env.js ✅









This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


<!-- user -->
import mongoose from "mongoose";
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  bio: String,
  profilePhoto: String,
  
  skills: [String],
  certifications: [String], // maybe old data — your new credentials will replace this

  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],

  education: [{
    institute: String,
    degree: String,
    year: String,
    gpa: String
  }],

  isPublic: { type: Boolean, default: true }

}, { timestamps: true });

// Optional: virtual relation for easy population
UserSchema.virtual('credentials', {
  ref: 'Credential',
  localField: '_id',
  foreignField: 'userId'
});

export default mongoose.model("User", UserSchema);



<!-- admin -->
import mongoose from "mongoose";
const { Schema } = mongoose;

const AdminSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  location: String,
  bio: String,
  profilePhoto: String,
  
  experience: [{
    company: String,
    role: String,
    duration: String,
    description: String
  }],

  education: [{
    institute: String,
    degree: String,
    year: String,
    gpa: String
  }],

  isPublic: { type: Boolean, default: true }

}, { timestamps: true });

// Virtual for credentials verified by this admin
AdminSchema.virtual('verifiedCredentials', {
  ref: 'Credential',
  localField: '_id',
  foreignField: 'verifiedBy'
});

export default mongoose.model("Admin", AdminSchema);


<!-- employer -->
import mongoose from "mongoose";

const EmployerSchema = new mongoose.Schema(
  {
    // Basic Info
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Company Info
    companyName: { type: String, required: true },
    website: String,
    technology: [String],

    // Contact Info
    phone: String,
    location: String,
    bio: String,
    profilePhoto: String,

    // Optional: Education & Experience
    education: [
      {
        institute: String,
        degree: String,
        year: String,
        gpa: String,
      },
    ],

    experience: [
      {
        company: String,
        role: String,
        duration: String,
        description: String,
      },
    ],

    // Dashboard Metrics
    acceptedApplicantsCount: {
      type: Number,
      default: 0,
    },
    rejectedApplicantsCount: {
      type: Number,
      default: 0,
    },

    // Visibility Control
    isPublic: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual to easily populate this employer's jobs
EmployerSchema.virtual("jobs", {
  ref: "Job",
  localField: "_id",
  foreignField: "employerId",
});

export default mongoose.model("Employer", EmployerSchema);

<!-- credentials -->
import mongoose from "mongoose";
const { Schema } = mongoose;

const CredentialSchema = new Schema({
  title: { type: String, required: true },
  description: String,
  document: String, // could be a URL to the uploaded certificate
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

  // Verification status tracking
  status: {
    type: String,
    enum: ["pending", "verified", "unverified"],
    default: "pending"
  },

  // Track which admin verified it
  verifiedBy: { type: Schema.Types.ObjectId, ref: "Admin" },
  verifiedAt: Date,

  // Optional reason if rejected/unverified
  remarks: String,

  isPublic: { type: Boolean, default: true }

}, { timestamps: true });

export default mongoose.model("Credential", CredentialSchema);

<!-- jobs -->
const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  requirements: [String],
  skills: [String],
  salaryRange: String,

  employerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employer",
    required: true
  },

  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  acceptedApplicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  rejectedApplicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],

  status: {
    type: String,
    enum: ["open", "closed"],
    default: "open"
  }

}, { timestamps: true });
