import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    // Owner in your system (previously 'credentialist')
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Identity snapshot (minimal but important)
    legalNameSnapshot: {
      type: String,   // from user.name at time of save
      required: true,
    },
    certificateName: {
      type: String,   // exactly as shown on the certificate
      required: true,
    },
    nameMatchConfidence: {
      type: Number,   // 0–100
      default: 0,
    },

    // New: Weighted verification system (ChatGPT recommended)
    verificationStatus: {
      type: String,
      enum: ['VERIFIED', 'REVIEW_REQUIRED', 'REJECTED', 'PENDING'],
      default: 'PENDING',
    },
    finalVerificationScore: {
      type: Number,   // 0-100 (weighted: 60% name + 30% domain + 10% metadata)
      min: 0,
      max: 100,
    },
    autoApproved: {
      type: Boolean,
      default: false,  // true if score ≥85% and auto-verified
    },

    // Core info
    title: {
      type: String,   // course / program title
      required: true,
      trim: true,
    },
    issuer: {
      type: String,   // org name: Coursera, Unstop, College etc.
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },

    type: {
      type: String,
      enum: ['certificate', 'micro_credential', 'degree', 'other'],
      default: 'certificate',
    },
    credentialId: {
      type: String,   // certificate number / ID
      trim: true,
    },

    // Micro-credential extras (optional but small)
    nsqfLevel: {
      type: Number,   // 1–10
      min: 1,
      max: 10,
    },
    totalHours: {
      type: Number,   // lecture / learning hours
      min: 0,
    },

    // Skills + description
    skills: [String],
    description: {
      type: String,
      maxlength: 1000,
    },

    // File (image or pdf)
    file: {
      url: String,
      fileName: String,
      fileType: String,   // e.g. 'image/jpeg', 'application/pdf'
      uploadedAt: { type: Date, default: Date.now },
      storageId: String,  // e.g. ImageKit fileId
    },

    // Source + light verification
    sourceUrl: String,     // original page URL
    sourceDomain: String,  // extracted domain

    isDomainTrusted: {
      type: Boolean,
      default: false,
    },
    isIssuerVerified: {
      type: Boolean,
      default: false,      // e.g. verified via issuer's API / URL
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    // Metadata for flexible storage
    meta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // Legacy fields for backward compatibility (can be migrated to meta)
    status: {
      type: String,
      enum: ['draft', 'pending', 'verified', 'rejected'],
      default: 'draft',
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
    verificationRequested: {
      type: Boolean,
      default: false,
    },
    requestedAt: {
      type: Date,
    },
    verificationNotes: {
      type: String,
      maxlength: 500,
    },
    pdfPath: {
      type: String, // Path to generated certificate PDF
    },
  },
  { timestamps: true }
);

// Helpful indexes
credentialSchema.index({ user: 1, status: 1 });
credentialSchema.index({ user: 1, type: 1 });
credentialSchema.index({ status: 1, verificationRequested: 1 });

export default mongoose.model('Credential', credentialSchema);
