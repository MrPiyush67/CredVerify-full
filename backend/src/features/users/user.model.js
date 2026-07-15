import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    // Identity
    username: {
      type: String,
      unique: true,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },

    // Authorization
    role: {
      type: String,
      enum: ['learner', 'issuer', 'regulator', 'organization_admin'],
      required: true,
      default: 'learner',
    },

    // Null for learners
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },

    // Profile
    avatar: {
      type: String,
    },
    bio: {
      type: String,
    },
    phoneNo: {
      type: String,
    },
    location: {
      type: String,
      trim: true,
    },
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      website: String,
    },

    // Learner only
    education: [
      {
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startYear: Number,
        endYear: Number,
        current: Boolean,
      },
    ],

    experience: [
      {
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
      },
    ],

    skills: [String],

    // System
    isPublic: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model('User', userSchema);

export default User;
