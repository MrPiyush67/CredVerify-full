import mongoose from 'mongoose';

const organizationSchema = new mongoose.Schema(
  {
    // Identity
    name: {
      type: String,
      required: true,
    },
    isRoot: {
      type: Boolean,
      default: false,
    },
    // university | company | training_provider | edtech | government
    type: {
      type: String,
      required: true,
    },

    logo: String,
    banner: String,

    description: String,

    website: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    // Verification
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'suspended'],
      default: 'pending',
    },

    verifiedAt: {
      type: Date,
      default: null,
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Stats
    credentialCount: {
      type: Number,
      default: 0,
    },

    memberCount: {
      type: Number,
      default: 0,
    },

    // System
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const Organization = mongoose.model('Organization', organizationSchema);

export default Organization;
