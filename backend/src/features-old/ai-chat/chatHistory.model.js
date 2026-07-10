import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userMessage: {
    type: String,
    required: true,
  },
  aiResponse: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Index for efficient querying
chatHistorySchema.index({ user: 1, timestamp: -1 });

// Auto-delete old chat history after 30 days
chatHistorySchema.index({ timestamp: 1 }, { expireAfterSeconds: 2592000 });

const ChatHistory = mongoose.model('ChatHistory', chatHistorySchema);

export default ChatHistory;
