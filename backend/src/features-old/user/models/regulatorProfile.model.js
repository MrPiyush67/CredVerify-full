import mongoose from 'mongoose';

const regulatorProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    institution: {
      type: String,
      default: null,
    },
    verificationAuthorityId: {
      type: String,
      default: null,
    },
    department: {
      type: String,
      default: null,
    },
    contactEmail: {
      type: String,
      default: null,
    },
    contactPhone: {
      type: String,
      default: null,
    },
    officeLocation: {
      type: String,
      default: null,
    },
    verifiedCount: {
      type: Number,
      default: 0,
    },
    rejectedCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

const RegulatorProfile = mongoose.model(
  'RegulatorProfile',
  regulatorProfileSchema,
);

export default RegulatorProfile;
