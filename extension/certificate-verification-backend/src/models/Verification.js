import mongoose from 'mongoose';

const verificationSchema = new mongoose.Schema({
  personName: {
    type: String,
    required: true,
    trim: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  certificateImage: {
    type: String, // Base64 encoded image or URL
    required: true,
  },
  pageUrl: {
    type: String,
    required: true,
  },
  extractedData: {
    issuerName: String,
    verificationLink: String,
    certificateId: String,
    issueDate: String,
    courseName: String,
    programName: String,
    completionDate: String,
    skills: [String],
    rawOcrText: String,
    llmResponse: mongoose.Schema.Types.Mixed,
  },
  verificationDetails: {
    domainMatch: Boolean,
    isWhitelistedDomain: Boolean,
    companyMatchScore: Number,
    verificationErrors: [String],
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    extensionVersion: String,
  },
}, {
  timestamps: true,
});

// Index for faster queries
verificationSchema.index({ personName: 1, companyName: 1 });
verificationSchema.index({ isVerified: 1 });
verificationSchema.index({ createdAt: -1 });

const Verification = mongoose.model('Verification', verificationSchema);

export default Verification;
