import mongoose from 'mongoose';

const platformProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // DSA/CP Platforms
    leetcode: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        totalSolved: Number,
        easySolved: Number,
        mediumSolved: Number,
        hardSolved: Number,
        ranking: Number,
        reputation: Number,
        streak: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    geeksforgeeks: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        problemsSolved: Number,
        codingScore: Number,
        institute: String,
        languages: [String],
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    codestudio: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        score: Number,
        problemsSolved: Number,
        streak: Number,
        contestRank: Number,
      },
      lastFetched: Date,
    },

    interviewbit: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        xp: Number,
        level: Number,
        problemsSolved: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    codechef: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        rating: Number,
        stars: String,
        globalRank: Number,
        countryRank: Number,
        fullySolved: Number,
        partiallySolved: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    codeforces: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      stats: {
        rating: Number,
        maxRating: Number,
        rank: String,
        maxRank: String,
        contribution: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    atcoder: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        rating: Number,
        highestRating: Number,
        rank: String,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    hackerrank: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        badges: [String],
        problemsSolved: Number,
      },
      lastFetched: Date,
    },

    hackerearth: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        rating: Number,
        problemsSolved: Number,
      },
      lastFetched: Date,
    },

    // Dev Portfolio Platforms
    github: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationMethod: { type: String, enum: ['oauth', 'bio'], default: 'bio' },
      verificationCode: String,
      verificationExpiry: Date,
      accessToken: String, // For OAuth
      stats: {
        repos: Number,
        followers: Number,
        following: Number,
        contributions: Number,
        topLanguages: [String],
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    gitlab: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      accessToken: String,
      stats: {
        repos: Number,
        followers: Number,
        following: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    bitbucket: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        repos: Number,
        followers: Number,
        following: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    topcoder: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        rating: Number,
        rank: String,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    interviewbit: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        xp: Number,
        level: Number,
        problemsSolved: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },

    hackerearth: {
      handle: { type: String, trim: true },
      isVerified: { type: Boolean, default: false },
      verificationCode: String,
      verificationExpiry: Date,
      stats: {
        rating: Number,
        problemsSolved: Number,
      },
      lastFetched: Date,
      pendingValidation: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

// Method to generate verification code (letters only)
platformProfileSchema.methods.generateVerificationCode = function (platform) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 24); // 24 hours to verify

  this[platform].verificationCode = code;
  this[platform].verificationExpiry = expiry;

  return code;
};

// Method to check if verification code is valid
platformProfileSchema.methods.isVerificationValid = function (platform) {
  if (!this[platform].verificationCode || !this[platform].verificationExpiry) {
    return false;
  }
  return new Date() < this[platform].verificationExpiry;
};

export default mongoose.model('PlatformProfile', platformProfileSchema);
