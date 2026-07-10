import express from 'express';
import { protect } from '../../middleware/auth.js';
import {
  sendMessage,
  getChatHistory,
  clearChatHistory,
} from './aiChat.controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/ai-chat/message
// @desc    Send message to AI and get response
// @access  Private
router.post('/message', sendMessage);

// @route   GET /api/ai-chat/history
// @desc    Get user's chat history
// @access  Private
router.get('/history', getChatHistory);

// @route   DELETE /api/ai-chat/history
// @desc    Clear user's chat history
// @access  Private
router.delete('/history', clearChatHistory);

export default router;
