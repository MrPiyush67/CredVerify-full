import mongoose from 'mongoose';

const CREDENTIAL_TYPES = [
  'degree',
  'diploma',
  'certificate',
  'micro_credential',
  'certification',
  'badge',
  'competition',
  'award',
  'license',
  'training',
  'other',
];

const VERIFICATION_STATUS = ['pending', 'verified', 'rejected'];

const SOURCE_METHODS = [
  'qr_upload',
  'link_verification',
  'browser_extension',
  'digilocker',
  'organization_direct',
  'manual',
];

const CredentialSchema = new mongoose.Schema(
  {
    // --- Ownership ---
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    organization: {
      name: { type: String, default: '' },
      ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Organization',
        default: null,
      },
    },

    issuedBy: {
      name: { type: String, default: '' },
      ref: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    },

    // --- Core descriptive ---
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    type: { type: String, enum: CREDENTIAL_TYPES, required: true, index: true },
    imageUrl: { type: String, default: '' },
    file: {
      url: { type: String, default: '' },
      mimeType: { type: String, default: '' },
      hash: { type: String, default: '' },
    },

    // --- Credential-specific metadata ---
    credentialId: { type: String, default: '' },
    issueDate: { type: Date, required: true },
    expiryDate: { type: Date, default: null },
    credentialUrl: { type: String, default: '' },
    skills: [{ type: String }],
    grade: { type: String, default: '' },
    totalHours: { type: Number, default: null },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: null,
    },

    // --- Verification workflow ---
    verificationStatus: {
      type: String,
      enum: VERIFICATION_STATUS,
      default: 'pending',
      index: true,
    },
    verificationMethod: { type: String, default: '' },
    verifiedAt: { type: Date, default: null },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '' },
    reviewNotes: { type: String, default: '' },

    // --- Blockchain / integrity ---
    ipfsCid: { type: String, default: '' },
    blockchainTxHash: { type: String, default: '' },
    blockchainNetwork: { type: String, default: '' },

    // --- Provenance ---
    sourceMethod: { type: String, enum: SOURCE_METHODS, required: true },
    sourceMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },

    // --- Visibility / sharing ---
    isPublic: { type: Boolean, default: true },

    // --- Lifecycle ---
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const Credential = mongoose.model('credential', CredentialSchema);

export { Credential, CREDENTIAL_TYPES, VERIFICATION_STATUS, SOURCE_METHODS };
