import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
  startConversation,
  getMyConversations,
  getMessages,
  sendMessage,
  sendMessageDirect,
  getUnreadCount,
} from './chat.controller.js';

const router = express.Router();

// Conversation routes
router.post('/chat/conversations', protect, startConversation);
router.get('/chat/conversations', protect, getMyConversations);
router.get('/chat/conversations/:id/messages', protect, getMessages);
router.post('/chat/conversations/:id/messages', protect, sendMessage);

// Direct message route (creates conversation if needed)
router.post('/chat/messages', protect, sendMessageDirect);

// Unread count
router.get('/chat/unread-count', protect, getUnreadCount);

export default router;
