import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    employer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Job title is required'],
    },
    description: {
      type: String,
      required: [true, 'Job description is required'],
    },
    requirements: [String],
    location: {
      type: String,
      required: true,
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['entry', 'mid', 'senior', 'lead'],
      default: 'mid',
    },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'USD' },
    },
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    applicants: [
      {
        learner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        appliedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ['pending', 'reviewed', 'shortlisted', 'rejected'],
          default: 'pending',
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
jobSchema.index({ employer: 1, status: 1 });
jobSchema.index({ status: 1, createdAt: -1 });
jobSchema.index({ jobType: 1, experienceLevel: 1 });

const Job = mongoose.model('Job', jobSchema);

export default Job;
