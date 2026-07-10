import { ApiResponse } from '../../utils/ApiResponse.js';
import { AppError } from '../../core/errors/AppError.js';
/**
 * AI Chat Controller
 * Handles chat interactions with Grok API
 */

import { asyncHandler } from '../../utils/asyncHandler.js';
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
    throw new AppError(400, 'Message is required');
  }

  // Get AI response
  const aiResponse = await aiChatService.getChatResponse(
    message,
    conversationHistory,
    userId,
  );

  console.log('=== AI Chat Controller Response ===');
  console.log('Message sent:', message);
  console.log('Response type:', typeof aiResponse);
  console.log('Response length:', aiResponse?.length);
  console.log('First 100 chars:', aiResponse?.substring(0, 100));
  console.log('Is JSON-like:', aiResponse?.trim().startsWith('{'));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        message: aiResponse,
      },
      'AI response generated successfully',
    ),
  );
});

/**
 * @desc    Get chat history for current user
 * @route   GET /api/ai-chat/history
 * @access  Private (authenticated users)
 */
export const getChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 50 } = req.query;

  const history = await aiChatService.getUserChatHistory(
    userId,
    parseInt(limit),
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        history,
      },
      'Chat history retrieved successfully',
    ),
  );
});

/**
 * @desc    Clear chat history for current user
 * @route   DELETE /api/ai-chat/history
 * @access  Private (authenticated users)
 */
export const clearChatHistory = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  await aiChatService.clearUserChatHistory(userId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Chat history cleared successfully'));
});
