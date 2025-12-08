import mongoose from 'mongoose';

const regulatorSettingsSchema = new mongoose.Schema(
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
      verificationAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
      urgentNotifications: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
    },
    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'internal', 'admin-only'],
        default: 'internal',
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      trackActivity: { type: Boolean, default: true },
    },
    // Security Settings
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      loginNotifications: { type: Boolean, default: true },
      sessionTimeout: { type: String, default: '24' }, // hours
      auditLogging: { type: Boolean, default: true },
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
    // Admin-specific Settings
    admin: {
      defaultVerificationTime: { type: String, default: '48' }, // hours
      autoAssignment: { type: Boolean, default: true },
      bulkOperations: { type: Boolean, default: true },
      advancedFilters: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('RegulatorSettings', regulatorSettingsSchema);
