import mongoose from 'mongoose';

const DigilockerAccountSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true, unique: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    tokenType: { type: String },
    expiresIn: { type: Number },
    idToken: { type: String },
    userInfo: { type: Object },
    lastSyncedAt: { type: Date },
    // Cache documents to avoid URL length issues
    cachedDocuments: { type: Array },
    documentsCachedAt: { type: Date },
  },
  { timestamps: true }
);

export const DigilockerAccount = mongoose.model('DigilockerAccount', DigilockerAccountSchema);
