import mongoose from 'mongoose';
import crypto from 'crypto';

const organizationCertificateSchema = new mongoose.Schema(
  {
    // Certificate Identity
    certificateId: {
      type: String,
      required: [true, 'Certificate ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    certificateFingerprint: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    // Person Details (OCR extracted)
    recipientName: {
      type: String,
      required: [true, 'Recipient name is required'],
      index: true,
      trim: true,
    },
    normalizedName: {
      type: String,
      index: true,
    },

    // Organization Details
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      index: true,
      trim: true,
    },
    issuer: {
      type: String,
      required: [true, 'Issuer is required'],
      trim: true,
    },

    // Certificate Metadata (LLM extracted)
    courseTitle: {
      type: String,
      trim: true,
    },
    issueDate: {
      type: Date,
    },
    completionDate: {
      type: Date,
    },
    duration: {
      type: String,
    },
    learningHours: {
      type: Number,
      min: 0,
    },
    nsqfLevel: {
      type: Number,
      min: 0,
      max: 10,
    },
    skills: [{
      type: String,
      trim: true,
    }],
    description: {
      type: String,
    },

    // Files
    certificateImage: {
      url: String,
      localPath: String,
      storageId: String,
      fileName: String,
      fileType: {
        type: String,
        enum: ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'],
      },
    },

    // OCR/LLM Processing
    ocrText: {
      type: String,
    },
    llmExtractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
      index: true,
    },
    processingError: {
      type: String,
    },

    // Verification Tracking
    isVerified: {
      type: Boolean,
      default: false,
      index: true,
    },
    verificationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastVerifiedAt: {
      type: Date,
    },

    // Source Metadata
    source: {
      type: String,
      enum: ['random_generator', 'manual_upload', 'bulk_import'],
      default: 'random_generator',
    },
  },
  {
    timestamps: true,
    collection: 'organizationCertificates',
  }
);

// Compound Indexes for efficient querying
organizationCertificateSchema.index({
  normalizedName: 1,
  companyName: 1,
  certificateId: 1
});

organizationCertificateSchema.index({
  companyName: 1,
  processingStatus: 1
});

organizationCertificateSchema.index({
  processingStatus: 1,
  createdAt: 1
});

// Pre-save hook to generate fingerprint and normalize name
organizationCertificateSchema.pre('save', function(next) {
  // Generate certificate fingerprint if not exists
  if (!this.certificateFingerprint && this.certificateId && this.companyName) {
    const fingerprintData = `${this.certificateId}-${this.companyName}`;
    this.certificateFingerprint = crypto
      .createHash('sha256')
      .update(fingerprintData)
      .digest('hex');
  }

  // Normalize recipient name for matching
  if (this.recipientName && !this.normalizedName) {
    this.normalizedName = this.recipientName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  }

  next();
});

// Pre-update hook to update normalizedName when recipientName changes
organizationCertificateSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();

  // Handle different update operators
  const recipientName = update.$set?.recipientName || update.recipientName;

  if (recipientName) {
    const normalizedName = recipientName
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    if (update.$set) {
      update.$set.normalizedName = normalizedName;
    } else {
      update.normalizedName = normalizedName;
    }
  }

  next();
});

// Static method to find certificates for matching
organizationCertificateSchema.statics.findForMatching = async function(
  certificateId,
  normalizedName,
  companyName
) {
  return this.findOne({
    companyName: companyName,
    $or: [
      { certificateId: certificateId },
      { normalizedName: normalizedName, certificateId: { $exists: true } }
    ],
    processingStatus: 'processed'
  });
};

// Static method to get company list with counts
organizationCertificateSchema.statics.getCompanyList = async function() {
  return this.aggregate([
    {
      $match: {
        processingStatus: 'processed'
      }
    },
    {
      $group: {
        _id: '$companyName',
        count: { $sum: 1 },
        lastUpdated: { $max: '$updatedAt' }
      }
    },
    {
      $sort: { count: -1 }
    },
    {
      $project: {
        _id: 0,
        name: '$_id',
        count: 1,
        lastUpdated: 1
      }
    }
  ]);
};

// Static method to get pending certificates for watcher
organizationCertificateSchema.statics.getPendingForProcessing = async function(limit = 10) {
  return this.find({
    processingStatus: 'pending'
  })
    .sort({ createdAt: 1 })
    .limit(limit)
    .select('_id certificateId certificateImage createdAt companyName recipientName');
};

// Instance method to mark as processed
organizationCertificateSchema.methods.markAsProcessed = function(ocrText, extractedData) {
  this.processingStatus = 'processed';
  this.ocrText = ocrText;
  this.llmExtractedData = extractedData;
  this.processingError = null;

  // Update fields from extracted data
  if (extractedData.recipientName) this.recipientName = extractedData.recipientName;
  if (extractedData.certificateId) this.certificateId = extractedData.certificateId;
  if (extractedData.companyName) this.companyName = extractedData.companyName;
  if (extractedData.issuer) this.issuer = extractedData.issuer;
  if (extractedData.courseTitle) this.courseTitle = extractedData.courseTitle;
  if (extractedData.issueDate) this.issueDate = new Date(extractedData.issueDate);
  if (extractedData.duration) this.duration = extractedData.duration;
  if (extractedData.learningHours) this.learningHours = extractedData.learningHours;
  if (extractedData.nsqfLevel) this.nsqfLevel = extractedData.nsqfLevel;
  if (extractedData.skills) this.skills = extractedData.skills;

  return this.save();
};

// Instance method to mark as failed
organizationCertificateSchema.methods.markAsFailed = function(error) {
  this.processingStatus = 'failed';
  this.processingError = error.message || String(error);
  return this.save();
};

// Instance method to increment verification count
organizationCertificateSchema.methods.incrementVerificationCount = function() {
  this.verificationCount += 1;
  this.lastVerifiedAt = new Date();
  this.isVerified = true;
  return this.save();
};

const OrganizationCertificate = mongoose.model(
  'OrganizationCertificate',
  organizationCertificateSchema
);

export default OrganizationCertificate;
