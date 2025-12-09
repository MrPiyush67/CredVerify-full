/**
 * AI Chat Controller
 * Handles chat interactions with Grok API
 */

import { asyncHandler } from '../../core/utils/asyncHandler.js';
import { sendSuccess, sendError } from '../../core/utils/response.js';
import * as aiChatService from './aiChat.service.js';

/**
 * @desc    Send message to Grok AI and get response
 * @route   POST /api/ai-chat/message
 * @access  Private (authenticated users)
 */
export const sendMessage = asyncHandler(async (req, res) => {
  const { message, conversationHistory } = req.body;
  const userId = req.user._id;

  // Validate input
  if (!message || typeof message !== 'string' || !message.trim()) {
    return sendError(res, 400, 'Message is required');
  }

  // Get AI response
  const aiResponse = await aiChatService.getChatResponse(
    message,
    conversationHistory,
    userId
  );

  return sendSuccess(res, 200, 'AI response generated successfully', {
    message: aiResponse,
  });
});

/**
 * @desc    Get chat history for current user
 * @route   GET /api/ai-chat/history
 * @access  Private (authenticated users)
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 50 } = req.query;

  const history = await aiChatService.getUserChatHistory(userId, parseInt(limit));

  return sendSuccess(res, 200, 'Chat history retrieved successfully', {
    history,
  });
});

/**
 * @desc    Clear chat history for current user
 * @route   DELETE /api/ai-chat/history
 * @access  Private (authenticated users)
 */
export const clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await aiChatService.clearUserChatHistory(userId);

  return sendSuccess(res, 200, 'Chat history cleared successfully');
});
