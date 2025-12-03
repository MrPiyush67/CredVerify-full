import mongoose from 'mongoose';

const curatorSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    // Notification Settings
    notifications: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
      smsNotifications: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false },
      candidateMatches: { type: Boolean, default: true },
      jobExpirationAlerts: { type: Boolean, default: true },
      weeklyAnalytics: { type: Boolean, default: true },
      applicationAlerts: { type: Boolean, default: true },
    },
    // Privacy Settings
    privacy: {
      companyVisibility: {
        type: String,
        enum: ['public', 'private', 'verified-only'],
        default: 'public',
      },
      hideCompanyDetails: { type: Boolean, default: false },
      anonymousPosting: { type: Boolean, default: false },
      contactVisibility: {
        type: String,
        enum: ['public', 'verified', 'private'],
        default: 'verified',
      },
      showOnlineStatus: { type: Boolean, default: true },
      allowDirectMessages: { type: Boolean, default: true },
    },
    // Security Settings
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      loginNotifications: { type: Boolean, default: true },
      sessionTimeout: { type: String, default: '24' }, // hours
      ipWhitelist: { type: Boolean, default: false },
    },
    // Appearance Settings
    appearance: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'system',
      },
      language: { type: String, default: 'en' },
      timezone: { type: String, default: 'UTC' },
      compactView: { type: Boolean, default: false },
    },
    // Company/Employer Settings
    company: {
      showSalaryRanges: { type: Boolean, default: true },
      autoScreening: { type: Boolean, default: true },
      requireCoverLetter: { type: Boolean, default: false },
      allowApplications: { type: Boolean, default: true },
      applicationDeadline: {
        type: String,
        enum: ['auto', 'custom', 'none'],
        default: 'auto',
      },
      candidateFiltering: {
        type: String,
        enum: ['all', 'verified', 'premium'],
        default: 'verified',
      },
      interviewScheduling: { type: Boolean, default: true },
      chatAvailability: { type: Boolean, default: true },
      officeHours: {
        type: String,
        enum: ['business', 'extended', '24/7'],
        default: 'business',
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('CuratorSettings', curatorSettingsSchema);
