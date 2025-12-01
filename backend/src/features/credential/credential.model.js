import mongoose from 'mongoose';

const credentialSchema = new mongoose.Schema(
  {
    credentialist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Credential title is required'],
    },
    issuer: {
      type: String,
      required: [true, 'Issuer name is required'],
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expiryDate: {
      type: Date,
    },
    credentialType: {
      type: String,
      enum: ['certificate', 'degree', 'badge', 'license', 'credential', 'micro-credential', 'other'],
      default: 'certificate',
    },
    credentialId: {
      type: String, // Certificate number or ID from issuer
      trim: true,
    },
    skills: [String], // Skills demonstrated by this credential
    description: {
      type: String,
      maxlength: 1000,
    },
    file: {
      url: String,
      fileName: String,
      fileType: String,
      uploadedAt: { type: Date, default: Date.now },
    },
    isPublic: {
      type: Boolean,
      default: false, // Only show if verified and user makes it public
    },
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
      type: String, // Notes from validant during verification
      maxlength: 500,
    },
    // Fields for micro-credentials
    hours: {
      type: Number,
      min: 0,
    },
    nsqfLevel: {
      type: Number,
      min: 1,
      max: 10,
    },
    pdfPath: {
      type: String, // Path to generated certificate PDF
    },
  },
  {
    timestamps: true,
  }
);

// Add index for faster queries
credentialSchema.index({ credentialist: 1, status: 1 });
credentialSchema.index({ status: 1, verificationRequested: 1 });

export default mongoose.model('Credential', credentialSchema);
