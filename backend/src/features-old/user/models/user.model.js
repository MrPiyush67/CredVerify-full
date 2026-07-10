import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // ===== PRIMARY REQUIREMENTS =====
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      maxlength: 50,
    },
    name: {
      type: String,
      required: [true, 'Legal name is required'],
      trim: true,
      immutable: true, // Cannot be changed after initial creation
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false,
    },
    role: {
      type: String,
      enum: ['learner', 'employer', 'regulator'],
      required: [true, 'Role is required'],
      index: true,
    },

    // ===== SECONDARY REQUIREMENTS (Common to all roles) =====
    avatar: {
      type: String,
      default: null,
    },
    phoneNo: {
      type: String,
      trim: true,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: null,
    },
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        current: { type: Boolean, default: false },
      },
    ],
    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
      },
    ],
    achievements: [
      {
        title: { type: String, required: true },
        issuer: String,
        date: Date,
        description: String,
      },
    ],
    skills: [String],
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String,
      website: String,
      facebook: String,
      instagram: String,
    },
    isPublic: {
      type: Boolean,
      default: false,
      comment: 'If true, profile is visible to everyone',
    },

    // ===== SYSTEM FIELDS =====
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes
userSchema.index({ email: 1, role: 1 });
userSchema.index({ isActive: 1, role: 1 });
userSchema.index({ role: 1, institution: 1 }); // For regulator queries
userSchema.index({ role: 1, companyName: 1 }); // For employer queries

// export default mongoose.model('User', userSchema);
