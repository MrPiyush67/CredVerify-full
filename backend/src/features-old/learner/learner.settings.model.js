import mongoose from 'mongoose';

const learnerSettingsSchema = new mongoose.Schema(
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
      credentialUpdates: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      applicationAlerts: { type: Boolean, default: true },
    },
    // Privacy Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'private', 'connections'],
        default: 'public',
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      allowMessages: { type: Boolean, default: true },
      trackActivity: { type: Boolean, default: true },
      showOnlineStatus: { type: Boolean, default: true },
      allowDirectMessages: { type: Boolean, default: true },
    },
    // Security Settings
    security: {
      twoFactorAuth: { type: Boolean, default: false },
      loginNotifications: { type: Boolean, default: true },
      sessionTimeout: { type: String, default: '24' }, // hours
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('LearnerSettings', learnerSettingsSchema);
